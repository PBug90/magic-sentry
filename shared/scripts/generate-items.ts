import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Entry {
  id: string
  name: string
  gold: number
}

const raw = readFileSync(join(__dirname, '../src/ItemBalance.json'), 'utf-8')
const { output } = JSON.parse(raw) as { output: Record<string, Entry> }

const lines: string[] = [
  "import type { ItemData } from './balance.js'",
  '',
  'export const ITEM_BY_ID: Record<string, ItemData> = {',
]

for (const [id, e] of Object.entries(output)) {
  const name = e.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  lines.push(`  ${id}: { name: '${name}', gold: ${e.gold} },`)
}

lines.push('}', '')

const outPath = join(__dirname, '../src/items.ts')
writeFileSync(outPath, lines.join('\n'), 'utf-8')
console.log(`wrote ${outPath} (${Object.keys(output).length} entries)`)
