import type { GamePatch, GameRecord, PlayerRecord } from './types.js'

// ---------------------------------------------------------------------------
// Internal state per game
// ---------------------------------------------------------------------------

interface GameEntry {
  gameId: string
  map: string
  game: string
  isFinal: boolean
  receivedAt: Date
  updatedAt: Date
  /** All patches received, deduplicated and keyed by seq. */
  patches: Map<number, GamePatch>
}

// ---------------------------------------------------------------------------
// Public shape returned by listGames()
// ---------------------------------------------------------------------------

export interface GameSummary {
  game_id: string
  channel: string
  map: string
  game: string
  is_final: boolean
  latest_seq: number
  patch_count: number
  received_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

class GameStore {
  private readonly games = new Map<string, GameEntry>()
  /** Maps Twitch login (lowercase) → most recently ingested game_id for that channel. */
  private readonly channelMap = new Map<string, string>()
  /** Reverse map: game_id → Twitch login. */
  private readonly gameOwnerMap = new Map<string, string>()

  setChannelGame(login: string, gameId: string): void {
    const lower = login.toLowerCase()
    this.channelMap.set(lower, gameId)
    this.gameOwnerMap.set(gameId, lower)
  }

  getChannelGameId(login: string): string | undefined {
    return this.channelMap.get(login.toLowerCase())
  }

  /** Ingest an incoming patch from the CLI. Duplicate seqs are silently ignored. */
  ingest(patch: GamePatch): void {
    let entry = this.games.get(patch.game_id)
    if (!entry) {
      entry = {
        gameId: patch.game_id,
        map: patch.map,
        game: patch.game,
        isFinal: false,
        receivedAt: new Date(),
        updatedAt: new Date(),
        patches: new Map(),
      }
      this.games.set(patch.game_id, entry)
    }

    if (!entry.patches.has(patch.seq)) {
      entry.patches.set(patch.seq, patch)
    }

    entry.updatedAt = new Date()
    if (patch.is_final) entry.isFinal = true
  }

  /**
   * Returns all stored patches for `gameId` with seq >= `since`, sorted by seq.
   * Returns an empty array when the game is unknown.
   */
  getPatches(gameId: string, since: number): GamePatch[] {
    const entry = this.games.get(gameId)
    if (!entry) return []
    return [...entry.patches.values()].filter((p) => p.seq >= since).sort((a, b) => a.seq - b.seq)
  }

  /**
   * Reconstructs the full GameRecord by replaying all patches in seq order.
   * Returns undefined when the game is unknown or has no patches yet.
   */
  buildFullRecord(gameId: string): GameRecord | undefined {
    const entry = this.games.get(gameId)
    if (!entry || entry.patches.size === 0) return undefined

    const sortedPatches = [...entry.patches.values()].sort((a, b) => a.seq - b.seq)

    // Accumulate per-player state in insertion order (first appearance sets position).
    const playerMap = new Map<string, PlayerRecord>()

    for (const patch of sortedPatches) {
      for (const pp of patch.players) {
        let record = playerMap.get(pp.name)
        if (!record) {
          record = {
            name: pp.name,
            race: pp.race,
            team: pp.team,
            result: '',
            time_in_upkeep_ms: [],
            samples: [],
            summary: { heroes: [], units: [] },
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

    return { map: entry.map, game: entry.game, duration_ms, players }
  }

  reset(): void {
    this.games.clear()
    this.channelMap.clear()
    this.gameOwnerMap.clear()
  }

  /** Returns all known games, most recently updated first. */
  listGames(): GameSummary[] {
    return [...this.games.values()]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map((e) => {
        const seqs = [...e.patches.keys()]
        const latest_seq = seqs.length > 0 ? Math.max(...seqs) : -1
        return {
          game_id: e.gameId,
          channel: this.gameOwnerMap.get(e.gameId) ?? '',
          map: e.map,
          game: e.game,
          is_final: e.isFinal,
          latest_seq,
          patch_count: e.patches.size,
          received_at: e.receivedAt.toISOString(),
          updated_at: e.updatedAt.toISOString(),
        }
      })
  }
}

export const gameStore = new GameStore()
