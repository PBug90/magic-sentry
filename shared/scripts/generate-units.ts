import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Entry {
  displayName: string
  goldCost: number | null
  lumberCost: number | null
  foodUsed: number | null
}

const raw = readFileSync(join(__dirname, '../src/UnitBalance.json'), 'utf-8')
const { output } = JSON.parse(raw) as { output: Record<string, Entry> }

const lines: string[] = [
  "import type { UnitData } from './balance.js'",
  '',
  'export const UNITS: Record<string, UnitData> = {',
]

for (const [id, e] of Object.entries(output)) {
  const name = e.displayName.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const supply = e.foodUsed ?? 0
  const gold = e.goldCost ?? 0
  const lumber = e.lumberCost ?? 0
  lines.push(`  ${id}: { name: '${name}', supply: ${supply}, gold: ${gold}, lumber: ${lumber} },`)
}

lines.push('}', '')

const outPath = join(__dirname, '../src/units.ts')
writeFileSync(outPath, lines.join('\n'), 'utf-8')
console.log(`wrote ${outPath} (${Object.keys(output).length} entries)`)
