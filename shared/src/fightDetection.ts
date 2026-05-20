import type { PlayerRecord, UnitSnapshot } from './types.js'

export interface FightPlayer {
  name: string
  race: string
  armyBefore: UnitSnapshot[]
  armyAfter: UnitSnapshot[]
  unitsLost: { id: string; count: number }[]
  itemsUsed: { id: string; count: number }[]
  damageCurve: number[]
  killedHeroes: { id: string; level: number }[]
  heroStats: { id: string; level: number; damageDone: number; healingDone: number }[]
}

export interface Fight {
  startMs: number
  endMs: number
  severity: 'major' | 'medium' | 'minor'
  players: FightPlayer[]
}

const DAMAGE_THRESHOLD = 200
const QUIET_CLOSE_SAMPLES = 3

// Peasants can convert to Militia and back — treat as one pool for loss accounting.
const PEASANT_ID = 'hpea'
const MILITIA_ID = 'hmil'

function peasantMilitiaPool(units: UnitSnapshot[]): number {
  return units.reduce((s, u) => (u.id === PEASANT_ID || u.id === MILITIA_ID) ? s + u.alive : s, 0)
}

function hasUnitLoss(prevUnits: UnitSnapshot[], currUnits: UnitSnapshot[]): boolean {
  for (const unit of currUnits) {
    if (unit.id === PEASANT_ID || unit.id === MILITIA_ID) continue
    const prevUnit = prevUnits.find((u) => u.id === unit.id)
    if (prevUnit && prevUnit.alive > unit.alive) return true
  }
  // Only compare the combined pool when the current sample actually tracks these unit types.
  // An absent entry means "not tracked this sample", not "all dead".
  const currTracksPool = currUnits.some((u) => u.id === PEASANT_ID || u.id === MILITIA_ID)
  return currTracksPool && peasantMilitiaPool(prevUnits) > peasantMilitiaPool(currUnits)
}

export function detectFights(players: PlayerRecord[]): Fight[] {
  if (players.length === 0) return []

  // Assumes players have near-identical sample counts (CLI captures both simultaneously in 1v1).
  // Samples beyond minLen are ignored; in practice counts differ by at most 1-2.
  const minLen = Math.min(...players.map((p) => p.samples.length))
  if (minLen < 2) return []

  // Mark each sample index as active if any player shows combat activity
  const active: boolean[] = new Array(minLen).fill(false)

  for (let i = 1; i < minLen; i++) {
    outer: for (const player of players) {
      const prev = player.samples[i - 1]
      const curr = player.samples[i]

      for (const hero of curr.heroes) {
        // Search back to find the last sample that contained this hero
        let prevHero = prev.heroes.find((h) => h.id === hero.id)
        if (!prevHero) {
          for (let j = i - 2; j >= 0; j--) {
            const found = player.samples[j].heroes.find((h) => h.id === hero.id)
            if (found) { prevHero = found; break }
          }
        }
        if (!prevHero) continue
        const dmgDelta =
          hero.damage_dealt - prevHero.damage_dealt +
          (hero.damage_received - prevHero.damage_received)
        if (dmgDelta >= DAMAGE_THRESHOLD) {
          active[i] = true
          break outer
        }
      }

      if (hasUnitLoss(prev.units, curr.units)) {
        active[i] = true
        break outer
      }
    }
  }

  // Group into windows; close after QUIET_CLOSE_SAMPLES consecutive quiet samples
  const windows: { start: number; end: number }[] = []
  let windowStart = -1
  let quietCount = 0

  for (let i = 0; i < minLen; i++) {
    if (active[i]) {
      if (windowStart === -1) windowStart = i
      quietCount = 0
    } else if (windowStart !== -1) {
      quietCount++
      if (quietCount >= QUIET_CLOSE_SAMPLES) {
        windows.push({ start: windowStart, end: i - quietCount })
        windowStart = -1
        quietCount = 0
      }
    }
  }
  if (windowStart !== -1) {
    windows.push({ start: windowStart, end: minLen - 1 - quietCount })
  }

  return windows.map((w) => buildFight(players, w.start, w.end))
}

function buildFight(players: PlayerRecord[], start: number, end: number): Fight {
  const fightPlayers = players.map((player) => buildFightPlayer(player, start, end))

  const anyHeroKilled = fightPlayers.some((p) => p.killedHeroes.length > 0)
  const totalUnitsLost = fightPlayers.reduce(
    (sum, p) => sum + p.unitsLost.reduce((s, u) => s + u.count, 0),
    0,
  )
  const severity: Fight['severity'] = anyHeroKilled
    ? 'major'
    : totalUnitsLost >= 3
      ? 'medium'
      : 'minor'

  return {
    startMs: players[0].samples[start].time_ms,
    endMs: players[0].samples[end].time_ms,
    severity,
    players: fightPlayers,
  }
}

function buildFightPlayer(player: PlayerRecord, start: number, end: number): FightPlayer {
  // Use the sample before the fight window for the "before" snapshot so
  // armyBefore reflects the state prior to the first active sample.
  const beforeIdx = Math.max(0, start - 1)
  const startSample = player.samples[beforeIdx]
  const endSample = player.samples[end]

  const armyBefore = startSample.units.filter((u) => u.alive > 0)
  const armyAfter = endSample.units.filter((u) => u.alive > 0)

  const unitsLost: { id: string; count: number }[] = []
  for (const before of startSample.units) {
    if (before.id === PEASANT_ID || before.id === MILITIA_ID) continue
    const after = endSample.units.find((u) => u.id === before.id)
    const lost = before.alive - (after?.alive ?? 0)
    if (lost > 0) unitsLost.push({ id: before.id, count: lost })
  }
  const endTracksPool = endSample.units.some((u) => u.id === PEASANT_ID || u.id === MILITIA_ID)
  if (endTracksPool) {
    const poolLost = peasantMilitiaPool(startSample.units) - peasantMilitiaPool(endSample.units)
    if (poolLost > 0) unitsLost.push({ id: PEASANT_ID, count: poolLost })
  }

  const itemsUsed: { id: string; count: number }[] = []
  for (const endItem of endSample.player_items) {
    const startItem = startSample.player_items.find((it) => it.id === endItem.id)
    const diff = endItem.used - (startItem?.used ?? 0)
    if (diff > 0) itemsUsed.push({ id: endItem.id, count: diff })
  }

  const damageCurve: number[] = []
  for (let i = start; i <= end; i++) {
    const curr = player.samples[i]
    const prev = player.samples[Math.max(0, i - 1)]
    let delta = 0
    for (const hero of curr.heroes) {
      let prevHero = prev.heroes.find((h) => h.id === hero.id)
      if (!prevHero) {
        for (let j = i - 2; j >= 0; j--) {
          const found = player.samples[j].heroes.find((h) => h.id === hero.id)
          if (found) { prevHero = found; break }
        }
      }
      if (prevHero) {
        delta += (hero.damage_dealt - prevHero.damage_dealt) +
                 (hero.damage_received - prevHero.damage_received)
      }
    }
    damageCurve.push(delta)
  }

  const heroIds = new Set<string>()
  for (let i = start; i <= end; i++) {
    for (const h of player.samples[i].heroes) heroIds.add(h.id)
  }

  const heroStats: { id: string; level: number; damageDone: number; healingDone: number }[] = []
  for (const heroId of heroIds) {
    const baseHero = startSample.heroes.find((h) => h.id === heroId)
    let endHero: (typeof startSample.heroes)[number] | undefined
    for (let j = end; j >= start; j--) {
      endHero = player.samples[j].heroes.find((h) => h.id === heroId)
      if (endHero) break
    }
    if (!endHero) continue
    heroStats.push({
      id: heroId,
      level: endHero.level,
      damageDone: endHero.damage_dealt - (baseHero?.damage_dealt ?? 0),
      healingDone: endHero.healing_done - (baseHero?.healing_done ?? 0),
    })
  }

  const baseDeaths = new Map<string, number>()
  for (const h of startSample.heroes) baseDeaths.set(h.id, h.deaths)

  const killedHeroes: { id: string; level: number }[] = []
  const detectedKills = new Set<string>()
  for (let i = start; i <= end; i++) {
    for (const h of player.samples[i].heroes) {
      const base = baseDeaths.get(h.id) ?? 0
      if (h.deaths > base && !detectedKills.has(h.id)) {
        killedHeroes.push({ id: h.id, level: h.level })
        detectedKills.add(h.id)
      }
    }
  }

  return { name: player.name, race: player.race, armyBefore, armyAfter, unitsLost, itemsUsed, damageCurve, killedHeroes, heroStats }
}
