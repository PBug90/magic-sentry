import { describe, it, expect } from 'vitest'
import { parseSLK } from '../scripts/parse-upgradedata.js'
import { extractItems } from '../scripts/parse-itemdata.js'

const FIXTURE = [
  'ID;PWXL;N;E',
  'B;X30;Y3;D0',
  'C;X1;Y1;K"itemID"',
  'C;X2;K"comment"',
  'C;X24;K"goldcost"',
  'C;X1;Y2;K"ckng"',
  'C;X2;K"Crown of Kings +5"',
  'C;X24;K250',
].join('\n')

describe('extractItems', () => {
  it('maps rows to ItemData shape keyed by itemID', () => {
    const rows = parseSLK(FIXTURE)
    const output = extractItems(rows)
    expect(output).toEqual({
      ckng: { id: 'ckng', name: 'Crown of Kings +5', gold: 250 },
    })
  })
})
