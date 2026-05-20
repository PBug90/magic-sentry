// shared/src/__tests__/fightDetection.test.ts
import { describe, it, expect } from 'vitest'
import { detectFights } from '../src/fightDetection.js'
import type {
  PlayerRecord,
  Sample,
  HeroSample,
  UnitSnapshot,
  PlayerItemStatSnapshot,
} from '../src/types.js'

function makeHero(id: string, damage_dealt = 0, deaths = 0): HeroSample {
  return {
    id,
    level: 1,
    xp: 0,
    hp: 1000,
    hp_max: 1000,
    mp: 500,
    mp_max: 500,
    damage_dealt,
    damage_received: 0,
    healing_done: 0,
    deaths,
    kills: 0,
    hero_kills: 0,
    building_kills: 0,
    abilities: [],
    inventory: [],
  }
}

function makeUnit(id: string, alive: number): UnitSnapshot {
  return { id, alive, trained: alive }
}

function makeItemStat(id: string, used: number): PlayerItemStatSnapshot {
  return {
    id,
    item_level: 1,
    collected: 0,
    purchased: 0,
    sold: 0,
    used,
    destroyed: 0,
    damage_dealt: 0,
    healing_done: 0,
  }
}

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

// Quiet sample — no damage, no unit changes
const Q = (t: number) => makeSample(t)
// Active sample — damage spike above threshold
const A = (t: number, heroId = 'Hamg', dmg = 300) =>
  makeSample(t, { heroes: [makeHero(heroId, dmg)] })

describe('detectFights — window detection', () => {
  it('returns empty array for empty players', () => {
    expect(detectFights([])).toEqual([])
  })

  it('returns empty array when no player has active samples', () => {
    const p = makePlayer('p1', [Q(0), Q(2000), Q(4000)])
    expect(detectFights([p])).toEqual([])
  })

  it('returns one fight when a single sample is active', () => {
    // Sample at index 1 has high damage vs index 0 (delta = 300 - 0 = 300 >= 200)
    const samples = [
      makeSample(0, { heroes: [makeHero('Hamg', 0)] }),
      makeSample(2000, { heroes: [makeHero('Hamg', 300)] }),
      Q(4000),
      Q(6000),
      Q(8000), // 3 quiet samples close it
    ]
    const p = makePlayer('p1', samples)
    const fights = detectFights([p])
    expect(fights).toHaveLength(1)
    expect(fights[0].startMs).toBe(2000)
  })

  it('does not close window after only 2 quiet samples', () => {
    const samples = [
      makeSample(0, { heroes: [makeHero('Hamg', 0)] }),
      makeSample(2000, { heroes: [makeHero('Hamg', 300)] }), // active
      Q(4000),
      Q(6000), // 2 quiet — not enough
      makeSample(8000, { heroes: [makeHero('Hamg', 700)] }), // active again
      Q(10000),
      Q(12000),
      Q(14000), // 3 quiet — closes
    ]
    const p = makePlayer('p1', samples)
    const fights = detectFights([p])
    expect(fights).toHaveLength(1) // one merged fight
  })

  it('produces two fights when separated by 3+ quiet samples', () => {
    const samples = [
      makeSample(0, { heroes: [makeHero('Hamg', 0)] }),
      makeSample(2000, { heroes: [makeHero('Hamg', 300)] }), // active → fight 1
      Q(4000),
      Q(6000),
      Q(8000), // 3 quiet → closes fight 1
      makeSample(10000, { heroes: [makeHero('Hamg', 700)] }), // active → fight 2
      Q(12000),
      Q(14000),
      Q(16000), // 3 quiet → closes fight 2
    ]
    const p = makePlayer('p1', samples)
    const fights = detectFights([p])
    expect(fights).toHaveLength(2)
    expect(fights[0].startMs).toBe(2000)
    expect(fights[1].startMs).toBe(10000)
  })

  it('detects activity from unit losses (not just damage)', () => {
    const samples = [
      makeSample(0, { units: [makeUnit('hfoo', 5)] }),
      makeSample(2000, { units: [makeUnit('hfoo', 3)] }), // 2 units lost
      Q(4000),
      Q(6000),
      Q(8000),
    ]
    const p = makePlayer('p1', samples)
    const fights = detectFights([p])
    expect(fights).toHaveLength(1)
  })

  it('does not treat peasant→militia conversion as a unit loss', () => {
    // 5 peasants convert to 5 militia — no net loss, should not open a fight window
    const samples = [
      makeSample(0, { units: [makeUnit('hpea', 5)] }),
      makeSample(2000, { units: [makeUnit('hpea', 0), makeUnit('hmil', 5)] }),
      Q(4000),
      Q(6000),
      Q(8000),
    ]
    const p = makePlayer('p1', samples)
    expect(detectFights([p])).toHaveLength(0)
  })

  it('detects activity from either player', () => {
    const samples1 = [Q(0), Q(2000), Q(4000), Q(6000), Q(8000)]
    const samples2 = [
      makeSample(0, { heroes: [makeHero('Obla', 0)] }),
      makeSample(2000, { heroes: [makeHero('Obla', 300)] }),
      Q(4000),
      Q(6000),
      Q(8000),
    ]
    const fights = detectFights([makePlayer('p1', samples1), makePlayer('p2', samples2)])
    expect(fights).toHaveLength(1)
  })
})

describe('detectFights — FightPlayer data', () => {
  function twoPlayerFight() {
    // p1 loses 4 footmen, uses 1 item, hero takes damage (no death)
    // p2 loses 1 grunt
    const p1 = makePlayer('leqi', [
      makeSample(0, {
        heroes: [makeHero('Hamg', 0, 0)],
        units: [makeUnit('hfoo', 8)],
        player_items: [makeItemStat('stwp', 0)],
      }),
      makeSample(2000, {
        heroes: [makeHero('Hamg', 300, 0)],
        units: [makeUnit('hfoo', 4)],
        player_items: [makeItemStat('stwp', 1)],
      }),
      makeSample(4000, {
        heroes: [makeHero('Hamg', 500, 0)],
        units: [makeUnit('hfoo', 4)],
        player_items: [makeItemStat('stwp', 1)],
      }),
      makeSample(6000, {
        heroes: [makeHero('Hamg', 500, 0)],
        units: [makeUnit('hfoo', 4)],
        player_items: [makeItemStat('stwp', 1)],
      }),
      makeSample(8000, {
        heroes: [makeHero('Hamg', 500, 0)],
        units: [makeUnit('hfoo', 4)],
        player_items: [makeItemStat('stwp', 1)],
      }),
    ])
    const p2 = makePlayer('Rollex', [
      makeSample(0, { heroes: [makeHero('Obla', 0)], units: [makeUnit('ogru', 6)] }),
      makeSample(2000, { heroes: [makeHero('Obla', 400)], units: [makeUnit('ogru', 5)] }),
      makeSample(4000, { heroes: [makeHero('Obla', 400)], units: [makeUnit('ogru', 5)] }),
      makeSample(6000, { heroes: [makeHero('Obla', 400)], units: [makeUnit('ogru', 5)] }),
      makeSample(8000, { heroes: [makeHero('Obla', 400)], units: [makeUnit('ogru', 5)] }),
    ])
    return detectFights([p1, p2])
  }

  it('armyBefore reflects units alive at fight start', () => {
    const fights = twoPlayerFight()
    const p1 = fights[0].players[0]
    expect(p1.armyBefore).toEqual([makeUnit('hfoo', 8)])
  })

  it('armyAfter reflects units alive at fight end', () => {
    const fights = twoPlayerFight()
    const p1 = fights[0].players[0]
    expect(p1.armyAfter).toEqual([makeUnit('hfoo', 4)])
  })

  it('unitsLost reports the difference', () => {
    const fights = twoPlayerFight()
    const p1 = fights[0].players[0]
    expect(p1.unitsLost).toEqual([{ id: 'hfoo', count: 4 }])
  })

  it('itemsUsed reports items whose used count increased', () => {
    const fights = twoPlayerFight()
    const p1 = fights[0].players[0]
    expect(p1.itemsUsed).toEqual([{ id: 'stwp', count: 1 }])
  })

  it('itemsUsed is empty for player who used no items', () => {
    const fights = twoPlayerFight()
    const p2 = fights[0].players[1]
    expect(p2.itemsUsed).toEqual([])
  })

  it('damageCurve length equals number of samples in the window', () => {
    const fights = twoPlayerFight()
    const p1 = fights[0].players[0]
    expect(p1.damageCurve.length).toBeGreaterThan(0)
  })

  it('heroStats reports damage and healing deltas for each hero', () => {
    const fights = twoPlayerFight()
    const p1 = fights[0].players[0]
    expect(p1.heroStats).toEqual([{ id: 'Hamg', level: 1, damageDone: 500, healingDone: 0 }])
    const p2 = fights[0].players[1]
    expect(p2.heroStats).toEqual([{ id: 'Obla', level: 1, damageDone: 400, healingDone: 0 }])
  })

  it('killedHeroes is empty when no hero died', () => {
    const fights = twoPlayerFight()
    expect(fights[0].players[0].killedHeroes).toEqual([])
    expect(fights[0].players[1].killedHeroes).toEqual([])
  })

  it('unitsLost does not count peasant→militia conversion', () => {
    const p1 = makePlayer('leqi', [
      makeSample(0, { heroes: [makeHero('Hamg', 0)], units: [makeUnit('hpea', 5)] }),
      makeSample(2000, {
        heroes: [makeHero('Hamg', 300)],
        units: [makeUnit('hpea', 0), makeUnit('hmil', 5)],
      }),
      Q(4000),
      Q(6000),
      Q(8000),
    ])
    const p2 = makePlayer('opp', [Q(0), Q(2000), Q(4000), Q(6000), Q(8000)])
    const fights = detectFights([p1, p2])
    expect(fights[0].players[0].unitsLost).toEqual([])
  })

  it('unitsLost counts net loss from combined peasant+militia pool', () => {
    // 5 peasants → 2 militia + 1 peasant = pool 5→3, net loss of 2
    const p1 = makePlayer('leqi', [
      makeSample(0, { heroes: [makeHero('Hamg', 0)], units: [makeUnit('hpea', 5)] }),
      makeSample(2000, {
        heroes: [makeHero('Hamg', 300)],
        units: [makeUnit('hpea', 1), makeUnit('hmil', 2)],
      }),
      Q(4000),
      Q(6000),
      Q(8000),
    ])
    const p2 = makePlayer('opp', [Q(0), Q(2000), Q(4000), Q(6000), Q(8000)])
    const fights = detectFights([p1, p2])
    expect(fights[0].players[0].unitsLost).toEqual([{ id: 'hpea', count: 2 }])
  })
})

describe('detectFights — severity', () => {
  it('severity is major when a hero dies', () => {
    const p1 = makePlayer('leqi', [
      makeSample(0, { heroes: [makeHero('Hamg', 0, 0)] }),
      makeSample(2000, { heroes: [makeHero('Hamg', 300, 1)] }), // deaths: 1
      makeSample(4000, {}),
      makeSample(6000, {}),
      makeSample(8000, {}),
    ])
    const p2 = makePlayer('opp', [
      makeSample(0, {}),
      makeSample(2000, {}),
      makeSample(4000, {}),
      makeSample(6000, {}),
      makeSample(8000, {}),
    ])
    const fights = detectFights([p1, p2])
    expect(fights[0].severity).toBe('major')
    expect(fights[0].players[0].killedHeroes).toEqual([{ id: 'Hamg', level: 1 }])
  })

  it('severity is medium when 3+ total units lost, no hero death', () => {
    const p1 = makePlayer('leqi', [
      makeSample(0, { units: [makeUnit('hfoo', 5)] }),
      makeSample(2000, { units: [makeUnit('hfoo', 2)] }), // 3 units lost
      makeSample(4000, {}),
      makeSample(6000, {}),
      makeSample(8000, {}),
    ])
    const p2 = makePlayer('opp', [
      makeSample(0, {}),
      makeSample(2000, {}),
      makeSample(4000, {}),
      makeSample(6000, {}),
      makeSample(8000, {}),
    ])
    const fights = detectFights([p1, p2])
    expect(fights[0].severity).toBe('medium')
  })

  it('severity is minor when only damage, fewer than 3 units lost', () => {
    const p1 = makePlayer('leqi', [
      makeSample(0, { heroes: [makeHero('Hamg', 0)] }),
      makeSample(2000, { heroes: [makeHero('Hamg', 300)] }),
      makeSample(4000, {}),
      makeSample(6000, {}),
      makeSample(8000, {}),
    ])
    const p2 = makePlayer('opp', [
      makeSample(0, {}),
      makeSample(2000, {}),
      makeSample(4000, {}),
      makeSample(6000, {}),
      makeSample(8000, {}),
    ])
    const fights = detectFights([p1, p2])
    expect(fights[0].severity).toBe('minor')
  })

  it('severity is major when hero dies mid-fight and is absent from final sample', () => {
    const p1 = makePlayer('leqi', [
      makeSample(0, { heroes: [makeHero('Hamg', 0, 0)] }),
      makeSample(2000, { heroes: [makeHero('Hamg', 300, 1)] }), // hero dies at this sample
      makeSample(4000, { heroes: [] }), // hero absent (still dead)
      makeSample(6000, { heroes: [] }),
      makeSample(8000, { heroes: [] }),
    ])
    const p2 = makePlayer('opp', [
      makeSample(0, {}),
      makeSample(2000, {}),
      makeSample(4000, {}),
      makeSample(6000, {}),
      makeSample(8000, {}),
    ])
    const fights = detectFights([p1, p2])
    expect(fights[0].severity).toBe('major')
    expect(fights[0].players[0].killedHeroes).toEqual([{ id: 'Hamg', level: 1 }])
  })
})
