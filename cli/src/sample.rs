use warcraft3_stats_observer::{
    AbilityInfo, HeroInfo, ItemInfo, ObserverData, PlayerInfo, PlayerItemInfo, StructureInfo,
    UnitInfo, UpgradeInfo,
};

use crate::types::{
    AbilitySnapshot, HeroSnapshot, ItemSnapshot, PlayerItemStatSnapshot, PlayerState,
    PlayerSummary, ResourceSample, StructureSnapshot, UnitSnapshot, UpgradeSnapshot,
};
use crate::util::{fourcc, race_name};

const PLAYER_TYPE_HUMAN: u8 = 1;
const PLAYER_TYPE_COMPUTER: u8 = 2;
const PLAYER_SLOT_COUNT: usize = 24;

pub fn find_player_slots(od: &ObserverData, player_count: usize) -> Vec<usize> {
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

pub fn is_game_over<'a>(players: impl IntoIterator<Item = &'a PlayerInfo>) -> bool {
    players.into_iter().any(|p| {
        let result =
            unsafe { std::ptr::read_unaligned(std::ptr::addr_of!(p.game_result) as *const u8) };
        matches!(result, 0..=2)
    })
}

pub fn init_player_state(p: &PlayerInfo) -> PlayerState {
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
// Per-player data read in one tick, before dirty-frame validation.
// ---------------------------------------------------------------------------

pub struct PlayerTickRead {
    pub heroes: Vec<HeroSnapshot>,
    pub units: Vec<UnitSnapshot>,
    pub structures: Vec<StructureSnapshot>,
    pub upgrades: Vec<UpgradeSnapshot>,
    pub player_items: Vec<PlayerItemStatSnapshot>,
    pub gold: u32,
    pub gold_mined: u32,
    pub gold_upkeep_lost: u32,
    pub lumber: u32,
    pub lumber_mined: u32,
    pub lumber_upkeep_lost: u32,
    pub food_used: u32,
    pub food_cap: u32,
    pub apm: u32,
}

// ---------------------------------------------------------------------------
// Mapping helpers — no loops, so noalias/readonly on params is harmless.
// ---------------------------------------------------------------------------

fn read_item_snapshot(item: &ItemInfo) -> Option<ItemSnapshot> {
    if item.name.to_string().trim().is_empty() {
        return None;
    }
    Some(ItemSnapshot {
        id: fourcc(item.id),
        charges: item.charges,
    })
}

fn read_ability_snapshot(a: &AbilityInfo) -> Option<AbilitySnapshot> {
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
}

fn read_hero_snapshot(h: &HeroInfo) -> HeroSnapshot {
    let abilities = h
        .ability_info
        .iter()
        .take((h.ability_count as usize).min(24))
        .filter_map(read_ability_snapshot)
        .collect();

    let inventory = h
        .items
        .iter()
        .take((h.item_count as usize).min(6))
        .filter_map(read_item_snapshot)
        .collect();

    HeroSnapshot {
        id: fourcc(h.id),
        level: h.level,
        xp: h.experience,
        hp: h.hit_points,
        hp_max: h.max_hit_points,
        mp: h.mana_points,
        mp_max: h.max_mana_points,
        damage_dealt: h.damage_dealt,
        damage_received: h.damage_received,
        healing_done: h.healing_done,
        deaths: h.number_of_deaths,
        kills: h.total_kills,
        hero_kills: h.hero_kills,
        building_kills: h.building_kills,
        abilities,
        inventory,
    }
}

fn read_upgrade_snapshot(u: &UpgradeInfo) -> Option<UpgradeSnapshot> {
    let level = u.current_level;
    if level == 0 || u.id == 0 {
        return None;
    }
    Some(UpgradeSnapshot {
        id: fourcc(u.id),
        level,
        max_level: u.max_level,
    })
}

fn read_structure_snapshot(s: &StructureInfo) -> Option<StructureSnapshot> {
    if s.name.to_string().trim_matches('_').trim().is_empty() {
        return None;
    }
    Some(StructureSnapshot {
        id: fourcc(unsafe { std::ptr::read_unaligned(std::ptr::addr_of!(s.id)) }),
        construction_progress: unsafe {
            std::ptr::read_unaligned(std::ptr::addr_of!(s.construction_progress))
        },
        upgrade_progress: unsafe {
            std::ptr::read_unaligned(std::ptr::addr_of!(s.upgrade_progress))
        },
    })
}

fn read_unit_snapshot(u: &UnitInfo) -> Option<UnitSnapshot> {
    let trained = u.total_amount;
    if trained == 0 {
        return None;
    }
    Some(UnitSnapshot {
        id: fourcc(u.id),
        alive: u.current_amount,
        trained,
    })
}

fn read_player_item_stat_snapshot(item: &PlayerItemInfo) -> Option<PlayerItemStatSnapshot> {
    if item.name.to_string().trim().is_empty() {
        return None;
    }
    Some(PlayerItemStatSnapshot {
        id: fourcc(item.id),
        item_level: item.item_level,
        collected: item.collected,
        purchased: item.purchased,
        sold: item.sold,
        used: item.used,
        destroyed: item.destroyed,
        damage_dealt: item.damaged_dealt,
        healing_done: item.healing_done,
    })
}

/// Upgrades are monotonic in WC3 — once researched they never disappear and a
/// level never decreases. A tick where the upgrade block reads empty while
/// earlier samples contain upgrades is a partial dirty read (WC3's write
/// window), even when heroes/units read fine; reuse the most recent non-empty
/// list instead of committing the bogus empty one.
pub fn fill_upgrade_gap(
    samples: &[ResourceSample],
    upgrades: Vec<UpgradeSnapshot>,
) -> Vec<UpgradeSnapshot> {
    if !upgrades.is_empty() {
        return upgrades;
    }
    samples
        .iter()
        .rev()
        .find(|s| !s.upgrades.is_empty())
        .map(|s| s.upgrades.clone())
        .unwrap_or_default()
}

pub fn read_player_tick(p: &PlayerInfo) -> PlayerTickRead {
    let heroes = p
        .heroes
        .iter()
        .take((p.hero_count as usize).min(999))
        .map(read_hero_snapshot)
        .collect();

    let units = p
        .units
        .iter()
        .take((p.unit_count as usize).min(999))
        .filter_map(read_unit_snapshot)
        .collect();

    let structures = p
        .structures
        .iter()
        .take((p.structure_count as usize).min(999))
        .filter_map(read_structure_snapshot)
        .collect();

    let upgrades = p
        .upgrades
        .iter()
        .take((p.upgrade_count as usize).min(999))
        .filter_map(read_upgrade_snapshot)
        .collect();

    let player_items = p
        .items
        .iter()
        .take((p.item_count as usize).min(999))
        .filter_map(read_player_item_stat_snapshot)
        .collect();

    PlayerTickRead {
        heroes,
        units,
        structures,
        upgrades,
        player_items,
        gold: p.gold,
        gold_mined: p.gold_mined,
        gold_upkeep_lost: p.gold_upkeep_lost,
        lumber: p.lumber,
        lumber_mined: p.lumber_mined,
        lumber_upkeep_lost: p.lumber_upkeep_lost,
        food_used: p.food_used,
        food_cap: p.food_cap,
        apm: p.actions_per_minute,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn upgrade(id: &str, level: u32) -> UpgradeSnapshot {
        UpgradeSnapshot {
            id: id.to_string(),
            level,
            max_level: 3,
        }
    }

    fn sample_with_upgrades(time_ms: u64, upgrades: Vec<UpgradeSnapshot>) -> ResourceSample {
        ResourceSample {
            time_ms,
            gold: 0,
            gold_mined: 0,
            gold_upkeep_lost: 0,
            lumber: 0,
            lumber_mined: 0,
            lumber_upkeep_lost: 0,
            food_used: 0,
            food_cap: 0,
            apm: 0,
            heroes: vec![],
            units: vec![],
            structures: vec![],
            upgrades,
            player_items: vec![],
        }
    }

    /// An empty upgrade read with non-empty history is a dirty frame — the
    /// last non-empty list must be carried forward.
    #[test]
    fn empty_upgrade_read_reuses_last_non_empty_list() {
        let samples = vec![
            sample_with_upgrades(1000, vec![]),
            sample_with_upgrades(2000, vec![upgrade("Rhme", 1), upgrade("Rhpt", 1)]),
            sample_with_upgrades(3000, vec![upgrade("Rhme", 2), upgrade("Rhpt", 1)]),
        ];
        let filled = fill_upgrade_gap(&samples, vec![]);
        assert_eq!(filled.len(), 2);
        assert_eq!(filled[0].id, "Rhme");
        assert_eq!(filled[0].level, 2);
        assert_eq!(filled[1].id, "Rhpt");
    }

    /// A non-empty read is trusted as-is, even if it differs from history.
    #[test]
    fn non_empty_upgrade_read_passes_through() {
        let samples = vec![sample_with_upgrades(
            1000,
            vec![upgrade("Rhme", 1), upgrade("Rhpt", 1)],
        )];
        let filled = fill_upgrade_gap(&samples, vec![upgrade("Rhme", 2)]);
        assert_eq!(filled.len(), 1);
        assert_eq!(filled[0].level, 2);
    }

    /// No upgrades researched yet — an empty read is legitimate.
    #[test]
    fn empty_upgrade_read_with_no_history_stays_empty() {
        let samples = vec![sample_with_upgrades(1000, vec![])];
        assert!(fill_upgrade_gap(&samples, vec![]).is_empty());
        assert!(fill_upgrade_gap(&[], vec![]).is_empty());
    }
}
