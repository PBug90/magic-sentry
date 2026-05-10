import { describe, it, expect } from 'vitest'
import { PlayerItemStatSnapshotSchema, SampleSchema } from '../src/types.js'

describe('PlayerItemStatSnapshotSchema', () => {
  it('accepts a valid item stat snapshot', () => {
    const result = PlayerItemStatSnapshotSchema.safeParse({
      id: 'stwp',
      item_level: 2,
      collected: 0,
      purchased: 3,
      sold: 1,
      used: 2,
      destroyed: 0,
      damage_dealt: 0,
      healing_done: 450,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a negative value', () => {
    const result = PlayerItemStatSnapshotSchema.safeParse({
      id: 'stwp',
      item_level: -1,
      collected: 0,
      purchased: 0,
      sold: 0,
      used: 0,
      destroyed: 0,
      damage_dealt: 0,
      healing_done: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('SampleSchema player_items field', () => {
  it('accepts a sample with player_items', () => {
    const result = SampleSchema.safeParse({
      time_ms: 60000,
      gold: 500,
      gold_mined: 1000,
      gold_upkeep_lost: 0,
      lumber: 100,
      lumber_mined: 200,
      lumber_upkeep_lost: 0,
      food_used: 40,
      food_cap: 80,
      apm: 120,
      heroes: [],
      units: [],
      upgrades: [],
      player_items: [
        {
          id: 'stwp',
          item_level: 1,
          collected: 0,
          purchased: 2,
          sold: 0,
          used: 1,
          destroyed: 0,
          damage_dealt: 0,
          healing_done: 0,
        },
      ],
    })
    expect(result.success).toBe(true)
  })
})
