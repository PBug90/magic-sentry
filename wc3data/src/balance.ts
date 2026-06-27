export interface UnitData {
  name: string
  supply: number
  gold: number
  lumber: number
}

export interface UnitStats {
  hp?: number
  armor?: number
  armorType?: string // 'Unarmored'|'Light'|'Medium'|'Heavy'|'Fortified'|'Hero'|'Divine'
  damageMin?: number
  damageMax?: number
  damageType?: string // 'Normal'|'Piercing'|'Siege'|'Magic'|'Chaos'|'Hero'|'Spells'
}

export interface HeroStats {
  primaryAttribute?: string // 'Strength'|'Agility'|'Intelligence'
  str?: number
  strGain?: number
  agi?: number
  agiGain?: number
  int?: number
  intGain?: number
  armor?: number
  damageMin?: number
  damageMax?: number
  attackRange?: string
}

export interface ItemData {
  name: string
  gold: number
}

export interface UpgradeData {
  name: string
  gold: number
  lumber: number
}

// ---------------------------------------------------------------------------
// Consolidated, hand-editable encyclopedia records. Each entity (unit, hero,
// item, upgrade, ability) is described by ONE record holding every aspect.
// The lookup maps the app consumes (UNIT_NAME_BY_ID, UNIT_STATS_BY_ID, …) are
// derived from these in enriched.ts.
// ---------------------------------------------------------------------------

export interface UnitEntry {
  // Core fields are present for every real unit/building. A handful of
  // alternate-form ids (e.g. morphed ancients) carry only stats/effect for
  // runtime lookups and omit them.
  name?: string
  supply?: number
  gold?: number
  lumber?: number
  /** Combat stats, when known. */
  stats?: UnitStats
  /** Flavour/description text. */
  effect?: string
  /** Icon asset id, only when it differs from the unit id. */
  icon?: string
  /** Redundant alternate id hidden from the encyclopedia catalog. */
  alias?: true
  /** Shown in the encyclopedia Buildings sections. */
  building?: true
  /** Fourcc ability ids this unit has. */
  abilities?: string[]
}

export interface HeroEntry {
  name: string
  supply: number
  gold: number
  lumber: number
  stats?: HeroStats
  effect?: string
  abilities?: string[]
}

export interface ItemEntry {
  name: string
  gold: number
  effect?: string
}

export interface UpgradeEntry {
  name: string
  gold: number
  lumber: number
}

export interface AbilityEntry {
  name?: string
  description?: string
  manaCost?: number
  cooldown?: number
  range?: number
  duration?: number
  damage?: number[]
  aoe?: number[]
  stats?: { label: string; values: string[] }[]
}
