import type { UnitData, ItemData, UpgradeData } from './balance.js'
import { UNITS as UNITS_RAW } from './units.js'
import { ITEM_BY_ID as ITEMS_RAW } from './items.js'
import { UPGRADES_TECH as UPGRADES_RAW } from './upgrades.js'
import { UNIT_NAMES, ITEM_NAMES, UPGRADE_NAMES } from './names.js'

export const UNITS: Record<string, UnitData> = Object.fromEntries(
  Object.entries(UNITS_RAW).map(([id, data]) => [
    id,
    { ...data, name: UNIT_NAMES[id] ?? data.name },
  ]),
)

export const ITEM_BY_ID: Record<string, ItemData> = Object.fromEntries(
  Object.entries(ITEMS_RAW).map(([id, data]) => [
    id,
    { ...data, name: ITEM_NAMES[id] ?? data.name },
  ]),
)

export const UPGRADES_TECH: Record<string, UpgradeData> = Object.fromEntries(
  Object.entries(UPGRADES_RAW).map(([id, data]) => [
    id,
    { ...data, name: UPGRADE_NAMES[id] ?? data.name },
  ]),
)

/** Display name keyed by fourcc unit id (e.g. 'hfoo' → 'Footman'). */
export const UNIT_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.name]),
)

/** Supply cost keyed by fourcc unit id (e.g. 'hfoo' → 2). */
export const UNIT_SUPPLY_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.supply]),
)

/** Gold cost keyed by fourcc unit id (e.g. 'hfoo' → 135). */
export const UNIT_GOLD_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.gold]),
)

/** Lumber cost keyed by fourcc unit id (e.g. 'hfoo' → 0). */
export const UNIT_LUMBER_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.lumber]),
)

export const UPGRADE_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(UPGRADES_TECH).map(([id, u]) => [id, u.name]),
)

export const UPGRADE_GOLD_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UPGRADES_TECH).map(([id, u]) => [id, u.gold]),
)

export const UPGRADE_LUMBER_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UPGRADES_TECH).map(([id, u]) => [id, u.lumber]),
)

/** Maps unit IDs that share an icon to the ID whose asset file should be used. */
export const UNIT_ICON_BY_ID: Record<string, string> = {
  hwat: 'hwel',
  hwt2: 'hwel',
  hwt3: 'hwel',
  edcm: 'edoc',
  edtm: 'edot',
  // Night Elf ancients: observer unit IDs differ from the building icon IDs
  eaom: 'eaow', // Ancient of War
  eaoe: 'eaol', // Ancient of Lore
  eden: 'eawo', // Ancient of Wonders
  uske: 'uskw', // Skeleton Warrior (summoned by Necromancer)
}
