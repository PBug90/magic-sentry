import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UPGRADE_DATA } from '../src/upgrades.js'
import { emitRecords } from './_emit.js'

// Merge Liquipedia-crawled upgrade tooltips (description + per-level effect
// stats) into the consolidated UPGRADE_DATA records. Name/gold/lumber stay from
// our SLK data (authoritative); only description/stats are layered on. The
// crawled source lives in upgrade-tooltips.json — gold/lumber/research-time
// stats were stripped there since cost is already shown separately. Re-runnable.
const __dirname = dirname(fileURLToPath(import.meta.url))

interface Tip {
  description?: string
  stats?: { label: string; values: string[] }[]
}

const TIPS: Record<string, Tip> = JSON.parse(
  readFileSync(join(__dirname, 'upgrade-tooltips.json'), 'utf-8'),
)

let merged = 0
const missing: string[] = []
for (const [id, tip] of Object.entries(TIPS)) {
  const rec = (UPGRADE_DATA as Record<string, any>)[id]
  if (!rec) {
    missing.push(id)
    continue
  }
  if (tip.description) rec.description = tip.description
  if (tip.stats?.length) rec.stats = tip.stats
  merged++
}

emitRecords(
  join(__dirname, '../src/upgrades.ts'),
  `import type { UpgradeEntry } from './balance.js'\n\n`,
  'UPGRADE_DATA',
  'UpgradeEntry',
  UPGRADE_DATA as Record<string, unknown>,
)
console.log(`upgrade tooltips: ${merged} merged`)
if (missing.length) console.warn(`unmatched ids: ${missing.join(', ')}`)
