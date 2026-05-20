import { describe, it, expect } from 'vitest'
import { detectTimeline } from '../src/timelineDetection.js'
import type { PlayerRecord, Sample } from '../src/types.js'

function makeSample(time_ms: number, overrides: Partial<Sample> = {}): Sample {
  return {
    time_ms,
    gold: 0,
    gold_mined: 0,
    gold_upkeep_lost: 0,
    lumber: 0,
    lumber_mined: 0,
    lumber_upkeep_lost: 0,
    food_used: 0,
    food_cap: 0,
    apm: 0,
    heroes: [],
    units: [],
    upgrades: [],
    player_items: [],
    ...overrides,
  }
}

function makePlayer(name: string, samples: Sample[]): PlayerRecord {
  return {
    name,
    race: 'Human',
    team: 0,
    result: '',
    samples,
    summary: { heroes: [], units: [], upgrades: [] },
  }
}

describe('detectTimeline — upgrades', () => {
  it('detects an upgrade completing', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { upgrades: [{ id: 'Rhme', level: 0, max_level: 3 }] }),
      makeSample(2000, { upgrades: [{ id: 'Rhme', level: 1, max_level: 3 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      player: 'leqi',
      type: 'upgrade',
      id: 'Rhme',
      level: 1,
      time_ms: 2000,
    })
  })

  it('detects each upgrade level separately', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { upgrades: [{ id: 'Rhme', level: 0, max_level: 3 }] }),
      makeSample(2000, { upgrades: [{ id: 'Rhme', level: 1, max_level: 3 }] }),
      makeSample(4000, { upgrades: [{ id: 'Rhme', level: 2, max_level: 3 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(2)
    expect(events[0].level).toBe(1)
    expect(events[1].level).toBe(2)
  })

  it('does not fire when upgrade level is unchanged', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { upgrades: [{ id: 'Rhme', level: 1, max_level: 3 }] }),
      makeSample(2000, { upgrades: [{ id: 'Rhme', level: 1, max_level: 3 }] }),
    ])
    expect(detectTimeline([p])).toHaveLength(0)
  })

  it('does not duplicate when the same upgrade level repeats across consecutive samples', () => {
    // Regression: CLI dirty-frame fallback now fills upgrade gaps so the detection
    // receives the same level in adjacent samples rather than a 0-gap. Confirm
    // that repeated level=1 entries across three samples produce exactly one event.
    const p = makePlayer('leqi', [
      makeSample(0, { upgrades: [] }),
      makeSample(2000, { upgrades: [{ id: 'Rora', level: 1, max_level: 3 }] }),
      makeSample(4000, { upgrades: [{ id: 'Rora', level: 1, max_level: 3 }] }), // dirty frame filled in
      makeSample(6000, { upgrades: [{ id: 'Rora', level: 1, max_level: 3 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ id: 'Rora', level: 1, time_ms: 2000 })
  })
})

describe('detectTimeline — expansions', () => {
  it('detects a Human expansion (second Town Hall appears in structures)', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { structures: [{ id: 'htow', construction_progress: 0 }] }),
      makeSample(2000, {
        structures: [
          { id: 'htow', construction_progress: 0 },
          { id: 'htow', construction_progress: 0 },
        ],
      }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      player: 'leqi',
      type: 'expansion',
      id: 'htow',
      time_ms: 2000,
    })
  })

  it('does not fire as expansion when Town Hall is upgraded to Keep (hall count unchanged)', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { structures: [{ id: 'htow', construction_progress: 0 }] }),
      makeSample(2000, { structures: [{ id: 'hkee', construction_progress: 0 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('tier_upgrade')
  })

  it('detects Undead expansion (Haunted Gold Mine appears)', () => {
    const p = makePlayer('ghost', [
      makeSample(0, { structures: [{ id: 'unpl', construction_progress: 0 }] }),
      makeSample(2000, {
        structures: [
          { id: 'unpl', construction_progress: 0 },
          { id: 'ugol', construction_progress: 0 },
        ],
      }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: 'expansion', id: 'ugol' })
  })
})

describe('detectTimeline — tier upgrades', () => {
  it('detects Human tier 2 (Keep)', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { structures: [{ id: 'htow', construction_progress: 0 }] }),
      makeSample(2000, { structures: [{ id: 'hkee', construction_progress: 0 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      player: 'leqi',
      type: 'tier_upgrade',
      id: 'hkee',
      time_ms: 2000,
    })
  })

  it('detects Human tier 3 (Castle)', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { structures: [{ id: 'hkee', construction_progress: 0 }] }),
      makeSample(2000, { structures: [{ id: 'hcas', construction_progress: 0 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: 'tier_upgrade', id: 'hcas' })
  })

  it('detects Undead tier 2 (Halls of the Dead)', () => {
    const p = makePlayer('ghost', [
      makeSample(0, { structures: [{ id: 'unpl', construction_progress: 0 }] }),
      makeSample(2000, { structures: [{ id: 'unp1', construction_progress: 0 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: 'tier_upgrade', id: 'unp1' })
  })

  it('detects tier upgrade even when construction is still in progress', () => {
    const p = makePlayer('leqi', [
      makeSample(0, { structures: [{ id: 'htow', construction_progress: 0 }] }),
      makeSample(2000, { structures: [{ id: 'hkee', construction_progress: 50 }] }),
    ])
    const events = detectTimeline([p])
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: 'tier_upgrade', id: 'hkee' })
  })

  it('does not fire any event when a second tier-2 building appears (expansion already detected earlier)', () => {
    // In a real game, the expansion is detected when the Town Hall first appears.
    // By the time it upgrades to Keep, no new event should fire.
    const p = makePlayer('leqi', [
      makeSample(0, { structures: [{ id: 'hkee', construction_progress: 0 }] }),
      makeSample(2000, {
        structures: [
          { id: 'hkee', construction_progress: 0 },
          { id: 'hkee', construction_progress: 0 },
        ],
      }),
    ])
    expect(detectTimeline([p])).toHaveLength(0)
  })
})

describe('detectTimeline — ordering', () => {
  it('returns events sorted chronologically across both players', () => {
    const p1 = makePlayer('leqi', [
      makeSample(0, { upgrades: [{ id: 'Rhme', level: 0, max_level: 3 }] }),
      makeSample(4000, { upgrades: [{ id: 'Rhme', level: 1, max_level: 3 }] }),
    ])
    const p2 = makePlayer('Rollex', [
      makeSample(0, { structures: [{ id: 'ogre', construction_progress: 0 }] }),
      makeSample(2000, {
        structures: [
          { id: 'ogre', construction_progress: 0 },
          { id: 'ogre', construction_progress: 0 },
        ],
      }),
    ])
    const events = detectTimeline([p1, p2])
    expect(events).toHaveLength(2)
    expect(events[0].time_ms).toBe(2000)
    expect(events[1].time_ms).toBe(4000)
  })
})
