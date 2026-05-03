mod display;
mod push;
mod record;
mod types;
mod util;

use std::ptr;
use std::time::Duration;

use crossterm::event::{self, Event, KeyCode, KeyEventKind, KeyModifiers};
use crossterm::{cursor, execute, terminal};
use warcraft3_stats_observer::{ObserverData, ObserverHandle};

use display::{redraw, DIVIDER};
use push::{check_auth, PushStatus, Pusher};
use record::write_snapshot;
use types::{HeroSample, PlayerRecord, PlayerSummary, Sample, UnitSnapshot};
use util::{fmt_time, race_str, short_map_name, vread_unaligned};

macro_rules! vread {
    ($field:expr) => {
        unsafe { vread_unaligned(ptr::addr_of!($field)) }
    };
}

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

fn is_game_over(od: &ObserverData, player_count: usize) -> bool {
    od.players
        .iter()
        .take(player_count)
        .any(|p| matches!(vread!(p.game_result) as u8, 0 | 1 | 2))
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

fn fmt_bytes(n: usize) -> String {
    if n < 1024 {
        format!("{n} B")
    } else if n < 1024 * 1024 {
        format!("{:.1} KB", n as f64 / 1024.0)
    } else {
        format!("{:.1} MB", n as f64 / (1024.0 * 1024.0))
    }
}

fn fmt_push_status(status: &PushStatus) -> String {
    match status {
        PushStatus::Never => "waiting for first push...".to_string(),
        PushStatus::Ok(at, bytes) => format!(
            "ok  ({} ago)  ·  {}",
            fmt_elapsed(at.elapsed()),
            fmt_bytes(*bytes)
        ),
        PushStatus::Err(msg, at) => format!("FAILED {}  ({})", fmt_elapsed(at.elapsed()), msg),
    }
}

fn fmt_elapsed(d: Duration) -> String {
    let s = d.as_secs();
    if s < 60 {
        format!("{s}s")
    } else {
        format!("{}m{:02}s", s / 60, s % 60)
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

        let od = match ObserverHandle::new() {
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

        if !vread!(od.game.in_game) {
            redraw(&[
                "WC3 connected  ·  Waiting for a game to start...".to_string(),
                auth_line,
                session_line,
            ]);
            sleep_or_exit(Duration::from_secs(2));
            continue;
        }

        let player_count = vread!(od.game.active_player_count) as usize;
        if is_game_over(&od, player_count) {
            sleep_or_exit(Duration::from_secs(2));
            continue;
        }

        session_bytes += run_game(&od, &config, session_bytes, &authorized_as);
    }
}

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

fn run_game(
    od: &ObserverData,
    config: &Config,
    session_bytes: usize,
    authorized_as: &Option<String>,
) -> usize {
    let map_name = short_map_name(&od.game.map_name.to_string());
    let game_name = od.game.game_name.to_string();
    let player_count = vread!(od.game.active_player_count) as usize;

    let sanitize = |s: &str| -> String {
        s.chars()
            .map(|c| {
                if c.is_alphanumeric() || c == '-' {
                    c
                } else {
                    '_'
                }
            })
            .collect()
    };

    let epoch = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let mut players: Vec<PlayerRecord> = od
        .players
        .iter()
        .take(player_count)
        .map(|p| PlayerRecord {
            name: p.name.to_string(),
            race: race_str(vread!(p.player_race) as u8).to_string(),
            team: vread!(p.team_index),
            result: String::new(),
            time_in_upkeep_ms: Vec::new(),
            samples: Vec::new(),
            summary: PlayerSummary {
                heroes: Vec::new(),
                units: Vec::new(),
            },
        })
        .collect();

    let player_slugs: String = players
        .iter()
        .map(|p| format!("{}({})", sanitize(&p.name), sanitize(&p.race)))
        .collect::<Vec<_>>()
        .join("-");
    let safe_map = sanitize(&map_name);
    let game_id = format!("{epoch}-{player_slugs}-{safe_map}");
    let filename = format!("{game_id}.json");

    let mut pusher = match (&config.endpoint, &config.secret) {
        (Some(url), Some(secret)) => Some(Pusher::new(
            url,
            &game_id,
            player_count,
            Some(secret.clone()),
        )),
        _ => None,
    };

    let mut ticks: u32 = 0;
    let mut stale_ticks: u32 = 0;

    loop {
        let time_ms = unsafe { vread_unaligned(od.game.time_ms_ptr()) } as u64;

        let clock_advanced = players[0]
            .samples
            .last()
            .map_or(true, |s| s.time_ms != time_ms);

        if clock_advanced {
            stale_ticks = 0;
        } else {
            stale_ticks += 1;
        }

        if clock_advanced {
            for (i, p) in od.players.iter().take(player_count).enumerate() {
                let hero_count = vread!(p.hero_count) as usize;
                let heroes = p
                    .heroes
                    .iter()
                    .take(hero_count)
                    .map(|h| HeroSample {
                        name: h.name.to_string(),
                        level: vread!(h.level),
                        xp: vread!(h.experience),
                        hp: vread!(h.hit_points),
                        hp_max: vread!(h.max_hit_points),
                        mp: vread!(h.mana_points),
                        mp_max: vread!(h.max_mana_points),
                        damage_dealt: vread!(h.damage_dealt),
                        damage_received: vread!(h.damage_received),
                        healing_done: vread!(h.healing_done),
                        deaths: vread!(h.number_of_deaths),
                        kills: vread!(h.total_kills),
                        hero_kills: vread!(h.hero_kills),
                        building_kills: vread!(h.building_kills),
                    })
                    .collect();

                players[i].samples.push(Sample {
                    time_ms,
                    gold: vread!(p.gold),
                    gold_mined: vread!(p.gold_mined),
                    gold_upkeep_lost: vread!(p.gold_upkeep_lost),
                    lumber: vread!(p.lumber),
                    lumber_mined: vread!(p.lumber_mined),
                    lumber_upkeep_lost: vread!(p.lumber_upkeep_lost),
                    food_used: vread!(p.food_used),
                    food_cap: vread!(p.food_cap),
                    apm: vread!(p.actions_per_minute),
                    heroes,
                    units: {
                        let unit_count = vread!(p.unit_count) as usize;
                        p.units
                            .iter()
                            .take(unit_count)
                            .filter(|u| vread!(u.total_amount) > 0)
                            .map(|u| UnitSnapshot {
                                name: u.name.to_string(),
                                alive: vread!(u.current_amount),
                                trained: vread!(u.total_amount),
                            })
                            .collect()
                    },
                });
            }
        }

        // Poll for background push result before redrawing.
        if let Some(p) = &mut pusher {
            p.poll();
        }

        let game_over = is_game_over(od, player_count);

        let mut lines: Vec<String> = Vec::new();
        lines.push(format!("Map      {map_name}"));
        lines.push(format!("Game     {game_name}"));
        lines.push(format!("Time     {}", fmt_time(time_ms)));
        lines.push(format!("Output   {filename}"));
        if let Some(p) = &pusher {
            let game_total = p.total_bytes_sent;
            let user_suffix = authorized_as
                .as_deref()
                .map(|u| format!("  ·  {u}"))
                .unwrap_or_default();
            lines.push(format!(
                "Endpoint {}{}  ·  seq {}  ·  {}  ·  game {}",
                config.endpoint.as_deref().unwrap_or(""),
                user_suffix,
                p.seq(),
                fmt_push_status(&p.status),
                fmt_bytes(game_total)
            ));
            lines.push(format!(
                "Session total    {}",
                fmt_bytes(session_bytes + game_total)
            ));
        }
        lines.push(String::new());
        lines.push(format!(
            "{:<20} {:<10} {:>6}  {:>7}  {:>7}  {:>4}",
            "Player", "Race", "Gold", "Lumber", "Food", "APM"
        ));
        lines.push(DIVIDER.to_string());
        for p in &players {
            if let Some(s) = p.samples.last() {
                lines.push(format!(
                    "{:<20} {:<10} {:>6}  {:>7}  {:>3}/{:<3}  {:>4}",
                    p.name, p.race, s.gold, s.lumber, s.food_used, s.food_cap, s.apm
                ));
            }
        }
        if game_over {
            lines.push(String::new());
            lines.push("Game over.".to_string());
        }
        if stale_ticks >= 10 {
            lines.push(String::new());
            lines.push("Game appears stalled. Press [p] to stop recording.".to_string());
        }
        redraw(&lines);

        ticks += 1;
        if ticks % 5 == 0 {
            write_snapshot(
                &filename,
                &map_name,
                &game_name,
                &mut players,
                od,
                player_count,
            );
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
                od,
                player_count,
            );
            if let Some(p) = &mut pusher {
                p.push(&players, &map_name, &game_name, true);
            }
            return pusher.map_or(0, |p| p.total_bytes_sent);
        }

        if event::poll(Duration::from_secs(2)).unwrap_or(false) {
            if let Ok(Event::Key(key)) = event::read() {
                if is_ctrl_c(&key) {
                    ctrl_c_exit();
                }
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('p') => {
                            write_snapshot(
                                &filename,
                                &map_name,
                                &game_name,
                                &mut players,
                                od,
                                player_count,
                            );
                            if let Some(p) = &mut pusher {
                                p.push(&players, &map_name, &game_name, true);
                            }
                            return pusher.map_or(0, |p| p.total_bytes_sent);
                        }
                        _ => {}
                    }
                }
            }
        }
    }
}
