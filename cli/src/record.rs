use warcraft3_stats_observer::ObserverData;

use crate::display::redraw;
use crate::types::{GameState, HeroSummary, PlayerState, PlayerSummary, UnitSummary};
use crate::util::result_name;
use crate::vread;

pub fn build_summary(od: &ObserverData, player_slots: &[usize]) -> Vec<PlayerSummary> {
    player_slots
        .iter()
        .map(|&slot| {
            let p = &od.players[slot];

            let hero_count = (vread!(p.hero_count) as usize).min(999);
            let heroes = p
                .heroes
                .iter()
                .take(hero_count)
                .map(|h| HeroSummary {
                    name: h.name.to_string(),
                    level: vread!(h.level),
                    xp: vread!(h.experience),
                    deaths: vread!(h.number_of_deaths),
                    total_kills: vread!(h.total_kills),
                    hero_kills: vread!(h.hero_kills),
                    building_kills: vread!(h.building_kills),
                    damage_dealt: vread!(h.damage_dealt),
                    damage_received: vread!(h.damage_received),
                    healing_done: vread!(h.healing_done),
                    time_alive_ms: vread!(h.time_alive_ms),
                })
                .collect();

            let unit_count = (vread!(p.unit_count) as usize).min(999);
            let units = p
                .units
                .iter()
                .take(unit_count)
                .filter_map(|u| {
                    let trained = vread!(u.total_amount);
                    if trained == 0 {
                        return None;
                    }
                    Some(UnitSummary {
                        name: u.name.to_string(),
                        trained,
                        alive: vread!(u.current_amount),
                        damage_dealt: vread!(u.damage_dealt),
                        damage_received: vread!(u.damage_received),
                        healing_done: vread!(u.healing_done),
                    })
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
    players: &mut [PlayerState],
    od: &ObserverData,
    player_slots: &[usize],
) {
    let summaries = build_summary(od, player_slots);
    for (i, &slot) in player_slots.iter().enumerate() {
        let p = &od.players[slot];
        players[i].result = result_name(vread!(p.game_result) as u8).to_string();

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
                .map(|s| s.heroes.iter().map(HeroSummary::from).collect())
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

    let state = GameState {
        map: map_name.to_string(),
        game: game_name.to_string(),
        duration_ms,
        players: players.to_vec(),
    };

    if let Err(e) = serde_json::to_string_pretty(&state)
        .map_err(|e| e.to_string())
        .and_then(|json| std::fs::write(filename, json).map_err(|e| e.to_string()))
    {
        redraw(&[format!("Error writing snapshot: {e}")]);
    }
}
