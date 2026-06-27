import type { UnitData, ItemData, UpgradeData, UnitStats, HeroStats } from './balance.js'
import { UNIT_DATA } from './units.js'
import { HERO_DATA } from './heroes.js'
import { ITEM_DATA } from './items.js'
import { UPGRADE_DATA } from './upgrades.js'

// All unit-like records (units, buildings, heroes) keyed by fourcc id. The
// per-aspect lookup maps below are derived from these so consumers keep the
// same flat-map API while the source of truth stays one-record-per-entity.
const ALL_UNITS = { ...UNIT_DATA, ...HERO_DATA }

const pick = <V>(src: Record<string, any>, field: string): Record<string, V> => {
  const out: Record<string, V> = {}
  for (const [id, rec] of Object.entries(src)) {
    const v = rec[field]
    if (v !== undefined) out[id] = v as V
  }
  return out
}

const idsWhere = (src: Record<string, any>, field: string): string[] =>
  Object.keys(src).filter((id) => src[id][field])

// --- Units / buildings / heroes (balance) ---
export const UNITS: Record<string, UnitData> = Object.fromEntries(
  Object.entries(ALL_UNITS)
    .filter(([, r]) => r.name !== undefined)
    .map(([id, r]) => [id, { name: r.name!, supply: r.supply!, gold: r.gold!, lumber: r.lumber! }]),
)

export const UNIT_NAME_BY_ID = pick<string>(ALL_UNITS, 'name')
export const UNIT_SUPPLY_BY_ID = pick<number>(ALL_UNITS, 'supply')
export const UNIT_GOLD_BY_ID = pick<number>(ALL_UNITS, 'gold')
export const UNIT_LUMBER_BY_ID = pick<number>(ALL_UNITS, 'lumber')

// --- Per-unit detail ---
export const UNIT_STATS_BY_ID = pick<UnitStats>(UNIT_DATA, 'stats')
export const UNIT_EFFECT_BY_ID = pick<string>(UNIT_DATA, 'effect')
/** Maps unit ids that share an icon to the id whose asset file should be used. */
export const UNIT_ICON_BY_ID = pick<string>(UNIT_DATA, 'icon')
/** Redundant alternate ids hidden from the encyclopedia catalog. */
export const UNIT_ALIAS_IDS = new Set(idsWhere(UNIT_DATA, 'alias'))
/** Curated building ids shown in the encyclopedia Buildings sections. */
export const BUILDING_IDS = new Set(idsWhere(UNIT_DATA, 'building'))
/** Fourcc ability ids per unit/hero id. */
export const UNIT_ABILITY_BY_ID = pick<string[]>(ALL_UNITS, 'abilities')

// --- Per-hero detail ---
export const HERO_STATS_BY_ID = pick<HeroStats>(HERO_DATA, 'stats')
export const HERO_EFFECT_BY_ID = pick<string>(HERO_DATA, 'effect')

// --- Items ---
export const ITEM_BY_ID: Record<string, ItemData> = Object.fromEntries(
  Object.entries(ITEM_DATA).map(([id, r]) => [id, { name: r.name, gold: r.gold }]),
)
export const ITEM_EFFECT_BY_ID = pick<string>(ITEM_DATA, 'effect')

// --- Upgrades ---
export const UPGRADES_TECH: Record<string, UpgradeData> = Object.fromEntries(
  Object.entries(UPGRADE_DATA).map(([id, r]) => [
    id,
    { name: r.name, gold: r.gold, lumber: r.lumber },
  ]),
)
export const UPGRADE_NAME_BY_ID = pick<string>(UPGRADE_DATA, 'name')
export const UPGRADE_GOLD_BY_ID = pick<number>(UPGRADE_DATA, 'gold')
export const UPGRADE_LUMBER_BY_ID = pick<number>(UPGRADE_DATA, 'lumber')
