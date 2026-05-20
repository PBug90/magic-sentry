import { vi, beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest'
import { GameStore } from '../store.js'

function makePatch(overrides?: Record<string, unknown>) {
  return {
    game_id: 'game-1',
    seq: 0,
    is_final: false,
    map: 'Lost Temple',
    game: 'Test Game',
    players: [],
    ...overrides,
  }
}

const EXPIRY_MS = 10 * 60 * 1000
const SWEEP_MS = 60_000

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

// Each test gets a fresh store whose setInterval is captured by fake timers.
let store: GameStore
beforeEach(() => {
  vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  store = new GameStore()
})

describe('GameStore expiration', () => {
  it('evicts a game after 10 minutes of inactivity', () => {
    store.ingest(makePatch())
    expect(store.listGames()).toHaveLength(1)

    vi.advanceTimersByTime(EXPIRY_MS + SWEEP_MS)

    expect(store.listGames()).toHaveLength(0)
  })

  it('does not evict a game that was updated less than 10 minutes ago', () => {
    store.ingest(makePatch())

    vi.advanceTimersByTime(EXPIRY_MS - 1)

    expect(store.listGames()).toHaveLength(1)
  })

  it('resetting the updatedAt via a new patch delays eviction', () => {
    store.ingest(makePatch())

    // Advance to just before expiry and send another patch.
    vi.advanceTimersByTime(EXPIRY_MS - 1)
    store.ingest(makePatch({ seq: 1 }))

    // Advance by another full expiry window minus one ms: total elapsed is
    // (EXPIRY_MS - 1) + (EXPIRY_MS - 1), but updatedAt was reset at the
    // halfway point, so only EXPIRY_MS - 1 ms have passed since last update.
    vi.advanceTimersByTime(EXPIRY_MS - 1)

    expect(store.listGames()).toHaveLength(1)

    // Now let the remaining ms plus one sweep interval pass.
    vi.advanceTimersByTime(SWEEP_MS + 1)

    expect(store.listGames()).toHaveLength(0)
  })

  it('cleans up all internal maps on eviction', () => {
    store.setChannelGame('streamer', 'game-1')
    store.ingest(makePatch({ game_id: 'game-1' }))

    const publicId = store.getPublicId('game-1')
    expect(publicId).toBeDefined()
    expect(store.getInternalGameId(publicId!)).toBe('game-1')
    expect(store.getChannelGameId('streamer')).toBe('game-1')

    vi.advanceTimersByTime(EXPIRY_MS + SWEEP_MS)

    expect(store.listGames()).toHaveLength(0)
    expect(store.getPublicId('game-1')).toBeUndefined()
    expect(store.getInternalGameId(publicId!)).toBeUndefined()
    expect(store.getChannelGameId('streamer')).toBeUndefined()
  })

  it('preserves the channel map entry when a newer game replaced the evicted one', () => {
    store.setChannelGame('streamer', 'game-1')
    store.ingest(makePatch({ game_id: 'game-1' }))

    // A newer game comes in for the same channel before game-1 expires.
    vi.advanceTimersByTime(EXPIRY_MS - 1)
    store.setChannelGame('streamer', 'game-2')
    store.ingest(makePatch({ game_id: 'game-2' }))

    // game-1 expires on the next sweep.
    vi.advanceTimersByTime(SWEEP_MS + 1)

    expect(store.getChannelGameId('streamer')).toBe('game-2')
  })

  it('increments version and invalidates list cache on eviction', () => {
    store.ingest(makePatch())
    const versionBeforeExpiry = store.getVersion()

    vi.advanceTimersByTime(EXPIRY_MS + SWEEP_MS)

    expect(store.getVersion()).toBeGreaterThan(versionBeforeExpiry)
  })

  it('evicts multiple stale games in a single sweep', () => {
    store.ingest(makePatch({ game_id: 'game-1' }))
    store.ingest(makePatch({ game_id: 'game-2' }))
    store.ingest(makePatch({ game_id: 'game-3' }))
    expect(store.listGames()).toHaveLength(3)

    vi.advanceTimersByTime(EXPIRY_MS + SWEEP_MS)

    expect(store.listGames()).toHaveLength(0)
  })
})

describe('GameStore history pinning', () => {
  it('does not evict a game that has a pinnedUntil in the future', () => {
    store.ingest(makePatch({ game_id: 'game-1' }))
    const entry = (store as any).games.get('game-1')
    entry.pinnedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000)

    vi.advanceTimersByTime(EXPIRY_MS + SWEEP_MS)

    expect(store.listGames()).toHaveLength(1)
  })

  it('evicts a pinned game after pinnedUntil expires', () => {
    const TWO_HOURS = 2 * 60 * 60 * 1000
    store.ingest(makePatch({ game_id: 'game-1' }))
    const entry = (store as any).games.get('game-1')
    entry.pinnedUntil = new Date(Date.now() + TWO_HOURS)

    vi.advanceTimersByTime(TWO_HOURS + SWEEP_MS)

    expect(store.listGames()).toHaveLength(0)
  })
})

describe('GameStore channelHistory', () => {
  it('records the previous game when a new one starts', () => {
    store.ingest(makePatch({ game_id: 'game-1' }))
    store.setChannelGame('streamer', 'game-1')

    store.ingest(makePatch({ game_id: 'game-2' }))
    store.setChannelGame('streamer', 'game-2')

    expect((store as any).channelHistory.get('streamer')).toEqual(['game-1'])
  })

  it('prepends newer games and caps history at 5', () => {
    for (let i = 1; i <= 7; i++) {
      store.ingest(makePatch({ game_id: `game-${i}` }))
      store.setChannelGame('streamer', `game-${i}`)
    }
    const hist: string[] = (store as any).channelHistory.get('streamer')
    expect(hist).toHaveLength(5)
    expect(hist[0]).toBe('game-6') // most recent previous
    expect(hist[4]).toBe('game-2')
  })

  it('does not add to history when the same game_id is re-sent', () => {
    store.ingest(makePatch({ game_id: 'game-1' }))
    store.setChannelGame('streamer', 'game-1')
    store.setChannelGame('streamer', 'game-1') // duplicate

    expect((store as any).channelHistory.get('streamer')).toBeUndefined()
  })

  it('pins previous game when it enters history', () => {
    store.ingest(makePatch({ game_id: 'game-1' }))
    store.setChannelGame('streamer', 'game-1')
    store.ingest(makePatch({ game_id: 'game-2' }))
    store.setChannelGame('streamer', 'game-2')

    const entry = (store as any).games.get('game-1')
    expect(entry.pinnedUntil).toBeInstanceOf(Date)
    const TWO_HOURS = 2 * 60 * 60 * 1000
    expect(entry.pinnedUntil.getTime()).toBe(Date.now() + TWO_HOURS)
  })

  it('removes game from channelHistory on eviction', () => {
    store.ingest(makePatch({ game_id: 'game-1' }))
    store.setChannelGame('streamer', 'game-1')

    // Advance time slightly so game-2 has a newer updatedAt and survives the sweep
    vi.advanceTimersByTime(1)
    store.ingest(makePatch({ game_id: 'game-2' }))
    store.setChannelGame('streamer', 'game-2')

    // Add game-3 so game-2 enters history, then make game-3 current
    vi.advanceTimersByTime(1)
    store.ingest(makePatch({ game_id: 'game-3' }))
    store.setChannelGame('streamer', 'game-3')

    // Expire game-1's pin so the sweeper can evict it
    ;(store as any).games.get('game-1').pinnedUntil = new Date(0)
    vi.advanceTimersByTime(EXPIRY_MS + SWEEP_MS)

    const hist: string[] = (store as any).channelHistory.get('streamer')
    expect(hist).toBeDefined() // game-3 still alive, so history entry exists
    expect(hist).not.toContain('game-1')
  })

  it('clears channelHistory on reset', () => {
    store.ingest(makePatch({ game_id: 'game-1' }))
    store.setChannelGame('streamer', 'game-1')
    store.ingest(makePatch({ game_id: 'game-2' }))
    store.setChannelGame('streamer', 'game-2')

    store.reset()

    expect((store as any).channelHistory.size).toBe(0)
  })
})

describe('GameStore.getChannelHistory', () => {
  function makePatchWithPlayer(
    gameId: string,
    seq: number,
    playerName: string,
    result: string,
    isFinal = false,
  ) {
    return {
      game_id: gameId,
      seq,
      is_final: isFinal,
      map: 'Lost Temple',
      game: 'Test Game',
      players: [
        {
          name: playerName,
          race: 'Orc',
          team: 0,
          result,
          new_samples: [],
          summary: null,
        },
      ],
    }
  }

  it('returns empty array when channel has no history', () => {
    expect(store.getChannelHistory('nobody')).toEqual([])
  })

  it('returns summaries for history games, newest first', () => {
    store.ingest(makePatchWithPlayer('game-1', 0, 'Grubby', 'Victory', true))
    store.setChannelGame('grubby', 'game-1')
    store.ingest(makePatchWithPlayer('game-2', 0, 'Grubby', '', false))
    store.setChannelGame('grubby', 'game-2')

    const hist = store.getChannelHistory('grubby')
    expect(hist).toHaveLength(1)
    expect(hist[0].map).toBe('Lost Temple')
    expect(hist[0].is_final).toBe(true)
    expect(hist[0].players[0].name).toBe('Grubby')
    expect(hist[0].players[0].result).toBe('Victory')
    expect(hist[0].public_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(typeof hist[0].duration_ms).toBe('number')
  })

  it('silently skips evicted games', () => {
    store.ingest(makePatchWithPlayer('game-1', 0, 'Grubby', 'Victory', true))
    store.setChannelGame('grubby', 'game-1')
    store.ingest(makePatchWithPlayer('game-2', 0, 'Grubby', '', false))
    store.setChannelGame('grubby', 'game-2')

    // Force-evict game-1 by expiring its pin
    ;(store as any).games.get('game-1').pinnedUntil = new Date(0)
    vi.advanceTimersByTime(EXPIRY_MS + SWEEP_MS)

    expect(store.getChannelHistory('grubby')).toHaveLength(0)
  })
})
