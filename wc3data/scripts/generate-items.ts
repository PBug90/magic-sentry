import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ITEM_DATA } from '../src/items.js'
import { emitRecords } from './_emit.js'

// Refreshes item gold cost from the parsed SLK data, merging into the
// consolidated records so hand-authored fields (name, description, category,
// stats, etc. — see merge-item-tooltips.ts) are preserved; only gold is updated.
const __dirname = dirname(fileURLToPath(import.meta.url))

interface Entry {
  name: string
  gold: number
}

const { output } = JSON.parse(
  readFileSync(join(__dirname, '../src/ItemBalance.json'), 'utf-8'),
) as { output: Record<string, Entry> }

let updated = 0
let added = 0
for (const [id, e] of Object.entries(output)) {
  const rec = (ITEM_DATA as Record<string, any>)[id]
  if (rec) {
    rec.gold = e.gold
    updated++
  } else {
    ;(ITEM_DATA as Record<string, any>)[id] = { name: e.name, gold: e.gold }
    added++
  }
}

emitRecords(
  join(__dirname, '../src/items.ts'),
  `import type { ItemEntry } from './balance.js'\n\n`,
  'ITEM_DATA',
  'ItemEntry',
  ITEM_DATA as Record<string, unknown>,
)
console.log(`items balance: ${updated} updated, ${added} added`)
