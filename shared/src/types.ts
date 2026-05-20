import { z } from 'zod'

// ---------------------------------------------------------------------------
// Primitive constraints
// ---------------------------------------------------------------------------

export const MAX_STR = 200
export const MAX_NAME = 100
export const MAX_RACE = 20
export const MAX_RESULT = 20
export const MAX_PLAYERS = 24
export const MAX_SAMPLES_PER_PATCH = 1800 // ~1 sample / 2 s for a 1-hour game
export const MAX_HEROES = 3
export const MAX_UNITS = 200
export const MAX_UPGRADES = 100
export const MAX_ITEMS = 200
export const MAX_SEQ = 100_000
export const MAX_GAME_MS = 10_800_000 // 3 hours
export const MAX_APM = 1_000
export const MAX_RESOURCE = 10_000_000 // cumulative totals
export const MAX_FOOD = 300
export const MAX_HP_MP = 1_000_000
export const MAX_STAT = 100_000_000 // cumulative damage / healing
export const MAX_TEAM = 24
export const MAX_TOKEN_LABEL = 80
export const TOKEN_RE = /^[0-9a-f]{64}$/
export const CHANNEL_RE = /^[a-zA-Z0-9_]{1,25}$/

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const nat = (max: number) => z.number().finite().int().min(0).max(max)
const str = (max: number) => z.string().max(max)
const fcc = z.string().max(4)

// ---------------------------------------------------------------------------
// Schemas — mirrors magic-sentry-cli/src/types.rs
// ---------------------------------------------------------------------------

export const ItemSnapshotSchema = z.object({
  id: fcc,
  charges: nat(999),
})

export const AbilitySnapshotSchema = z.object({
  id: fcc,
  level: nat(10),
  damage_dealt: nat(MAX_STAT),
  healing_done: nat(MAX_STAT),
})

export const HeroSampleSchema = z.object({
  id: fcc,
  level: nat(10),
  xp: nat(MAX_STAT),
  hp: nat(MAX_HP_MP),
  hp_max: nat(MAX_HP_MP),
  mp: nat(MAX_HP_MP),
  mp_max: nat(MAX_HP_MP),
  damage_dealt: nat(MAX_STAT),
  damage_received: nat(MAX_STAT),
  healing_done: nat(MAX_STAT),
  deaths: nat(10_000),
  kills: nat(100_000),
  hero_kills: nat(10_000),
  building_kills: nat(100_000),
  abilities: z.array(AbilitySnapshotSchema).max(24),
  inventory: z.array(ItemSnapshotSchema).max(6),
})

export const UnitSnapshotSchema = z.object({
  id: fcc,
  alive: nat(10_000),
  trained: nat(100_000),
})

export const StructureSnapshotSchema = z.object({
  id: fcc,
  construction_progress: nat(100_000),
})

export const UpgradeSnapshotSchema = z.object({
  id: fcc,
  level: nat(10),
  max_level: nat(10),
})

export const PlayerItemStatSnapshotSchema = z.object({
  id: fcc,
  item_level: nat(100),
  collected: nat(MAX_RESOURCE),
  purchased: nat(MAX_RESOURCE),
  sold: nat(MAX_RESOURCE),
  used: nat(MAX_RESOURCE),
  destroyed: nat(MAX_RESOURCE),
  damage_dealt: nat(MAX_STAT),
  healing_done: nat(MAX_STAT),
})

export const SampleSchema = z.object({
  time_ms: nat(MAX_GAME_MS),
  gold: nat(MAX_RESOURCE),
  gold_mined: nat(MAX_RESOURCE),
  gold_upkeep_lost: nat(MAX_RESOURCE),
  lumber: nat(MAX_RESOURCE),
  lumber_mined: nat(MAX_RESOURCE),
  lumber_upkeep_lost: nat(MAX_RESOURCE),
  food_used: nat(MAX_FOOD),
  food_cap: nat(MAX_FOOD),
  apm: nat(MAX_APM),
  heroes: z.array(HeroSampleSchema).max(MAX_HEROES),
  units: z.array(UnitSnapshotSchema).max(MAX_UNITS),
  structures: z.array(StructureSnapshotSchema).max(MAX_UNITS).optional().default([]),
  upgrades: z.array(UpgradeSnapshotSchema).max(MAX_UPGRADES),
  player_items: z.array(PlayerItemStatSnapshotSchema).max(MAX_ITEMS),
})

export const HeroFinalSchema = z.object({
  id: fcc,
  level: nat(10),
  xp: nat(MAX_STAT),
  deaths: nat(10_000),
  total_kills: nat(100_000),
  hero_kills: nat(10_000),
  building_kills: nat(100_000),
  damage_dealt: nat(MAX_STAT),
  damage_received: nat(MAX_STAT),
  healing_done: nat(MAX_STAT),
  time_alive_ms: nat(MAX_GAME_MS),
  abilities: z.array(AbilitySnapshotSchema).max(24),
  inventory: z.array(ItemSnapshotSchema).max(6),
})

export const UnitSummarySchema = z.object({
  id: fcc,
  trained: nat(100_000),
  alive: nat(10_000),
  damage_dealt: nat(MAX_STAT),
  damage_received: nat(MAX_STAT),
  healing_done: nat(MAX_STAT),
})

export const PlayerSummarySchema = z.object({
  heroes: z.array(HeroFinalSchema).max(MAX_HEROES),
  units: z.array(UnitSummarySchema).max(MAX_UNITS),
  upgrades: z.array(UpgradeSnapshotSchema).max(MAX_UPGRADES),
})

export const PlayerRecordSchema = z.object({
  name: str(MAX_NAME).min(1),
  race: str(MAX_RACE),
  team: nat(MAX_TEAM),
  result: str(MAX_RESULT),
  samples: z.array(SampleSchema),
  summary: PlayerSummarySchema,
})

export const GameRecordSchema = z.object({
  map: str(MAX_STR),
  game: str(MAX_STR),
  duration_ms: nat(MAX_GAME_MS),
  players: z.array(PlayerRecordSchema).max(MAX_PLAYERS),
})

// ---------------------------------------------------------------------------
// Patch protocol (sent by the CLI every N seconds and on game end)
// ---------------------------------------------------------------------------

export const PlayerPatchSchema = z.object({
  name: str(MAX_NAME).min(1),
  race: str(MAX_RACE),
  team: nat(MAX_TEAM),
  /** Empty string mid-game; filled only on the final patch. */
  result: str(MAX_RESULT),
  /** Only samples collected since the previous push. */
  new_samples: z.array(SampleSchema).max(MAX_SAMPLES_PER_PATCH),
  /** null mid-game; populated on the final patch. */
  summary: PlayerSummarySchema.nullable(),
})

export const GamePatchSchema = z.object({
  /** Stable identifier for one game, matching the local JSON filename stem. */
  game_id: str(MAX_STR).min(1),
  /** Monotonically increasing; starts at 0. Used to detect dropped pushes. */
  seq: nat(MAX_SEQ),
  /** True only on game-over or manual stop. */
  is_final: z.boolean(),
  map: str(MAX_STR),
  game: str(MAX_STR),
  players: z.array(PlayerPatchSchema).min(1).max(MAX_PLAYERS),
})

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type ItemSnapshot = z.infer<typeof ItemSnapshotSchema>
export type AbilitySnapshot = z.infer<typeof AbilitySnapshotSchema>
export type HeroSample = z.infer<typeof HeroSampleSchema>
export type UnitSnapshot = z.infer<typeof UnitSnapshotSchema>
export type StructureSnapshot = z.infer<typeof StructureSnapshotSchema>
export type UpgradeSnapshot = z.infer<typeof UpgradeSnapshotSchema>
export type PlayerItemStatSnapshot = z.infer<typeof PlayerItemStatSnapshotSchema>
export type Sample = z.infer<typeof SampleSchema>
export type HeroFinal = z.infer<typeof HeroFinalSchema>
export type UnitSummary = z.infer<typeof UnitSummarySchema>
export type PlayerSummary = z.infer<typeof PlayerSummarySchema>
export type PlayerRecord = z.infer<typeof PlayerRecordSchema>
export type GameRecord = z.infer<typeof GameRecordSchema>
export type PlayerPatch = z.infer<typeof PlayerPatchSchema>
export type GamePatch = z.infer<typeof GamePatchSchema>

// Frontend-only — no validation schema needed
export type ChartPlayer = PlayerRecord & { color: string }
