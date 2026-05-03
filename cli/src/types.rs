use serde::Serialize;

// ---------------------------------------------------------------------------
// Per-second sample types
// ---------------------------------------------------------------------------

#[derive(Serialize, Clone)]
pub struct HeroSample {
    pub name: String,
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
}

#[derive(Serialize, Clone)]
pub struct UnitSnapshot {
    pub name: String,
    pub alive: u32,   // current_amount — units on the field right now
    pub trained: u32, // total_amount   — ever produced
}

#[derive(Serialize, Clone)]
pub struct Sample {
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
    pub heroes: Vec<HeroSample>,
    pub units: Vec<UnitSnapshot>,
}

// ---------------------------------------------------------------------------
// Snapshot / summary types (written every 30s and at end)
// ---------------------------------------------------------------------------

#[derive(Serialize, Clone)]
pub struct UnitSummary {
    pub name: String,
    pub trained: u32,
    pub alive: u32,
    pub damage_dealt: u32,
    pub damage_received: u32,
    pub healing_done: u32,
}

#[derive(Serialize, Clone)]
pub struct HeroFinal {
    pub name: String,
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
}

#[derive(Serialize, Clone)]
pub struct PlayerSummary {
    pub heroes: Vec<HeroFinal>,
    pub units: Vec<UnitSummary>,
}

#[derive(Serialize, Clone)]
pub struct PlayerRecord {
    pub name: String,
    pub race: String,
    pub team: u8,
    pub result: String,
    pub time_in_upkeep_ms: Vec<u32>,
    pub samples: Vec<Sample>,
    pub summary: PlayerSummary,
}

#[derive(Serialize, Clone)]
pub struct GameRecord {
    pub map: String,
    pub game: String,
    pub duration_ms: u64,
    pub players: Vec<PlayerRecord>,
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
    pub new_samples: Vec<Sample>,
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
