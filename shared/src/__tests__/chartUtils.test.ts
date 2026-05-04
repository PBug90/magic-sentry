import { describe, it, expect } from 'vitest'
import type { Sample } from '../types.js'
import {
  formatDuration,
  fmtTime,
  niceMax,
  timeTicks,
  heroSupply,
  nearestSample,
  nearestSampleIdx,
  buildLayers,
  buildByTime,
  buildAreas,
  PLAYER_COLORS,
  UNIT_COLORS,
  HERO_OBSERVER_NAMES,
} from '../chartUtils.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSample(overrides: Partial<Sample> = {}): Sample {
  return {
    time_ms: 0,
    gold: 0,
    gold_mined: 0,
    gold_upkeep_lost: 0,
    lumber: 0,
    lumber_mined: 0,
    lumber_upkeep_lost: 0,
    food_used: 0,
    food_cap: 80,
    apm: 0,
    heroes: [],
    units: [],
    ...overrides,
  }
}

function makeHero(name: string, hp = 100) {
  return {
    name,
    level: 1,
    xp: 0,
    hp,
    hp_max: 100,
    mp: 0,
    mp_max: 0,
    damage_dealt: 0,
    damage_received: 0,
    healing_done: 0,
    deaths: 0,
    kills: 0,
    hero_kills: 0,
    building_kills: 0,
  }
}

function makeUnit(name: string, alive: number) {
  return { name, alive, trained: alive }
}

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------

describe('formatDuration', () => {
  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('formats seconds only', () => {
    expect(formatDuration(30_000)).toBe('0:30')
    expect(formatDuration(9_000)).toBe('0:09')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(90_000)).toBe('1:30')
    expect(formatDuration(600_000)).toBe('10:00')
    expect(formatDuration(754_000)).toBe('12:34')
  })

  it('formats hours, minutes and seconds', () => {
    expect(formatDuration(3_600_000)).toBe('1:00:00')
    expect(formatDuration(3_661_000)).toBe('1:01:01')
    expect(formatDuration(7_384_000)).toBe('2:03:04')
  })

  it('pads single-digit minutes and seconds with leading zero', () => {
    expect(formatDuration(3_605_000)).toBe('1:00:05')
    expect(formatDuration(3_660_000)).toBe('1:01:00')
  })
})

// ---------------------------------------------------------------------------
// fmtTime
// ---------------------------------------------------------------------------

describe('fmtTime', () => {
  it('formats zero seconds', () => {
    expect(fmtTime(0)).toBe('0:00')
  })

  it('formats seconds under a minute', () => {
    expect(fmtTime(5)).toBe('0:05')
    expect(fmtTime(59)).toBe('0:59')
  })

  it('formats minutes and seconds', () => {
    expect(fmtTime(65)).toBe('1:05')
    expect(fmtTime(120)).toBe('2:00')
    expect(fmtTime(754)).toBe('12:34')
  })

  it('truncates sub-second input', () => {
    expect(fmtTime(65.9)).toBe('1:05')
  })
})

// ---------------------------------------------------------------------------
// niceMax
// ---------------------------------------------------------------------------

describe('niceMax', () => {
  it('returns step when val is zero (minimum is one step)', () => {
    expect(niceMax(0, 50)).toBe(50)
  })

  it('returns val when it is exactly on a step boundary', () => {
    expect(niceMax(100, 50)).toBe(100)
    expect(niceMax(300, 100)).toBe(300)
  })

  it('rounds up to next step boundary', () => {
    expect(niceMax(101, 50)).toBe(150)
    expect(niceMax(51, 100)).toBe(100)
    expect(niceMax(1, 1000)).toBe(1000)
  })

  it('uses step as minimum when val is smaller', () => {
    expect(niceMax(10, 500)).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// timeTicks
// ---------------------------------------------------------------------------

describe('timeTicks', () => {
  it('uses 120-second step for short games (≤600 s)', () => {
    const ticks = timeTicks(240)
    expect(ticks).toEqual([0, 120, 240])
  })

  it('uses 300-second step for medium games (601–1800 s)', () => {
    const ticks = timeTicks(900)
    expect(ticks).toEqual([0, 300, 600, 900])
  })

  it('uses 600-second step for long games (>1800 s)', () => {
    const ticks = timeTicks(2400)
    expect(ticks).toEqual([0, 600, 1200, 1800, 2400])
  })

  it('always starts at 0', () => {
    expect(timeTicks(300)[0]).toBe(0)
    expect(timeTicks(1800)[0]).toBe(0)
    expect(timeTicks(3600)[0]).toBe(0)
  })

  it('always includes maxSec when it falls on a boundary', () => {
    const ticks600 = timeTicks(600)
    expect(ticks600[ticks600.length - 1]).toBe(600)

    const ticks1800 = timeTicks(1800)
    expect(ticks1800[ticks1800.length - 1]).toBe(1800)
  })
})

// ---------------------------------------------------------------------------
// heroSupply
// ---------------------------------------------------------------------------

describe('heroSupply', () => {
  it('returns 5 for any hero observer name', () => {
    for (const name of HERO_OBSERVER_NAMES) {
      expect(heroSupply(name)).toBe(5)
    }
  })

  it('returns the correct unit supply for known units', () => {
    expect(heroSupply('Footman')).toBe(2)
    expect(heroSupply('Grunt')).toBe(3)
    expect(heroSupply('Peasant')).toBe(1)
    expect(heroSupply('Tauren')).toBe(5)
    expect(heroSupply('Frost Wyrm')).toBe(7)
  })

  it('returns 1 as fallback for unknown unit names', () => {
    expect(heroSupply('Unknown Unit')).toBe(1)
    expect(heroSupply('')).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// nearestSample
// ---------------------------------------------------------------------------

describe('nearestSample', () => {
  it('returns null for an empty array', () => {
    expect(nearestSample([], 10)).toBeNull()
  })

  it('returns the only sample regardless of target', () => {
    const s = makeSample({ time_ms: 5_000 })
    expect(nearestSample([s], 0)).toBe(s)
    expect(nearestSample([s], 999)).toBe(s)
  })

  it('returns the closest sample by time', () => {
    const s1 = makeSample({ time_ms: 0 })
    const s2 = makeSample({ time_ms: 30_000 })
    const s3 = makeSample({ time_ms: 60_000 })

    expect(nearestSample([s1, s2, s3], 10)).toBe(s1) // 10 s → closest to 0 s
    expect(nearestSample([s1, s2, s3], 25)).toBe(s2) // 25 s → closest to 30 s
    expect(nearestSample([s1, s2, s3], 55)).toBe(s3) // 55 s → closest to 60 s
  })

  it('prefers the earlier sample on exact midpoints (reduce keeps first best)', () => {
    const s1 = makeSample({ time_ms: 0 })
    const s2 = makeSample({ time_ms: 20_000 })
    // target = 10 s → equidistant; reduce keeps the first winner
    expect(nearestSample([s1, s2], 10)).toBe(s1)
  })
})

// ---------------------------------------------------------------------------
// nearestSampleIdx
// ---------------------------------------------------------------------------

describe('nearestSampleIdx', () => {
  it('returns the index of the closest sample', () => {
    const samples = [
      makeSample({ time_ms: 0 }),
      makeSample({ time_ms: 30_000 }),
      makeSample({ time_ms: 60_000 }),
    ]
    expect(nearestSampleIdx(samples, 0)).toBe(0)
    expect(nearestSampleIdx(samples, 25)).toBe(1)
    expect(nearestSampleIdx(samples, 55)).toBe(2)
  })

  it('returns 0 for a single-element array', () => {
    expect(nearestSampleIdx([makeSample({ time_ms: 99_000 })], 0)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// buildLayers
// ---------------------------------------------------------------------------

describe('buildLayers', () => {
  it('returns an empty array for samples with no units or heroes', () => {
    expect(buildLayers([makeSample(), makeSample()])).toEqual([])
  })

  it('places worker units first', () => {
    const samples = [makeSample({ units: [makeUnit('Peasant', 5), makeUnit('Footman', 3)] })]
    const layers = buildLayers(samples)
    expect(layers[0]).toBe('Peasant')
  })

  it('places heroes last', () => {
    const samples = [
      makeSample({
        units: [makeUnit('Footman', 4)],
        heroes: [makeHero('archmage')],
      }),
    ]
    const layers = buildLayers(samples)
    expect(layers[layers.length - 1]).toBe('archmage')
    expect(layers).toContain('Footman')
  })

  it('excludes units with zero alive count across all samples', () => {
    const samples = [makeSample({ units: [makeUnit('Footman', 0)] })]
    expect(buildLayers(samples)).not.toContain('Footman')
  })

  it('excludes dead heroes (hp = 0)', () => {
    const samples = [makeSample({ heroes: [makeHero('archmage', 0)] })]
    expect(buildLayers(samples)).not.toContain('archmage')
  })

  it('sorts non-worker units by peak supply descending', () => {
    const samples = [
      makeSample({
        units: [makeUnit('Footman', 2), makeUnit('Gryphon Rider', 4)], // supply 2 vs 4
      }),
    ]
    const layers = buildLayers(samples)
    // Gryphon Rider (supply 4) appears before Footman (supply 2)
    expect(layers.indexOf('Gryphon Rider')).toBeLessThan(layers.indexOf('Footman'))
  })
})

// ---------------------------------------------------------------------------
// buildByTime
// ---------------------------------------------------------------------------

describe('buildByTime', () => {
  it('returns an empty map entry for samples with no units or heroes', () => {
    const result = buildByTime([makeSample()])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({})
  })

  it('maps unit names to their alive count', () => {
    const samples = [makeSample({ units: [makeUnit('Footman', 3), makeUnit('Peasant', 5)] })]
    expect(buildByTime(samples)[0]).toEqual({ Footman: 3, Peasant: 5 })
  })

  it('increments hero count for alive heroes', () => {
    const samples = [makeSample({ heroes: [makeHero('archmage', 100), makeHero('paladin', 100)] })]
    const map = buildByTime(samples)[0]
    expect(map['archmage']).toBe(1)
    expect(map['paladin']).toBe(1)
  })

  it('omits dead heroes (hp = 0)', () => {
    const samples = [makeSample({ heroes: [makeHero('archmage', 0)] })]
    expect(buildByTime(samples)[0]).not.toHaveProperty('archmage')
  })

  it('adds hero on top of a unit with the same name', () => {
    // Unlikely in practice but tests the accumulation logic
    const samples = [
      makeSample({ units: [makeUnit('archmage', 1)], heroes: [makeHero('archmage', 50)] }),
    ]
    expect(buildByTime(samples)[0]['archmage']).toBe(2)
  })

  it('produces one entry per sample', () => {
    const samples = [
      makeSample({ time_ms: 0, units: [makeUnit('Footman', 1)] }),
      makeSample({ time_ms: 30_000, units: [makeUnit('Footman', 3)] }),
    ]
    const result = buildByTime(samples)
    expect(result).toHaveLength(2)
    expect(result[0]['Footman']).toBe(1)
    expect(result[1]['Footman']).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// buildAreas
// ---------------------------------------------------------------------------

describe('buildAreas', () => {
  const xOf = (t: number) => t
  const yOf = (v: number) => v

  it('returns one area per layer', () => {
    const samples = [makeSample({ time_ms: 0 }), makeSample({ time_ms: 30_000 })]
    const layers = ['Footman', 'Peasant']
    const byTime = [
      { Footman: 3, Peasant: 1 },
      { Footman: 4, Peasant: 1 },
    ]
    const areas = buildAreas(samples, layers, byTime, xOf, yOf)
    expect(areas).toHaveLength(2)
    expect(areas.map((a) => a.name)).toEqual(['Footman', 'Peasant'])
  })

  it('each area has a non-empty SVG path string', () => {
    const samples = [makeSample({ time_ms: 0 }), makeSample({ time_ms: 10_000 })]
    const areas = buildAreas(samples, ['Footman'], [{ Footman: 2 }, { Footman: 3 }], xOf, yOf)
    expect(areas[0].d).toMatch(/^M/)
    expect(areas[0].d).toMatch(/Z$/)
  })

  it('uses UNIT_COLORS by default', () => {
    const samples = [makeSample({ time_ms: 0 })]
    const areas = buildAreas(samples, ['Footman'], [{ Footman: 1 }], xOf, yOf)
    expect(UNIT_COLORS).toContain(areas[0].fill)
  })

  it('uses the provided colorOf function', () => {
    const samples = [makeSample({ time_ms: 0 })]
    const areas = buildAreas(
      samples,
      ['Footman'],
      [{ Footman: 1 }],
      xOf,
      yOf,
      () => 1,
      () => '#ff0000',
    )
    expect(areas[0].fill).toBe('#ff0000')
  })

  it('returns an empty array for no layers', () => {
    const samples = [makeSample()]
    expect(buildAreas(samples, [], [], xOf, yOf)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Constants sanity checks
// ---------------------------------------------------------------------------

describe('PLAYER_COLORS', () => {
  it('has 5 entries', () => {
    expect(PLAYER_COLORS).toHaveLength(5)
  })

  it('all entries are valid hex colors', () => {
    for (const c of PLAYER_COLORS) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('UNIT_COLORS', () => {
  it('has at least 5 entries', () => {
    expect(UNIT_COLORS.length).toBeGreaterThanOrEqual(5)
  })

  it('all entries are valid hex colors', () => {
    for (const c of UNIT_COLORS) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('HERO_OBSERVER_NAMES', () => {
  it('contains all 4 races', () => {
    // Human
    expect(HERO_OBSERVER_NAMES.has('archmage')).toBe(true)
    // Orc
    expect(HERO_OBSERVER_NAMES.has('blademaster')).toBe(true)
    // Undead
    expect(HERO_OBSERVER_NAMES.has('deathknight')).toBe(true)
    // Night Elf
    expect(HERO_OBSERVER_NAMES.has('demonhunter')).toBe(true)
  })

  it('does not contain unit names', () => {
    expect(HERO_OBSERVER_NAMES.has('Footman')).toBe(false)
    expect(HERO_OBSERVER_NAMES.has('Peasant')).toBe(false)
  })
})
