mod display;
mod push;
mod record;
mod report;
mod sample;
mod snapshot;
mod types;
mod util;

use std::time::{Duration, Instant};

use crossterm::event::{self, Event, KeyCode, KeyEventKind};
use crossterm::{cursor, execute, terminal};
use warcraft3_stats_observer::{ObserverData, ObserverHandle, PlayerInfo};

use display::{build_game_lines, ctrl_c_exit, is_ctrl_c, redraw, sleep_or_exit};
use push::{check_auth, Pusher};
use record::update_summaries;
use sample::{
    fill_upgrade_gap, find_player_slots, init_player_state, is_game_over, read_player_tick,
    PlayerTickRead,
};
use snapshot::ObserverSnapshot;
use types::{PlayerState, ResourceSample};
use util::{build_game_id, fmt_bytes, short_map_name};

const SAMPLE_INTERVAL: Duration = Duration::from_secs(2);
/// Push every N samples. At 2s per sample this is a 10s push cadence.
const PUSH_EVERY_N_SAMPLES: u32 = 5;

// ---------------------------------------------------------------------------
// Config (read from magic-sentry.toml next to the executable)
// ---------------------------------------------------------------------------

struct Config {
    endpoint: Option<String>,
    secret: Option<String>,
    generate_reports: bool,
}

#[derive(serde::Deserialize, Default)]
struct FileConfig {
    endpoint: Option<String>,
    secret: Option<String>,
    generate_reports: Option<bool>,
}

impl Config {
    fn load() -> Self {
        let file_config = std::env::current_exe()
            .ok()
            .and_then(|exe| exe.parent().map(|dir| dir.join("magic-sentry.toml")))
            .and_then(|path| std::fs::read_to_string(path).ok())
            .and_then(|contents| toml::from_str::<FileConfig>(&contents).ok())
            .unwrap_or_default();

        Config {
            endpoint: file_config.endpoint,
            secret: file_config.secret,
            generate_reports: file_config.generate_reports.unwrap_or(true),
        }
    }
}

// ---------------------------------------------------------------------------
// Game session — owns od so the shared memory handle is released on return.
// ---------------------------------------------------------------------------

fn run_game(
    od: ObserverHandle,
    player_slots: Vec<usize>,
    config: &Config,
    authorized_as: Option<&str>,
    session_bytes: usize,
) -> usize {
    // All game-state reads go through a double-read-validated local snapshot:
    // WC3 rewrites the mapping from another process, so the live data must
    // never be parsed directly (torn frames). od stays alive until return to
    // keep the mapping valid for od_ptr.
    let od_ptr: *const ObserverData = &*od;
    let player_count = player_slots.len();
    let mut snap = ObserverSnapshot::new(player_count);
    snap.capture(od_ptr, &player_slots);

    let map_name = short_map_name(&snap.game().map_name.to_string());
    let game_name = snap.game().game_name.to_string();

    let mut players: Vec<PlayerState> = (0..player_count)
        .map(|i| init_player_state(snap.player(i)))
        .collect();

    let name_race: Vec<(&str, &str)> = players
        .iter()
        .map(|p| (p.name.as_str(), p.race.as_str()))
        .collect();
    let game_id = build_game_id(&name_race, &map_name);
    let html_filename = format!("{game_id}.html");

    let mut pusher: Option<Pusher> = match (&config.endpoint, &config.secret) {
        (Some(url), Some(secret)) => Some(Pusher::new(
            url,
            &game_id,
            player_count,
            Some(secret.clone()),
        )),
        _ => None,
    };

    let mut ticks: u32 = 0;
    let mut frozen_ticks: u32 = 0;

    loop {
        // Unstable means no two consecutive reads matched (WC3 kept writing);
        // the snapshot then holds the newest, possibly torn read. Such ticks
        // are display-only: no sample is committed and game-over is not
        // evaluated, so torn data never reaches the permanent record.
        let stable = snap.capture(od_ptr, &player_slots);
        let time_ms = { snap.game().clock_ms } as u64;

        let clock_advanced = players[0]
            .samples
            .last()
            .is_none_or(|s| time_ms > s.time_ms);

        if clock_advanced {
            frozen_ticks = 0;
        } else {
            frozen_ticks += 1;
        }

        if clock_advanced && stable {
            // Collect raw reads for all players before committing any samples.
            let tick_reads: Vec<PlayerTickRead> = (0..player_count)
                .map(|i| read_player_tick(snap.player(i)))
                .collect();

            // If every player returned empty heroes AND units this tick the frame
            // is likely partially corrupted (dirty read during WC3's write window).
            // Fall back to heroes/units from each player's most recent clean frame.
            let dirty_frame = tick_reads
                .iter()
                .all(|r| r.heroes.is_empty() && r.units.is_empty());

            for (i, r) in tick_reads.into_iter().enumerate() {
                let (heroes, units, structures, upgrades) = if dirty_frame {
                    let prev_heroes = players[i]
                        .samples
                        .iter()
                        .rev()
                        .find(|s| !s.heroes.is_empty())
                        .map(|s| s.heroes.clone())
                        .unwrap_or_default();
                    let prev_units = players[i]
                        .samples
                        .iter()
                        .rev()
                        .find(|s| !s.units.is_empty())
                        .map(|s| s.units.clone())
                        .unwrap_or_default();
                    let prev_structures = players[i]
                        .samples
                        .last()
                        .map(|s| s.structures.clone())
                        .unwrap_or_default();
                    let prev_upgrades = fill_upgrade_gap(&players[i].samples, Vec::new());
                    (prev_heroes, prev_units, prev_structures, prev_upgrades)
                } else {
                    // The upgrade block alone can read empty in an otherwise
                    // clean frame; gap-fill so a partial dirty read never
                    // commits an empty upgrade list mid-game.
                    let upgrades = fill_upgrade_gap(&players[i].samples, r.upgrades);
                    (r.heroes, r.units, r.structures, upgrades)
                };

                players[i].samples.push(ResourceSample {
                    time_ms,
                    gold: r.gold,
                    gold_mined: r.gold_mined,
                    gold_upkeep_lost: r.gold_upkeep_lost,
                    lumber: r.lumber,
                    lumber_mined: r.lumber_mined,
                    lumber_upkeep_lost: r.lumber_upkeep_lost,
                    food_used: r.food_used,
                    food_cap: r.food_cap,
                    apm: r.apm,
                    heroes,
                    units,
                    structures,
                    upgrades,
                    player_items: r.player_items,
                });
            }
        }

        // Poll for background push result before redrawing.
        if let Some(p) = &mut pusher {
            p.poll();
        }

        let game_over = stable && is_game_over((0..player_count).map(|i| snap.player(i)));

        let has_combat_data = players.iter().any(|p| {
            p.samples
                .last()
                .is_some_and(|s| !s.heroes.is_empty() || !s.units.is_empty())
        });

        redraw(&build_game_lines(
            &map_name,
            &game_name,
            time_ms,
            &html_filename,
            pusher.as_ref(),
            authorized_as,
            config.endpoint.as_deref(),
            session_bytes,
            &players,
            has_combat_data,
            game_over,
            frozen_ticks,
            ticks,
            SAMPLE_INTERVAL.as_millis() as u64,
        ));

        ticks += 1;

        if has_combat_data && ticks.is_multiple_of(PUSH_EVERY_N_SAMPLES) {
            if let Some(p) = &mut pusher {
                p.push(&players, &map_name, &game_name, false);
            }
        }

        if game_over {
            let snapshot_players: Vec<&PlayerInfo> =
                (0..player_count).map(|i| snap.player(i)).collect();
            update_summaries(&mut players, &snapshot_players);
            if let Some(p) = pusher.as_mut() {
                p.push(&players, &map_name, &game_name, true);
            }
            if config.generate_reports {
                report::write_report(&html_filename, &map_name, &game_name, &players);
            }
            // od is dropped here, releasing the shared memory handle.
            return pusher.as_ref().map_or(0, |p| p.total_wire_bytes);
        }

        // Drain all pending events until SAMPLE_INTERVAL has elapsed.
        // A single event::poll/read only consumes one event; non-key events
        // (resize, focus, …) would return immediately and spin the loop at
        // full speed in release builds, causing push() to fire so rapidly
        // that result_rx is overwritten before the HTTP thread responds.
        let deadline = Instant::now() + SAMPLE_INTERVAL;
        loop {
            let remaining = deadline.saturating_duration_since(Instant::now());
            if remaining.is_zero() {
                break;
            }
            if event::poll(remaining).unwrap_or(false) {
                if let Ok(Event::Key(key)) = event::read() {
                    if is_ctrl_c(&key) {
                        ctrl_c_exit();
                    }
                    if key.kind == KeyEventKind::Press {
                        if let KeyCode::Char('p') = key.code {
                            let snapshot_players: Vec<&PlayerInfo> =
                                (0..player_count).map(|i| snap.player(i)).collect();
                            update_summaries(&mut players, &snapshot_players);
                            if let Some(p) = pusher.as_mut() {
                                p.push(&players, &map_name, &game_name, true);
                            }
                            if config.generate_reports {
                                report::write_report(
                                    &html_filename,
                                    &map_name,
                                    &game_name,
                                    &players,
                                );
                            }
                            return pusher.as_ref().map_or(0, |p| p.total_wire_bytes);
                        }
                    }
                }
            } else {
                break;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

fn main() {
    let config = Config::load();

    terminal::enable_raw_mode().ok();
    execute!(std::io::stdout(), cursor::Hide).ok();

    // Pre-flight: verify the configured secret is accepted by the server.
    let authorized_as: Option<String> = match (&config.endpoint, &config.secret) {
        (Some(endpoint), Some(secret)) => {
            redraw(&["Checking authorization...".to_string()]);
            match check_auth(endpoint, secret) {
                Ok(user) => {
                    let label = user.as_deref().unwrap_or("authorized");
                    redraw(&[format!("Authorization OK  ·  {label}")]);
                    sleep_or_exit(Duration::from_millis(800));
                    user
                }
                Err(msg) => {
                    redraw(&[
                        format!("Authorization failed: {msg}"),
                        String::new(),
                        "Check your magic-sentry.toml and try again.".to_string(),
                    ]);
                    sleep_or_exit(Duration::from_secs(6));
                    ctrl_c_exit();
                    unreachable!()
                }
            }
        }
        _ => None,
    };

    let mut session_bytes: usize = 0;

    // Outer loop: reconnect to WC3 and wait for each new game.
    loop {
        let auth_line = match (&config.endpoint, &authorized_as) {
            (Some(ep), Some(user)) => format!("Endpoint  {}  ·  {}", ep, user),
            (Some(ep), None) => format!("Endpoint  {}", ep),
            _ => String::new(),
        };
        let session_line = if session_bytes > 0 {
            format!("Session total    {}", fmt_bytes(session_bytes))
        } else {
            String::new()
        };

        let od = match ObserverHandle::new_with_refresh_rate(SAMPLE_INTERVAL) {
            Ok(od) => od,
            Err(_) => {
                redraw(&[
                    "Waiting for Warcraft III...".to_string(),
                    String::new(),
                    "Hint: if W3Champions is running, try reloading it (F5) to allow detection."
                        .to_string(),
                    auth_line,
                    session_line,
                ]);
                sleep_or_exit(Duration::from_secs(2));
                continue;
            }
        };

        if !od.game.in_game {
            redraw(&[
                "WC3 connected  ·  Waiting for a game to start...".to_string(),
                auth_line,
                session_line,
            ]);
            sleep_or_exit(Duration::from_secs(2));
            continue;
        }

        let reported_player_count = od.game.active_player_count as usize;
        let player_slots = find_player_slots(&od, reported_player_count);

        let player_count = player_slots.len();
        if player_count != 2 && player_count != 4 {
            redraw(&[
                format!(
                    "WC3 connected  ·  {player_count} players detected  ·  Only 1v1 and 2v2 are supported."
                ),
                auth_line,
                session_line,
            ]);
            sleep_or_exit(Duration::from_secs(2));
            continue;
        }

        if is_game_over(player_slots.iter().map(|&slot| &od.players[slot])) {
            sleep_or_exit(Duration::from_secs(2));
            continue;
        }

        session_bytes += run_game(
            od,
            player_slots,
            &config,
            authorized_as.as_deref(),
            session_bytes,
        );
    }
}
