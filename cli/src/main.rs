mod display;
mod push;
mod record;
mod sample;
mod types;
mod util;

use std::time::Duration;

use crossterm::event::{self, Event, KeyCode, KeyEventKind, KeyModifiers};
use crossterm::{cursor, execute, terminal};
use warcraft3_stats_observer::{ObserverData, ObserverHandle, PlayerInfo};

use display::{build_game_lines, redraw};
use push::{check_auth, Pusher};
use record::write_snapshot;
use sample::{read_player_tick, PlayerTickRead};
use types::{PlayerState, PlayerSummary, ResourceSample};
use util::{build_game_id, fmt_bytes, race_name, short_map_name};

// ---------------------------------------------------------------------------
// Player type constants
// ---------------------------------------------------------------------------

const PLAYER_TYPE_HUMAN: u8 = 1;
const PLAYER_TYPE_COMPUTER: u8 = 2;
const PLAYER_SLOT_COUNT: usize = 24;

const SAMPLE_INTERVAL: Duration = Duration::from_secs(2);
/// Push every N samples. At 2s per sample this is a 10s push cadence.
const PUSH_EVERY_N_SAMPLES: u32 = 5;

// ---------------------------------------------------------------------------
// Config (read from magic-sentry.toml next to the executable)
// ---------------------------------------------------------------------------

struct Config {
    endpoint: Option<String>,
    secret: Option<String>,
}

#[derive(serde::Deserialize, Default)]
struct FileConfig {
    endpoint: Option<String>,
    secret: Option<String>,
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
        }
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn ctrl_c_exit() {
    terminal::disable_raw_mode().ok();
    std::process::exit(0);
}

fn is_ctrl_c(key: &event::KeyEvent) -> bool {
    key.code == KeyCode::Char('c') && key.modifiers.contains(KeyModifiers::CONTROL)
        || key.code == KeyCode::Char('\x03')
}

fn find_player_slots(od: &ObserverData, player_count: usize) -> Vec<usize> {
    let mut slots = Vec::with_capacity(player_count);
    for (i, player) in od.players.iter().enumerate().take(PLAYER_SLOT_COUNT) {
        if slots.len() >= player_count {
            break;
        }
        let pt = unsafe {
            std::ptr::read_unaligned(std::ptr::addr_of!(player.player_type) as *const u8)
        };
        if pt == PLAYER_TYPE_HUMAN || pt == PLAYER_TYPE_COMPUTER {
            slots.push(i);
        }
    }
    slots
}

fn is_game_over(od: &ObserverData, player_slots: &[usize]) -> bool {
    player_slots.iter().any(|&slot| {
        let result = unsafe {
            std::ptr::read_unaligned(std::ptr::addr_of!(od.players[slot].game_result) as *const u8)
        };
        matches!(result, 0..=2)
    })
}

fn sleep_or_exit(duration: Duration) {
    let deadline = std::time::Instant::now() + duration;
    loop {
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        if remaining.is_zero() {
            break;
        }
        if event::poll(remaining).unwrap_or(false) {
            if let Ok(Event::Key(key)) = event::read() {
                if is_ctrl_c(&key) {
                    ctrl_c_exit();
                }
            }
        } else {
            break;
        }
    }
}

fn init_player_state(p: &PlayerInfo) -> PlayerState {
    PlayerState {
        name: p.name.to_string(),
        race: race_name(unsafe {
            std::ptr::read_unaligned(std::ptr::addr_of!(p.player_race) as *const u8)
        })
        .to_string(),
        team: p.team_index,
        result: String::new(),
        samples: Vec::new(),
        summary: PlayerSummary {
            heroes: Vec::new(),
            units: Vec::new(),
            upgrades: Vec::new(),
        },
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
        if is_game_over(&od, &player_slots) {
            sleep_or_exit(Duration::from_secs(2));
            continue;
        }

        // -----------------------------------------------------------------------
        // Game setup — runs once per game, od is a local variable throughout.
        // -----------------------------------------------------------------------

        let map_name = short_map_name(&od.game.map_name.to_string());
        let game_name = od.game.game_name.to_string();
        let player_count = player_slots.len();

        let mut players: Vec<PlayerState> = player_slots
            .iter()
            .map(|&slot| init_player_state(&od.players[slot]))
            .collect();

        let name_race: Vec<(&str, &str)> = players
            .iter()
            .map(|p| (p.name.as_str(), p.race.as_str()))
            .collect();
        let game_id = build_game_id(&name_race, &map_name);
        let filename = format!("{game_id}.json");

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

        // -----------------------------------------------------------------------
        // Game tick loop — od is local to main(), same as the example, so LLVM
        // cannot apply noalias/readonly to it and must re-read each iteration.
        // -----------------------------------------------------------------------
        'game: loop {
            let time_ms = od.game.clock_ms as u64;

            let clock_advanced = players[0]
                .samples
                .last()
                .is_none_or(|s| time_ms > s.time_ms);

            if clock_advanced {
                frozen_ticks = 0;
            } else {
                frozen_ticks += 1;
            }

            if clock_advanced {
                // Collect raw reads for all players before committing any samples.
                let tick_reads: Vec<PlayerTickRead> = player_slots
                    .iter()
                    .map(|&slot| read_player_tick(&od.players[slot]))
                    .collect();

                // If every player returned empty heroes AND units this tick the frame
                // is likely partially corrupted (dirty read during WC3's write window).
                // Fall back to heroes/units from each player's most recent clean frame.
                let dirty_frame = tick_reads
                    .iter()
                    .all(|r| r.heroes.is_empty() && r.units.is_empty());

                for (i, r) in tick_reads.into_iter().enumerate() {
                    let (heroes, units) = if dirty_frame {
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
                        (prev_heroes, prev_units)
                    } else {
                        (r.heroes, r.units)
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
                        upgrades: r.upgrades,
                    });
                }
            }

            // Poll for background push result before redrawing.
            if let Some(p) = &mut pusher {
                p.poll();
            }

            let game_over = is_game_over(&od, &player_slots);

            let has_combat_data = players.iter().any(|p| {
                p.samples
                    .last()
                    .is_some_and(|s| !s.heroes.is_empty() || !s.units.is_empty())
            });

            redraw(&build_game_lines(
                &map_name,
                &game_name,
                time_ms,
                &filename,
                pusher.as_ref(),
                authorized_as.as_deref(),
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
            write_snapshot(
                &filename,
                &map_name,
                &game_name,
                &mut players,
                &od,
                &player_slots,
            );

            if has_combat_data && ticks.is_multiple_of(PUSH_EVERY_N_SAMPLES) {
                if let Some(p) = &mut pusher {
                    p.push(&players, &map_name, &game_name, false);
                }
            }

            if game_over {
                write_snapshot(
                    &filename,
                    &map_name,
                    &game_name,
                    &mut players,
                    &od,
                    &player_slots,
                );
                if let Some(p) = pusher.as_mut() {
                    p.push(&players, &map_name, &game_name, true);
                }
                session_bytes += pusher.as_ref().map_or(0, |p| p.total_wire_bytes);
                break 'game;
            }

            if event::poll(SAMPLE_INTERVAL).unwrap_or(false) {
                if let Ok(Event::Key(key)) = event::read() {
                    if is_ctrl_c(&key) {
                        ctrl_c_exit();
                    }
                    if key.kind == KeyEventKind::Press {
                        if let KeyCode::Char('p') = key.code {
                            write_snapshot(
                                &filename,
                                &map_name,
                                &game_name,
                                &mut players,
                                &od,
                                &player_slots,
                            );
                            if let Some(p) = pusher.as_mut() {
                                p.push(&players, &map_name, &game_name, true);
                            }
                            session_bytes += pusher.as_ref().map_or(0, |p| p.total_wire_bytes);
                            break 'game;
                        }
                    }
                }
            }

            // std::thread::sleep(Duration::from_millis(od.refresh_rate as u64));
        }
    }
}
