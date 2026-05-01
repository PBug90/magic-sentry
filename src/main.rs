mod display;
mod record;
mod types;
mod util;

use std::ptr;
use std::thread;
use std::time::Duration;

use crossterm::{cursor, execute};
use warcraft3_stats_observer::{ObserverData, ObserverHandle};

use display::{redraw, DIVIDER};
use record::write_snapshot;
use types::{HeroSample, PlayerRecord, PlayerSummary, Sample, UnitSnapshot};
use util::{fmt_time, race_str, short_map_name};

fn main() {
    execute!(std::io::stdout(), cursor::Hide).ok();

    loop {
        // Acquire the shared memory region.
        let od = loop {
            match ObserverHandle::new() {
                Ok(od) => break od,
                Err(_) => redraw(&["Waiting for Warcraft III...".to_string()]),
            }
            thread::sleep(Duration::from_secs(2));
        };

        // Wait for a game to start.
        if !unsafe { ptr::read_volatile(ptr::addr_of!(od.game.in_game)) } {
            let mut ticks: u32 = 0;
            loop {
                redraw(&[format!("WC3 connected  ·  Waiting for a game to start...  [{ticks}]")]);
                thread::sleep(Duration::from_secs(1));
                ticks += 1;
                if unsafe { ptr::read_volatile(ptr::addr_of!(od.game.in_game)) } {
                    break;
                }
            }
        }

        run_game(&od);
    }
}

fn run_game(od: &ObserverData) {
    let map_name     = short_map_name(&od.game.map_name.to_string());
    let game_name    = od.game.game_name.to_string();
    let player_count = unsafe { ptr::read_volatile(ptr::addr_of!(od.game.active_player_count)) } as usize;

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
            race: race_str(unsafe { ptr::read_unaligned(ptr::addr_of!(p.player_race)) } as u8).to_string(),
            team: { p.team_index },
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

    loop {
        let time_ms = od.game.time().as_millis() as u64;

        let clock_advanced = players[0].samples.last().map_or(true, |s| s.time_ms != time_ms);

        if clock_advanced {
            for (i, p) in od.players.iter().take(player_count).enumerate() {
                let hero_count = { p.hero_count } as usize;
                let heroes = p.heroes.iter().take(hero_count).map(|h| HeroSample {
                    name:            h.name.to_string(),
                    level:           { h.level },
                    xp:              { h.experience },
                    hp:              { h.hit_points },
                    hp_max:          { h.max_hit_points },
                    mp:              { h.mana_points },
                    mp_max:          { h.max_mana_points },
                    damage_dealt:    { h.damage_dealt },
                    damage_received: { h.damage_received },
                    healing_done:    { h.healing_done },
                    deaths:          { h.number_of_deaths },
                    kills:           { h.total_kills },
                    hero_kills:      { h.hero_kills },
                    building_kills:  { h.building_kills },
                }).collect();

                players[i].samples.push(Sample {
                    time_ms,
                    gold:               { p.gold },
                    gold_mined:         { p.gold_mined },
                    gold_upkeep_lost:   { p.gold_upkeep_lost },
                    lumber:             { p.lumber },
                    lumber_mined:       { p.lumber_mined },
                    lumber_upkeep_lost: { p.lumber_upkeep_lost },
                    food_used:          { p.food_used },
                    food_cap:           { p.food_cap },
                    apm:                { p.actions_per_minute },
                    heroes,
                    units: {
                        let unit_count = { p.unit_count } as usize;
                        p.units.iter().take(unit_count)
                            .filter(|u| { u.total_amount } > 0)
                            .map(|u| UnitSnapshot {
                                name:    u.name.to_string(),
                                alive:   { u.current_amount },
                                trained: { u.total_amount },
                            })
                            .collect()
                    },
                });
            }
        }

        let game_over = od.players.iter().take(player_count).any(|p| {
            matches!(
                unsafe { ptr::read_volatile(ptr::addr_of!(p.game_result)) } as u8,
                0 | 1 | 2
            )
        });

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
        redraw(&lines);

        ticks += 1;
        if ticks % 30 == 0 {
            write_snapshot(&filename, &map_name, &game_name, &mut players, &od, player_count);
        }

        if game_over {
            write_snapshot(&filename, &map_name, &game_name, &mut players, od, player_count);
            thread::sleep(Duration::from_secs(1));
            return;
        }

        thread::sleep(Duration::from_secs(1));
    }
}
