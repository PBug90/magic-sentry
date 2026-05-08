import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Entry {
  id: string
  name: string
  gold: number
  lumber: number
}

const raw = readFileSync(join(__dirname, '../src/UpgradeBalance.json'), 'utf-8')
const { output } = JSON.parse(raw) as { output: Record<string, Entry> }

const lines: string[] = [
  "import type { UpgradeData } from './balance.js'",
  '',
  'export const UPGRADES_TECH: Record<string, UpgradeData> = {',
]

for (const [id, e] of Object.entries(output)) {
  const name = e.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  lines.push(`  ${id}: { name: '${name}', gold: ${e.gold}, lumber: ${e.lumber} },`)
}

lines.push('}', '')

const outPath = join(__dirname, '../src/upgrades.ts')
writeFileSync(outPath, lines.join('\n'), 'utf-8')
console.log(`wrote ${outPath} (${Object.keys(output).length} entries)`)
