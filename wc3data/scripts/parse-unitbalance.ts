import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseSLK, type SLKTable } from './parse-upgradedata.js'

const FIELDS = {
  itemId: 'unitBalanceID',
  level: 'level',
  goldCost: 'goldcost',
  lumberCost: 'lumbercost',
  foodMade: 'fmade',
  foodUsed: 'fused',
  buildTime: 'bldtm',
  hp: 'HP',
  hpRegen: 'regenHP',
  mana: 'mana0',
  collisionSize: 'collision',
  displayName: 'comment(s)',
  defense: 'def',
  armorType: 'defType',
  dayVisionRange: 'sight',
  nightVisionRange: 'nsight',
  str: 'STR',
  int: 'INT',
  agi: 'AGI',
  primaryStat: 'Primary',
} as const

type FieldKey = keyof typeof FIELDS

const STRING_FIELDS = new Set<FieldKey>(['itemId', 'displayName', 'armorType', 'primaryStat'])

export interface UnitBalanceEntry {
  itemId: string
  level: number | null
  goldCost: number | null
  lumberCost: number | null
  foodMade: number
  foodUsed: number
  buildTime: number
  hp: number | null
  hpRegen: number | null
  mana: number | null
  collisionSize: number | null
  displayName: string | undefined
  defense: number | null
  armorType: string | undefined
  dayVisionRange: number | null
  nightVisionRange: number | null
  str: number | null
  int: number | null
  agi: number | null
  primaryStat: string | undefined
}

export function extractUnits(rows: SLKTable): Record<string, UnitBalanceEntry> {
  const headerRow = rows[0]

  const mappings = headerRow.reduce<Array<{ key: FieldKey; slot: number }>>((acc, item, ind) => {
    const foundField = (Object.keys(FIELDS) as FieldKey[]).find((field) => FIELDS[field] === item)
    if (foundField) acc.push({ key: foundField, slot: ind })
    return acc
  }, [])

  const output: Record<string, UnitBalanceEntry> = {}
  for (let i = 1; i < rows.length; i++) {
    const val = rows[i]
    if (!val) continue
    const result: Partial<Record<FieldKey, string | number | null>> = {}

    for (const mapping of mappings) {
      const raw = val[mapping.slot]
      result[mapping.key] = STRING_FIELDS.has(mapping.key)
        ? (raw as string | undefined)
        : Number.isInteger(raw)
          ? (raw as number)
          : null
    }

    if (result.foodMade === null) result.foodMade = 0
    if (result.foodUsed === null) result.foodUsed = 0
    if (result.buildTime === null) result.buildTime = 0

    if (result.itemId) output[result.itemId] = result as UnitBalanceEntry
  }
  return output
}

const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
  const __dirname = dirname(__filename)
  const slkPath = join(__dirname, '../slk/unitbalance.slk')
  const buffer = readFileSync(slkPath, 'utf-8')
  const rows = parseSLK(buffer)
  const output = extractUnits(rows)
  writeFileSync(
    join(__dirname, '../src/UnitBalance.json'),
    JSON.stringify({ output }, null, 2),
    'utf-8',
  )
  console.log(`wrote UnitBalance.json (${Object.keys(output).length} entries)`)
}
