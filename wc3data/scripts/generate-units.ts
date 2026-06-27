import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UNIT_DATA } from '../src/units.js'
import { HERO_DATA, HERO_XP_THRESHOLDS } from '../src/heroes.js'
import { emitRecords } from './_emit.js'

// Refreshes balance numbers (supply/gold/lumber) from the parsed SLK data,
// MERGING into the consolidated records so hand-authored fields (name override,
// stats, effect, icon, abilities) are preserved. New ids are appended with the
// raw SLK name for a human to refine.
const __dirname = dirname(fileURLToPath(import.meta.url))

interface Entry {
  displayName: string
  goldCost: number | null
  lumberCost: number | null
  foodUsed: number | null
}

const { output } = JSON.parse(
  readFileSync(join(__dirname, '../src/UnitBalance.json'), 'utf-8'),
) as { output: Record<string, Entry> }

let updated = 0
let added = 0
for (const [id, e] of Object.entries(output)) {
  const supply = e.foodUsed ?? 0
  const gold = e.goldCost ?? 0
  const lumber = e.lumberCost ?? 0
  const rec = (HERO_DATA as Record<string, any>)[id] ?? (UNIT_DATA as Record<string, any>)[id]
  if (rec) {
    rec.supply = supply
    rec.gold = gold
    rec.lumber = lumber
    updated++
  } else {
    ;(UNIT_DATA as Record<string, any>)[id] = { name: e.displayName, supply, gold, lumber }
    added++
  }
}

emitRecords(
  join(__dirname, '../src/units.ts'),
  `import type { UnitEntry } from './balance.js'\n\n// Units & buildings — one record per fourcc id. See UnitEntry for the fields.\n// Edit costs/stats/effect/abilities here; lookup maps are derived in enriched.ts.\n`,
  'UNIT_DATA',
  'UnitEntry',
  UNIT_DATA as Record<string, unknown>,
)
writeFileSync(
  join(__dirname, '../src/heroes.ts'),
  `import type { HeroEntry } from './balance.js'\n\n` +
    `// Cumulative XP required to reach each hero level (index = level - 1).\n` +
    `export const HERO_XP_THRESHOLDS = ${JSON.stringify(HERO_XP_THRESHOLDS)}\n\n` +
    `// Playable heroes — one record per fourcc id.\n` +
    `export const HERO_DATA: Record<string, HeroEntry> = ${JSON.stringify(HERO_DATA, null, 2)}\n\n` +
    `/** Fourcc ids of all playable heroes — the keys of HERO_DATA. */\n` +
    `export const HERO_OBSERVER_IDS = new Set(Object.keys(HERO_DATA))\n`,
)
console.log(`units/heroes balance: ${updated} updated, ${added} added`)
