use warcraft3_stats_observer::ObserverData;

use crate::display::redraw;
use crate::types::{AbilitySnapshot, GameState, HeroSummary, ItemSnapshot, PlayerState, PlayerSummary, UnitSummary, UpgradeSnapshot};
use crate::util::{fourcc, result_name};

pub fn build_summary(od: &ObserverData, player_slots: &[usize]) -> Vec<PlayerSummary> {
    player_slots
        .iter()
        .map(|&slot| {
            let p = &od.players[slot];

            let hero_count = (p.hero_count as usize).min(999);
            let heroes = p
                .heroes
                .iter()
                .take(hero_count)
                .map(|h| {
                    let abilities = h
                        .ability_info
                        .iter()
                        .take((h.ability_count as usize).min(24))
                        .filter_map(|a| {
                            if a.is_hero_ability == 0 || a.level == 0 {
                                return None;
                            }
                            if a.name.to_string().trim_matches('_').trim().is_empty() {
                                return None;
                            }
                            Some(AbilitySnapshot {
                                id: fourcc(a.id),
                                level: a.level,
                                damage_dealt: a.damage_dealt,
                                healing_done: a.healing_done,
                            })
                        })
                        .collect();
                    let inventory = h
                        .items
                        .iter()
                        .take((h.item_count as usize).min(6))
                        .filter_map(|item| {
                            if item.name.to_string().trim().is_empty() { return None; }
                            Some(ItemSnapshot { id: fourcc(item.id), charges: item.charges })
                        })
                        .collect();
                    HeroSummary {
                        id: fourcc(h.id),
                        level: h.level,
                        xp: h.experience,
                        deaths: h.number_of_deaths,
                        total_kills: h.total_kills,
                        hero_kills: h.hero_kills,
                        building_kills: h.building_kills,
                        damage_dealt: h.damage_dealt,
                        damage_received: h.damage_received,
                        healing_done: h.healing_done,
                        time_alive_ms: h.time_alive_ms,
                        abilities,
                        inventory,
                    }
                })
                .collect();

            let unit_count = (p.unit_count as usize).min(999);
            let units = p
                .units
                .iter()
                .take(unit_count)
                .filter_map(|u| {
                    let trained = u.total_amount;
                    if trained == 0 {
                        return None;
                    }
                    Some(UnitSummary {
                        id: fourcc(u.id),
                        trained,
                        alive: u.current_amount,
                        damage_dealt: u.damage_dealt,
                        damage_received: u.damage_received,
                        healing_done: u.healing_done,
                    })
                })
                .collect();

            let upgrade_count = (p.upgrade_count as usize).min(999);
            let upgrades = p
                .upgrades
                .iter()
                .take(upgrade_count)
                .filter_map(|u| {
                    let level = u.current_level;
                    if level == 0 {
                        return None;
                    }
                    if u.name.to_string().trim_matches('_').trim().is_empty() {
                        return None;
                    }
                    Some(UpgradeSnapshot { id: fourcc(u.id), level, max_level: u.max_level })
                })
                .collect();

            PlayerSummary { heroes, units, upgrades }
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
        players[i].result = result_name(unsafe { std::ptr::read_unaligned(std::ptr::addr_of!(p.game_result) as *const u8) }).to_string();

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
        players[i].summary = PlayerSummary { heroes, units, upgrades: summaries[i].upgrades.clone() };
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
