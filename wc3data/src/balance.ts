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

// Item records mirror AbilityEntry: a description plus optional numeric detail
// (cooldown/duration/range/aoe/charges) and a flexible stats list. Tooltip text
// originally from Liquipedia (CC-BY-SA 3.0). `gold` stays sourced from our SLK
// data (authoritative for the game version we track).
export interface ItemEntry {
  name: string
  gold: number
  /** Tooltip prose. Supersedes the old one-line `effect`. */
  description?: string
  /** Liquipedia category: 'Permanent'|'Charged'|'Power Up'|'Artifact'|'Purchasable'|'Miscellaneous'. */
  category?: string
  /** Liquipedia item level. */
  level?: number
  /** Activation cooldown in seconds, for usable items. */
  cooldown?: number
  /** Effect duration in seconds. */
  duration?: number
  /** Cast/effect range. */
  range?: number
  /** Area of effect radius. */
  aoe?: number[]
  /** Number of charges, for charged items. */
  charges?: number
  /** Numeric bonuses/effects: attribute, armor, damage, etc. Mirrors AbilityEntry.stats. */
  stats?: { label: string; values: string[] }[]
}

export interface UpgradeEntry {
  name: string
  gold: number
  lumber: number
  /** Tooltip prose (Liquipedia, CC-BY-SA 3.0). */
  description?: string
  /** Per-level numeric effects; `values` holds one entry per research level. */
  stats?: { label: string; values: string[] }[]
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
