import { describe, it, expect } from 'vitest'
import { parseSLK, extractUpgrades } from '../scripts/parse-upgradedata.js'

const FIXTURE = [
  'ID;PWXL;N;E',
  'B;X33;Y3;D0',
  'C;X1;Y1;K"upgradeid"',
  'C;X2;K"comments"',
  'C;X10;K"goldbase"',
  'C;X12;K"lumberbase"',
  'C;X1;Y2;K"Rhme"',
  'C;X2;K"human melee attack"',
  'C;X10;K100',
  'C;X12;K50',
].join('\n')

describe('parseSLK', () => {
  it('parses header column names into row 0', () => {
    const rows = parseSLK(FIXTURE)
    expect(rows[0][0]).toBe('upgradeid')
    expect(rows[0][1]).toBe('comments')
    expect(rows[0][9]).toBe('goldbase')
    expect(rows[0][11]).toBe('lumberbase')
  })

  it('parses data row string and numeric values', () => {
    const rows = parseSLK(FIXTURE)
    expect(rows[1][0]).toBe('Rhme')
    expect(rows[1][1]).toBe('human melee attack')
    expect(rows[1][9]).toBe(100)
    expect(rows[1][11]).toBe(50)
  })

  it('throws on invalid magic number', () => {
    expect(() => parseSLK('NOTSLK\nfoo')).toThrow('WrongMagicNumber')
  })
})

describe('extractUpgrades', () => {
  it('maps rows to UpgradeData shape keyed by upgradeid', () => {
    const rows = parseSLK(FIXTURE)
    const output = extractUpgrades(rows)
    expect(output).toEqual({
      Rhme: { id: 'Rhme', name: 'human melee attack', gold: 100, lumber: 50 },
    })
  })
})
