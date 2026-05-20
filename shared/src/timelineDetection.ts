import type { PlayerRecord } from './types.js'

export interface TimelineEvent {
  time_ms: number
  player: string
  type: 'upgrade' | 'expansion' | 'tier_upgrade'
  id: string
  level?: number
}

// Tier-1 main hall buildings that can appear at a new gold mine (expansion detection).
// Undead expand via Haunted Gold Mine (ugol), not Necropolis.
const EXPANSION_HALLS = new Set([
  'htow', // Human: Town Hall
  'ogre', // Orc: Great Hall
  'etol', // Night Elf: Tree of Life
  'ugol', // Undead: Haunted Gold Mine
])

// Tier 2 and tier 3 main hall buildings. Detected when first seen in structures.
const TIER_BUILDINGS = new Set([
  'hkee',
  'hcas', // Human: Keep, Castle
  'ostr',
  'ofrt', // Orc: Stronghold, Fortress
  'etoa',
  'etoe', // Night Elf: Tree of Ages, Tree of Eternity
  'unp1',
  'unp2', // Undead: Halls of the Dead, Black Citadel
])

export function detectTimeline(players: PlayerRecord[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const player of players) {
    const { samples } = player
    for (let i = 1; i < samples.length; i++) {
      const prev = samples[i - 1]
      const curr = samples[i]

      for (const upgrade of curr.upgrades) {
        const prevLevel = prev.upgrades.find((u) => u.id === upgrade.id)?.level ?? 0
        if (upgrade.level > prevLevel) {
          events.push({
            time_ms: curr.time_ms,
            player: player.name,
            type: 'upgrade',
            id: upgrade.id,
            level: upgrade.level,
          })
        }
      }

      const prevStructures = prev.structures ?? []
      const currStructures = curr.structures ?? []

      // Tier upgrade: a tier 2/3 main hall appears in structures for the first time.
      for (const s of currStructures) {
        if (!TIER_BUILDINGS.has(s.id)) continue
        const prevCount = prevStructures.filter((p) => p.id === s.id).length
        const currCount = currStructures.filter((c) => c.id === s.id).length
        if (currCount > prevCount && prevCount === 0) {
          events.push({
            time_ms: curr.time_ms,
            player: player.name,
            type: 'tier_upgrade',
            id: s.id,
          })
        }
      }

      // Expansion: total count of expansion-eligible structures increases.
      const prevHallCount = prevStructures.filter((s) => EXPANSION_HALLS.has(s.id)).length
      const currHallCount = currStructures.filter((s) => EXPANSION_HALLS.has(s.id)).length
      if (currHallCount > prevHallCount) {
        const newHall = currStructures.find(
          (s) =>
            EXPANSION_HALLS.has(s.id) &&
            prevStructures.filter((p) => p.id === s.id).length <
              currStructures.filter((c) => c.id === s.id).length,
        )
        if (newHall) {
          events.push({
            time_ms: curr.time_ms,
            player: player.name,
            type: 'expansion',
            id: newHall.id,
          })
        }
      }
    }
  }

  return events.sort((a, b) => a.time_ms - b.time_ms)
}
