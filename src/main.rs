mod display;
mod record;
mod types;
mod util;

use std::ptr;
use std::time::Duration;

use crossterm::event::{self, Event, KeyCode, KeyEventKind, KeyModifiers};
use crossterm::{cursor, execute, terminal};
use warcraft3_stats_observer::{ObserverData, ObserverHandle};

use display::{redraw, DIVIDER};
use record::write_snapshot;
use types::{HeroSample, PlayerRecord, PlayerSummary, Sample, UnitSnapshot};
use util::{fmt_time, race_str, short_map_name, vread_unaligned};

macro_rules! vread {
    ($field:expr) => {
        unsafe { vread_unaligned(ptr::addr_of!($field)) }
    };
}

fn ctrl_c_exit() {
    terminal::disable_raw_mode().ok();
    std::process::exit(0);
}

fn is_ctrl_c(key: &event::KeyEvent) -> bool {
    key.code == KeyCode::Char('c') && key.modifiers.contains(KeyModifiers::CONTROL)
        || key.code == KeyCode::Char('\x03')
}

fn is_game_over(od: &ObserverData, player_count: usize) -> bool {
    od.players.iter().take(player_count).any(|p| {
        matches!(vread!(p.game_result) as u8, 0 | 1 | 2)
    })
}

fn sleep_or_exit(duration: Duration) {
    let deadline = std::time::Instant::now() + duration;
    loop {
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        if remaining.is_zero() { break; }
        if event::poll(remaining).unwrap_or(false) {
            if let Ok(Event::Key(key)) = event::read() {
                if is_ctrl_c(&key) { ctrl_c_exit(); }
            }
        } else {
            break;
        }
    }
}

fn main() {
    terminal::enable_raw_mode().ok();
    execute!(std::io::stdout(), cursor::Hide).ok();

    loop {
        let od = match ObserverHandle::new() {
            Ok(od) => od,
            Err(_) => {
                redraw(&[
                    "Waiting for Warcraft III...".to_string(),
                    String::new(),
                    "Hint: if W3Champions is running, try reloading it (F5) to allow detection.".to_string(),
                ]);
                sleep_or_exit(Duration::from_secs(2));
                continue;
            }
        };

        if !vread!(od.game.in_game) {
            redraw(&["WC3 connected  ·  Waiting for a game to start...".to_string()]);
            sleep_or_exit(Duration::from_secs(2));
            continue; // drops od, so next iteration detects if WC3 closed
        }

        let player_count = vread!(od.game.active_player_count) as usize;
        if is_game_over(&od, player_count) {
            sleep_or_exit(Duration::from_secs(2));
            continue;
        }

        run_game(&od);
        // od is dropped here, calling UnmapViewOfFile + CloseHandle
    }
}

fn run_game(od: &ObserverData) {
    let map_name     = short_map_name(&od.game.map_name.to_string());
    let game_name    = od.game.game_name.to_string();
    let player_count = vread!(od.game.active_player_count) as usize;

    let sanitize = |s: &str| -> String {
        s.chars()
            .map(|c| if c.is_alphanumeric() || c == '-' { c } else { '_' })
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
            summary: PlayerSummary { heroes: Vec::new(), units: Vec::new() },
        })
        .collect();

    let player_slugs: String = players
        .iter()
        .map(|p| format!("{}({})", sanitize(&p.name), sanitize(&p.race)))
        .collect::<Vec<_>>()
        .join("-");
    let safe_map = sanitize(&map_name);
    let filename = format!("{epoch}-{player_slugs}-{safe_map}.json");

    let mut ticks: u32 = 0;
    let mut stale_ticks: u32 = 0;

    loop {
        let time_ms = unsafe { vread_unaligned(od.game.time_ms_ptr()) } as u64;

        let clock_advanced = players[0].samples.last().map_or(true, |s| s.time_ms != time_ms);

        if clock_advanced { stale_ticks = 0; } else { stale_ticks += 1; }

        if clock_advanced {
            for (i, p) in od.players.iter().take(player_count).enumerate() {
                let hero_count = vread!(p.hero_count) as usize;
                let heroes = p.heroes.iter().take(hero_count).map(|h| HeroSample {
                    name:            h.name.to_string(),
                    level:           vread!(h.level),
                    xp:              vread!(h.experience),
                    hp:              vread!(h.hit_points),
                    hp_max:          vread!(h.max_hit_points),
                    mp:              vread!(h.mana_points),
                    mp_max:          vread!(h.max_mana_points),
                    damage_dealt:    vread!(h.damage_dealt),
                    damage_received: vread!(h.damage_received),
                    healing_done:    vread!(h.healing_done),
                    deaths:          vread!(h.number_of_deaths),
                    kills:           vread!(h.total_kills),
                    hero_kills:      vread!(h.hero_kills),
                    building_kills:  vread!(h.building_kills),
                }).collect();

                players[i].samples.push(Sample {
                    time_ms,
                    gold:               vread!(p.gold),
                    gold_mined:         vread!(p.gold_mined),
                    gold_upkeep_lost:   vread!(p.gold_upkeep_lost),
                    lumber:             vread!(p.lumber),
                    lumber_mined:       vread!(p.lumber_mined),
                    lumber_upkeep_lost: vread!(p.lumber_upkeep_lost),
                    food_used:          vread!(p.food_used),
                    food_cap:           vread!(p.food_cap),
                    apm:                vread!(p.actions_per_minute),
                    heroes,
                    units: {
                        let unit_count = vread!(p.unit_count) as usize;
                        p.units.iter().take(unit_count)
                            .filter(|u| vread!(u.total_amount) > 0)
                            .map(|u| UnitSnapshot {
                                name:    u.name.to_string(),
                                alive:   vread!(u.current_amount),
                                trained: vread!(u.total_amount),
                            })
                            .collect()
                    },
                });
            }
        }

        let game_over = is_game_over(od, player_count);

        let mut lines: Vec<String> = Vec::new();
        lines.push(format!("Map      {map_name}"));
        lines.push(format!("Game     {game_name}"));
        lines.push(format!("Time     {}", fmt_time(time_ms)));
        lines.push(format!("Output   {filename}"));
        lines.push(String::new());
        lines.push(format!("{:<20} {:<10} {:>6}  {:>7}  {:>7}  {:>4}", "Player", "Race", "Gold", "Lumber", "Food", "APM"));
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
        if ticks % 30 == 0 {
            write_snapshot(&filename, &map_name, &game_name, &mut players, od, player_count);
        }

        if game_over {
            write_snapshot(&filename, &map_name, &game_name, &mut players, od, player_count);
            return;
        }

        if event::poll(Duration::from_secs(1)).unwrap_or(false) {
            if let Ok(Event::Key(key)) = event::read() {
                if is_ctrl_c(&key) { ctrl_c_exit(); }
                if key.kind == KeyEventKind::Press {
                    match key.code {
                        KeyCode::Char('p') => {
                            write_snapshot(&filename, &map_name, &game_name, &mut players, od, player_count);
                            return;
                        }
                        _ => {}
                    }
                }
            }
        }
    }
}
