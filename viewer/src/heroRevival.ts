// WC3 hero revival cost/time by hero level (1-10), from Liquipedia (Altar /
// Tavern pages). Altar revival costs gold and takes time (no lumber); Tavern
// (neutral) heroes revive instantly for gold + lumber.

export interface ReviveRow {
  level: number
  altarTime: number
  altarGold: number
  tavernGold: number
  tavernLumber: number
}

export const HERO_REVIVAL: ReviveRow[] = [
  { level: 1, altarTime: 36, altarGold: 170, tavernGold: 340, tavernLumber: 80 },
  { level: 2, altarTime: 72, altarGold: 210, tavernGold: 425, tavernLumber: 100 },
  { level: 3, altarTime: 107, altarGold: 255, tavernGold: 510, tavernLumber: 120 },
  { level: 4, altarTime: 110, altarGold: 295, tavernGold: 595, tavernLumber: 140 },
  { level: 5, altarTime: 110, altarGold: 340, tavernGold: 680, tavernLumber: 160 },
  { level: 6, altarTime: 110, altarGold: 380, tavernGold: 765, tavernLumber: 180 },
  { level: 7, altarTime: 110, altarGold: 425, tavernGold: 850, tavernLumber: 200 },
  { level: 8, altarTime: 110, altarGold: 465, tavernGold: 935, tavernLumber: 220 },
  { level: 9, altarTime: 110, altarGold: 510, tavernGold: 1020, tavernLumber: 240 },
  { level: 10, altarTime: 110, altarGold: 550, tavernGold: 1105, tavernLumber: 260 },
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
