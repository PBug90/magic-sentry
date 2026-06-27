import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseSLK, type SLKTable } from './parse-upgradedata.js'

export interface ItemEntry {
  id: string
  name: string
  gold: number
}

export function extractItems(rows: SLKTable): Record<string, ItemEntry> {
  const header = rows[0]
  const idxId = header.indexOf('itemID')
  const idxName = header.indexOf('comment')
  const idxGold = header.indexOf('goldcost')

  const output: Record<string, ItemEntry> = {}
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    const id = row[idxId]
    if (typeof id !== 'string') continue
    output[id] = {
      id,
      name: String(row[idxName] ?? ''),
      gold: Number(row[idxGold] ?? 0),
    }
  }
  return output
}

const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
  const __dirname = dirname(__filename)
  const slkPath = join(__dirname, '../slk/itemdata.slk')
  const buffer = readFileSync(slkPath, 'utf-8')
  const rows = parseSLK(buffer)
  const output = extractItems(rows)
  writeFileSync(
    join(__dirname, '../src/ItemBalance.json'),
    JSON.stringify({ output }, null, 2),
    'utf-8',
  )
  console.log(`wrote ItemBalance.json (${Object.keys(output).length} entries)`)
}
