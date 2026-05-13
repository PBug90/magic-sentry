import type { GamePatch, GameRecord, PlayerRecord } from './types.js'

export function buildGameRecord(accumulated: Map<number, GamePatch>): GameRecord | null {
  const sorted = [...accumulated.values()].sort((a, b) => a.seq - b.seq)
  if (sorted.length === 0) return null

  const playerMap = new Map<string, PlayerRecord>()
  for (const patch of sorted) {
    for (const pp of patch.players) {
      let record = playerMap.get(pp.name)
      if (!record) {
        record = {
          name: pp.name,
          race: pp.race,
          team: pp.team,
          result: '',
          samples: [],
          summary: { heroes: [], units: [], upgrades: [] },
        }
        playerMap.set(pp.name, record)
      }
      record.samples.push(...pp.new_samples)
      if (pp.result) record.result = pp.result
      if (pp.summary) record.summary = pp.summary
    }
  }

  const players = [...playerMap.values()]
  const duration_ms = players
    .flatMap((p) => p.samples)
    .reduce((max, s) => Math.max(max, s.time_ms), 0)

  return { map: sorted[0].map, game: sorted[0].game, duration_ms, players }
}
