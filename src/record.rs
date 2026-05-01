use std::ptr;

use warcraft3_stats_observer::ObserverData;

use crate::display::redraw;
use crate::types::{
    GameRecord, HeroFinal, PlayerRecord, PlayerSummary, UnitSummary,
};
use crate::util::result_str;

pub fn build_summary(od: &ObserverData, player_count: usize) -> Vec<PlayerSummary> {
    od.players
        .iter()
        .take(player_count)
        .map(|p| {
            let hero_count = { p.hero_count } as usize;
            let heroes = p
                .heroes
                .iter()
                .take(hero_count)
                .map(|h| HeroFinal {
                    name: h.name.to_string(),
                    level: { h.level },
                    xp: { h.experience },
                    deaths: { h.number_of_deaths },
                    total_kills: { h.total_kills },
                    hero_kills: { h.hero_kills },
                    building_kills: { h.building_kills },
                    damage_dealt: { h.damage_dealt },
                    damage_received: { h.damage_received },
                    healing_done: { h.healing_done },
                    time_alive_ms: { h.time_alive_ms },
                })
                .collect();

            let unit_count = { p.unit_count } as usize;
            let units = p
                .units
                .iter()
                .take(unit_count)
                .filter(|u| { u.total_amount } > 0)
                .map(|u| UnitSummary {
                    name: u.name.to_string(),
                    trained: { u.total_amount },
                    alive: { u.current_amount },
                    damage_dealt: { u.damage_dealt },
                    damage_received: { u.damage_received },
                    healing_done: { u.healing_done },
                })
                .collect();

            PlayerSummary { heroes, units }
        })
        .collect()
}

pub fn write_snapshot(
    filename: &str,
    map_name: &str,
    game_name: &str,
    players: &mut [PlayerRecord],
    od: &ObserverData,
    player_count: usize,
) {
    let summaries = build_summary(od, player_count);
    for (i, p) in od.players.iter().take(player_count).enumerate() {
        players[i].result =
            result_str(unsafe { ptr::read_unaligned(ptr::addr_of!(p.game_result)) } as u8)
                .to_string();
        players[i].time_in_upkeep_ms = (0..10_usize)
            .map(|j| unsafe { ptr::read_unaligned(ptr::addr_of!(p.time_in_upkeep[j])) })
            .collect();

        let heroes = if !summaries[i].heroes.is_empty() {
            summaries[i].heroes.clone()
        } else {
            // WC3 cleared this player's data before game ended (loser).
            // Fall back to the last sample that contained hero data.
            players[i]
                .samples
                .iter()
                .rev()
                .find(|s| !s.heroes.is_empty())
                .map(|s| {
                    s.heroes
                        .iter()
                        .map(|h| HeroFinal {
                            name: h.name.clone(),
                            level: h.level,
                            xp: h.xp,
                            deaths: h.deaths,
                            total_kills: h.kills,
                            hero_kills: h.hero_kills,
                            building_kills: h.building_kills,
                            damage_dealt: h.damage_dealt,
                            damage_received: h.damage_received,
                            healing_done: h.healing_done,
                            time_alive_ms: 0,
                        })
                        .collect()
                })
                .unwrap_or_default()
        };
        let units = summaries[i].units.clone();
        players[i].summary = PlayerSummary { heroes, units };
    }

    let duration_ms = players
        .iter()
        .flat_map(|p| p.samples.last())
        .map(|s| s.time_ms)
        .max()
        .unwrap_or(0);

    let record = GameRecord {
        map: map_name.to_string(),
        game: game_name.to_string(),
        duration_ms,
        players: players.to_vec(),
    };

    if let Err(e) = serde_json::to_string_pretty(&record)
        .map_err(|e| e.to_string())
        .and_then(|json| std::fs::write(filename, json).map_err(|e| e.to_string()))
    {
        redraw(&[format!("Error writing snapshot: {e}")]);
    }
}
