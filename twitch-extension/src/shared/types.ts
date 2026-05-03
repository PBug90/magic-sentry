// ---------------------------------------------------------------------------
// Magic Sentry / Warcraft 3 Observer API JSON schema
// ---------------------------------------------------------------------------

export interface HeroSample {
  name: string
  level: number
  xp: number
  hp: number
  hp_max: number
  mp: number
  mp_max: number
  damage_dealt: number
  damage_received: number
  healing_done: number
  deaths: number
  kills: number
  hero_kills: number
  building_kills: number
}

export interface UnitSnapshot {
  name: string
  alive: number
  trained: number
}

export interface Sample {
  time_ms: number
  gold: number
  gold_mined: number
  gold_upkeep_lost: number
  lumber: number
  lumber_mined: number
  lumber_upkeep_lost: number
  food_used: number
  food_cap: number
  apm: number
  heroes: HeroSample[]
  units: UnitSnapshot[]
}

export interface HeroFinal {
  name: string
  level: number
  xp: number
  deaths: number
  total_kills: number
  hero_kills: number
  building_kills: number
  damage_dealt: number
  damage_received: number
  healing_done: number
  time_alive_ms: number
}

export interface UnitSummary {
  name: string
  trained: number
  alive: number
  damage_dealt: number
  damage_received: number
  healing_done: number
}

export interface PlayerSummary {
  heroes: HeroFinal[]
  units: UnitSummary[]
}

export interface PlayerRecord {
  name: string
  race: string
  team: number
  result: string
  time_in_upkeep_ms: number[]
  samples: Sample[]
  summary: PlayerSummary
}

export interface GameRecord {
  map: string
  game: string
  duration_ms: number
  players: PlayerRecord[]
}

export type ChartPlayer = PlayerRecord & { color: string }

// ---------------------------------------------------------------------------
// Patch protocol (mirrors the server / CLI types)
// ---------------------------------------------------------------------------

export interface PlayerPatch {
  name: string
  race: string
  team: number
  /** Empty string mid-game; filled only on the final patch. */
  result: string
  /** Only samples collected since the previous push. */
  new_samples: Sample[]
  /** null mid-game; populated on the final patch. */
  summary: PlayerSummary | null
}

export interface GamePatch {
  game_id: string
  seq: number
  is_final: boolean
  map: string
  game: string
  players: PlayerPatch[]
}

// ---------------------------------------------------------------------------
// Extension configuration stored in Twitch Configuration Service
// ---------------------------------------------------------------------------

export interface ExtensionConfig {
  endpointUrl: string
  pollIntervalSec: number
  token: string
}

export const DEFAULT_CONFIG: ExtensionConfig = {
  endpointUrl: '',
  pollIntervalSec: 5,
  token: '',
}
