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
