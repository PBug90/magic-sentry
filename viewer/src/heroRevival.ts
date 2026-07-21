// WC3 hero revival cost/time by hero level (1-10), from the Liquipedia Hero
// page "Hero Revival" table (https://liquipedia.net/warcraft/Hero). Altar
// revival costs gold and takes time (no lumber); Tavern (neutral) heroes revive
// instantly for gold + lumber. Altar time is 33s/level capped at 110s.

export interface ReviveRow {
  level: number
  altarTime: number
  altarGold: number
  tavernGold: number
  tavernLumber: number
}

export const HERO_REVIVAL: ReviveRow[] = [
  { level: 1, altarTime: 33, altarGold: 160, tavernGold: 320, tavernLumber: 80 },
  { level: 2, altarTime: 66, altarGold: 200, tavernGold: 400, tavernLumber: 100 },
  { level: 3, altarTime: 99, altarGold: 240, tavernGold: 480, tavernLumber: 120 },
  { level: 4, altarTime: 110, altarGold: 280, tavernGold: 560, tavernLumber: 140 },
  { level: 5, altarTime: 110, altarGold: 320, tavernGold: 640, tavernLumber: 160 },
  { level: 6, altarTime: 110, altarGold: 360, tavernGold: 720, tavernLumber: 180 },
  { level: 7, altarTime: 110, altarGold: 400, tavernGold: 800, tavernLumber: 200 },
  { level: 8, altarTime: 110, altarGold: 440, tavernGold: 880, tavernLumber: 220 },
  { level: 9, altarTime: 110, altarGold: 480, tavernGold: 960, tavernLumber: 240 },
  { level: 10, altarTime: 110, altarGold: 520, tavernGold: 1040, tavernLumber: 260 },
]

const clampLevel = (level: number): number => Math.max(1, Math.min(10, Math.round(level)))

/**
 * Tavern revival cost for a hero at a given level — used as the hero's "value"
 * in the army-value chart (a level-scaled proxy for the investment in a hero).
 */
export function tavernReviveCost(level: number): { gold: number; lumber: number } {
  const r = HERO_REVIVAL[clampLevel(level) - 1]
  return { gold: r.tavernGold, lumber: r.tavernLumber }
}
