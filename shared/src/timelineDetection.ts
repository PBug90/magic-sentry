import type { PlayerRecord, StructureSnapshot } from './types.js'

export interface TimelineEvent {
  time_ms: number
  player: string
  type: 'upgrade' | 'expansion' | 'tier_upgrade'
  id: string
  level?: number
  /**
   * Construction outcome for structure events (expansion / tier_upgrade);
   * time_ms is the construction start. Upgrades only surface in the data on
   * completion and carry no status.
   */
  status?: 'in_progress' | 'completed' | 'canceled'
  /** Time the construction finished or was aborted; unset while in progress. */
  resolved_ms?: number
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

const isMainBuilding = (s: StructureSnapshot) =>
  EXPANSION_HALLS.has(s.id) || TIER_BUILDINGS.has(s.id)

// A tier upgrade morphs the main hall in place: the building keeps its previous
// tier id (at construction 100) and only reports the new tier id once complete.
// So the start is invisible in construction_progress — instead we read it from
// the source hall's upgrade_progress. This maps each source hall to the tier it
// upgrades into.
const UPGRADE_TARGET: Record<string, string> = {
  htow: 'hkee',
  hkee: 'hcas', // Human: Town Hall -> Keep -> Castle
  ogre: 'ostr',
  ostr: 'ofrt', // Orc: Great Hall -> Stronghold -> Fortress
  etol: 'etoa',
  etoa: 'etoe', // Night Elf: Tree of Life -> Ages -> Eternity
  unpl: 'unp1',
  unp1: 'unp2', // Undead: Necropolis -> Halls of the Dead -> Black Citadel
}

// In-progress tier upgrades keyed by the tier being upgraded toward, counted from
// each source hall's upgrade_progress (> 0 while the in-place upgrade runs).
function upgradingByTarget(structures: StructureSnapshot[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const s of structures) {
    const target = UPGRADE_TARGET[s.id]
    if (target && s.upgrade_progress > 0) m.set(target, (m.get(target) ?? 0) + 1)
  }
  return m
}

// construction_progress is a percentage counting up: 100 = finished, anything
// below (including a freshly placed building at 0) is still under construction.
function countCompleted(structures: StructureSnapshot[], id: string): number {
  return structures.filter((s) => s.id === id && s.construction_progress >= 100).length
}

function countInProgress(structures: StructureSnapshot[], id: string): number {
  return structures.filter((s) => s.id === id && s.construction_progress < 100).length
}

export function detectTimeline(players: PlayerRecord[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const player of players) {
    const { samples } = player

    // Upgrades are monotonic in WC3 — a level can never decrease and a finished
    // research never disappears. Track the highest level seen so far instead of
    // comparing adjacent samples, so a dirty sample whose upgrades array reads
    // empty does not re-fire every upgrade on the following sample.
    const maxLevelSeen = new Map<string, number>()
    if (samples.length > 0) {
      for (const u of samples[0].upgrades) maxLevelSeen.set(u.id, u.level)
    }

    // Structure events whose construction has not resolved yet, oldest first.
    const pending: TimelineEvent[] = []
    // Completed halls that left the structures list (uprooted Night Elf trees
    // or destroyed buildings), per hall id. A hall re-appearing already
    // complete consumes a debt instead of counting as a new expansion.
    const missingHalls = new Map<string, number>()
    let lastStructures: StructureSnapshot[] =
      samples.length > 0 ? (samples[0].structures ?? []) : []
    // Tier upgrades already running at sample 0 seed the baseline so we don't
    // mistake a mid-flight upgrade for a fresh start on the first transition.
    let prevUpgrading = upgradingByTarget(lastStructures)

    for (let i = 1; i < samples.length; i++) {
      const curr = samples[i]

      for (const upgrade of curr.upgrades) {
        const prevLevel = maxLevelSeen.get(upgrade.id) ?? 0
        if (upgrade.level > prevLevel) {
          maxLevelSeen.set(upgrade.id, upgrade.level)
          events.push({
            time_ms: curr.time_ms,
            player: player.name,
            type: 'upgrade',
            id: upgrade.id,
            level: upgrade.level,
          })
        }
      }

      const currStructures = curr.structures ?? []

      // A suddenly-empty structures list while buildings existed is a dirty
      // frame, not mass destruction — skip the transition and compare the
      // next sample against the last trusted list.
      if (currStructures.length === 0 && lastStructures.length > 0) continue
      const prevStructures = lastStructures
      lastStructures = currStructures

      // Construction starts detected this transition, per structure id.
      const started = new Map<string, number>()

      // Tier upgrade START: an in-place upgrade begins the moment a source hall's
      // upgrade_progress first reads > 0. The morphing building still shows its
      // previous tier id, so this is the only signal until it finishes.
      const currUpgrading = upgradingByTarget(currStructures)
      for (const [target, cnt] of currUpgrading) {
        const before = prevUpgrading.get(target) ?? 0
        for (let k = 0; k < cnt - before; k++) {
          const event: TimelineEvent = {
            time_ms: curr.time_ms,
            player: player.name,
            type: 'tier_upgrade',
            id: target,
            status: 'in_progress',
          }
          events.push(event)
          pending.push(event)
        }
      }

      // Tier upgrade CANCEL: upgrade_progress dropped back to 0 for more halls than
      // completed this transition — an aborted upgrade.
      for (const [target, before] of prevUpgrading) {
        const cnt = currUpgrading.get(target) ?? 0
        if (cnt >= before) continue
        const done = Math.max(
          0,
          countCompleted(currStructures, target) - countCompleted(prevStructures, target),
        )
        for (let canceled = before - cnt - done; canceled > 0; canceled--) {
          let idx = -1
          for (let j = pending.length - 1; j >= 0; j--) {
            if (pending[j].id === target && pending[j].status === 'in_progress') {
              idx = j
              break
            }
          }
          if (idx === -1) break
          pending[idx].status = 'canceled'
          pending[idx].resolved_ms = curr.time_ms
          pending.splice(idx, 1)
        }
      }

      // Fallback for recordings made before upgrade_progress existed: a tier 2/3
      // hall appearing for the first time with no matching start. The start is
      // unknown, so the resolve loop will settle it at this same time.
      for (const s of currStructures) {
        if (!TIER_BUILDINGS.has(s.id) || started.has(s.id)) continue
        const prevCount = prevStructures.filter((p) => p.id === s.id).length
        const currCount = currStructures.filter((c) => c.id === s.id).length
        const hasPendingStart = pending.some(
          (e) => e.id === s.id && e.type === 'tier_upgrade' && e.status === 'in_progress',
        )
        if (currCount > prevCount && prevCount === 0 && !hasPendingStart) {
          const event: TimelineEvent = {
            time_ms: curr.time_ms,
            player: player.name,
            type: 'tier_upgrade',
            id: s.id,
            status: 'in_progress',
          }
          events.push(event)
          pending.push(event)
          started.set(s.id, 1)
        }
      }

      prevUpgrading = currUpgrading

      // A completed hall vanishing while the main-building total shrinks was
      // uprooted or destroyed (a tier swap keeps the total constant).
      const prevMainCount = prevStructures.filter(isMainBuilding).length
      const currMainCount = currStructures.filter(isMainBuilding).length
      if (currMainCount < prevMainCount) {
        for (const id of EXPANSION_HALLS) {
          const drop = countCompleted(prevStructures, id) - countCompleted(currStructures, id)
          if (drop > 0) missingHalls.set(id, (missingHalls.get(id) ?? 0) + drop)
        }
      }

      // Expansion: total count of expansion-eligible structures increases.
      // The main-building total must increase too: a canceled tier upgrade
      // reverting to its tier-1 hall raises the hall count without adding a
      // building and is not an expansion.
      const prevHallCount = prevStructures.filter((s) => EXPANSION_HALLS.has(s.id)).length
      const currHallCount = currStructures.filter((s) => EXPANSION_HALLS.has(s.id)).length
      if (currHallCount > prevHallCount && currMainCount > prevMainCount) {
        const newHall = currStructures.find(
          (s) =>
            EXPANSION_HALLS.has(s.id) &&
            prevStructures.filter((p) => p.id === s.id).length <
              currStructures.filter((c) => c.id === s.id).length,
        )
        if (newHall) {
          // A hall re-appearing already complete while one of its kind went
          // missing earlier is a re-rooted tree, not a new expansion.
          const appearedComplete =
            countCompleted(currStructures, newHall.id) >
              countCompleted(prevStructures, newHall.id) &&
            countInProgress(currStructures, newHall.id) <=
              countInProgress(prevStructures, newHall.id)
          const debt = missingHalls.get(newHall.id) ?? 0
          if (appearedComplete && debt > 0) {
            missingHalls.set(newHall.id, debt - 1)
          } else {
            const event: TimelineEvent = {
              time_ms: curr.time_ms,
              player: player.name,
              type: 'expansion',
              id: newHall.id,
              status: 'in_progress',
            }
            events.push(event)
            pending.push(event)
            started.set(newHall.id, (started.get(newHall.id) ?? 0) + 1)
          }
        }
      }

      // Resolve pending constructions. A new completed instance of the id
      // marks the oldest pending event completed; an in-progress instance
      // vanishing without completing marks the newest one canceled.
      for (const id of [...new Set(pending.map((e) => e.id))]) {
        const completions = Math.max(
          0,
          countCompleted(currStructures, id) - countCompleted(prevStructures, id),
        )
        for (let c = 0; c < completions; c++) {
          const oldestIdx = pending.findIndex((e) => e.id === id)
          if (oldestIdx === -1) break
          pending[oldestIdx].status = 'completed'
          pending[oldestIdx].resolved_ms = curr.time_ms
          pending.splice(oldestIdx, 1)
        }

        const cancellations = Math.max(
          0,
          countInProgress(prevStructures, id) +
            (started.get(id) ?? 0) -
            completions -
            countInProgress(currStructures, id),
        )
        for (let c = 0; c < cancellations; c++) {
          let newestIdx = -1
          for (let j = pending.length - 1; j >= 0; j--) {
            if (pending[j].id === id) {
              newestIdx = j
              break
            }
          }
          if (newestIdx === -1) break
          pending[newestIdx].status = 'canceled'
          pending[newestIdx].resolved_ms = curr.time_ms
          pending.splice(newestIdx, 1)
        }
      }
    }
  }

  return events.sort((a, b) => a.time_ms - b.time_ms)
}
