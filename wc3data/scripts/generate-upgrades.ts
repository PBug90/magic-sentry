import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UPGRADE_DATA } from '../src/upgrades.js'
import { emitRecords } from './_emit.js'

// Refreshes upgrade gold/lumber cost from the parsed SLK data, merging into the
// consolidated records so hand-authored names are preserved.
const __dirname = dirname(fileURLToPath(import.meta.url))

interface Entry {
  name: string
  gold: number
  lumber: number
}

const { output } = JSON.parse(
  readFileSync(join(__dirname, '../src/UpgradeBalance.json'), 'utf-8'),
) as { output: Record<string, Entry> }

let updated = 0
let added = 0
for (const [id, e] of Object.entries(output)) {
  const rec = (UPGRADE_DATA as Record<string, any>)[id]
  if (rec) {
    rec.gold = e.gold
    rec.lumber = e.lumber
    updated++
  } else {
    ;(UPGRADE_DATA as Record<string, any>)[id] = { name: e.name, gold: e.gold, lumber: e.lumber }
    added++
  }
}

emitRecords(
  join(__dirname, '../src/upgrades.ts'),
  `import type { UpgradeEntry } from './balance.js'\n\n`,
  'UPGRADE_DATA',
  'UpgradeEntry',
  UPGRADE_DATA as Record<string, unknown>,
)
console.log(`upgrades balance: ${updated} updated, ${added} added`)
