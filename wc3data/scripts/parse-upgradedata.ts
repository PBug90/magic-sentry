import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export type SLKValue = string | number | boolean
export type SLKRow = SLKValue[]
export type SLKTable = SLKRow[]

export interface UpgradeEntry {
  id: string
  name: string
  gold: number
  lumber: number
}

export function parseSLK(buffer: string): SLKTable {
  if (!buffer.startsWith('ID')) throw new Error('WrongMagicNumber')

  const rows: SLKTable = []
  let x = 0
  let y = 0

  for (const line of buffer.split('\n')) {
    if (line[0] === 'B') continue
    for (const token of line.split(';')) {
      const op = token[0]
      const valueString = token.substring(1).trim()
      if (op === 'X') {
        x = parseInt(valueString, 10) - 1
      } else if (op === 'Y') {
        y = parseInt(valueString, 10) - 1
      } else if (op === 'K') {
        if (!rows[y]) rows[y] = []
        let value: SLKValue
        if (valueString[0] === '"') {
          value = valueString.substring(1, valueString.length - 1)
        } else if (valueString === 'TRUE') {
          value = true
        } else if (valueString === 'FALSE') {
          value = false
        } else {
          value = parseFloat(valueString)
        }
        rows[y][x] = value
      }
    }
  }

  return rows
}

export function extractUpgrades(rows: SLKTable): Record<string, UpgradeEntry> {
  const header = rows[0]
  const idxId = header.indexOf('upgradeid')
  const idxName = header.indexOf('comments')
  const idxGold = header.indexOf('goldbase')
  const idxLumber = header.indexOf('lumberbase')

  const output: Record<string, UpgradeEntry> = {}
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    const id = row[idxId]
    if (typeof id !== 'string') continue
    output[id] = {
      id,
      name: String(row[idxName] ?? ''),
      gold: Number(row[idxGold] ?? 0),
      lumber: Number(row[idxLumber] ?? 0),
    }
  }
  return output
}

const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
  const __dirname = dirname(__filename)
  const slkPath = join(__dirname, '../slk/upgradedata.slk')
  const buffer = readFileSync(slkPath, 'utf-8')
  const rows = parseSLK(buffer)
  const output = extractUpgrades(rows)
  writeFileSync(
    join(__dirname, '../src/UpgradeBalance.json'),
    JSON.stringify({ output }, null, 2),
    'utf-8',
  )
  console.log(`wrote UpgradeBalance.json (${Object.keys(output).length} entries)`)
}
