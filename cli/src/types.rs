use serde::Serialize;

// ---------------------------------------------------------------------------
// Per-tick snapshot types
// ---------------------------------------------------------------------------

#[derive(Serialize, Clone)]
pub struct ItemSnapshot {
    pub id: String,
    pub charges: u32,
}

#[derive(Serialize, Clone)]
pub struct AbilitySnapshot {
    pub id: String,
    pub level: u32,
    pub damage_dealt: u32,
    pub healing_done: u32,
}

#[derive(Serialize, Clone)]
pub struct HeroSnapshot {
    pub id: String,
    pub level: u32,
    pub xp: u32,
    pub hp: u32,
    pub hp_max: u32,
    pub mp: u32,
    pub mp_max: u32,
    pub damage_dealt: u32,
    pub damage_received: u32,
    pub healing_done: u32,
    pub deaths: u32,
    pub kills: u32,
    pub hero_kills: u32,
    pub building_kills: u32,
    pub abilities: Vec<AbilitySnapshot>,
    pub inventory: Vec<ItemSnapshot>,
}

#[derive(Serialize, Clone)]
pub struct UnitSnapshot {
    pub id: String,
    pub alive: u32,   // current_amount — units on the field right now
    pub trained: u32, // total_amount   — ever produced
}

#[derive(Serialize, Clone)]
pub struct UpgradeSnapshot {
    pub id: String,
    pub level: u32,
    pub max_level: u32,
}

#[derive(Serialize, Clone)]
pub struct PlayerItemStatSnapshot {
    pub id: String,
    pub item_level: u32,
    pub collected: u32,
    pub purchased: u32,
    pub sold: u32,
    pub used: u32,
    pub destroyed: u32,
    pub damage_dealt: u32,
    pub healing_done: u32,
}

#[derive(Serialize, Clone)]
pub struct ResourceSample {
    pub time_ms: u64,
    pub gold: u32,
    pub gold_mined: u32,
    pub gold_upkeep_lost: u32,
    pub lumber: u32,
    pub lumber_mined: u32,
    pub lumber_upkeep_lost: u32,
    pub food_used: u32,
    pub food_cap: u32,
    pub apm: u32,
    pub heroes: Vec<HeroSnapshot>,
    pub units: Vec<UnitSnapshot>,
    pub upgrades: Vec<UpgradeSnapshot>,
    pub player_items: Vec<PlayerItemStatSnapshot>,
}

// ---------------------------------------------------------------------------
// End-of-game summary types
// ---------------------------------------------------------------------------

#[derive(Serialize, Clone)]
pub struct UnitSummary {
    pub id: String,
    pub trained: u32,
    pub alive: u32,
    pub damage_dealt: u32,
    pub damage_received: u32,
    pub healing_done: u32,
}

#[derive(Serialize, Clone)]
pub struct HeroSummary {
    pub id: String,
    pub level: u32,
    pub xp: u32,
    pub deaths: u32,
    pub total_kills: u32,
    pub hero_kills: u32,
    pub building_kills: u32,
    pub damage_dealt: u32,
    pub damage_received: u32,
    pub healing_done: u32,
    pub time_alive_ms: u32,
    pub abilities: Vec<AbilitySnapshot>,
    pub inventory: Vec<ItemSnapshot>,
}

impl From<&HeroSnapshot> for HeroSummary {
    fn from(h: &HeroSnapshot) -> Self {
        HeroSummary {
            id: h.id.clone(),
            level: h.level,
            xp: h.xp,
            deaths: h.deaths,
            total_kills: h.kills,
            hero_kills: h.hero_kills,
            building_kills: h.building_kills,
            damage_dealt: h.damage_dealt,
            damage_received: h.damage_received,
            healing_done: h.healing_done,
            time_alive_ms: 0, // not available from mid-game samples
            abilities: h.abilities.clone(),
            inventory: h.inventory.clone(),
        }
    }
}

#[derive(Serialize, Clone)]
pub struct PlayerSummary {
    pub heroes: Vec<HeroSummary>,
    pub units: Vec<UnitSummary>,
    pub upgrades: Vec<UpgradeSnapshot>,
}

// ---------------------------------------------------------------------------
// Accumulated per-player and per-game state
// ---------------------------------------------------------------------------

#[derive(Serialize, Clone)]
pub struct PlayerState {
    pub name: String,
    pub race: String,
    pub team: u8,
    pub result: String,
    pub samples: Vec<ResourceSample>,
    pub summary: PlayerSummary,
}

#[derive(Serialize, Clone)]
pub struct GameState {
    pub map: String,
    pub game: String,
    pub duration_ms: u64,
    pub players: Vec<PlayerState>,
}

// ---------------------------------------------------------------------------
// Incremental push types (HTTP patch protocol)
// ---------------------------------------------------------------------------

#[derive(Serialize, Clone)]
pub struct PlayerPatch {
    pub name: String,
    pub race: String,
    pub team: u8,
    /// Empty string mid-game; filled only when `GamePatch::is_final` is true.
    pub result: String,
    /// Only the samples collected since the previous push.
    pub new_samples: Vec<ResourceSample>,
    /// None mid-game; Some on the final patch.
    pub summary: Option<PlayerSummary>,
}

#[derive(Serialize, Clone)]
pub struct GamePatch {
    /// Stable across all patches for one game: `"{epoch}-{player_slugs}"`.
    /// Matches the stem of the local JSON filename for easy correlation.
    pub game_id: String,
    /// Monotonically increasing counter starting at 0.
    /// The server uses this to detect dropped pushes.
    pub seq: u32,
    /// True only on game-over or manual stop ('p').
    pub is_final: bool,
    pub map: String,
    pub game: String,
    pub players: Vec<PlayerPatch>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn player_item_stat_snapshot_serializes() {
        let snap = PlayerItemStatSnapshot {
            id: "stwp".to_string(),
            item_level: 2,
            collected: 0,
            purchased: 3,
            sold: 1,
            used: 2,
            destroyed: 0,
            damage_dealt: 0,
            healing_done: 450,
        };
        let json = serde_json::to_string(&snap).unwrap();
        assert!(json.contains("\"id\":\"stwp\""));
        assert!(json.contains("\"purchased\":3"));
        assert!(json.contains("\"healing_done\":450"));
    }
}
