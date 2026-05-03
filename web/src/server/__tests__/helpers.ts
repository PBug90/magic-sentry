import { sql } from '../db.js'
import { gameStore } from '../store.js'
import { authStore } from '../authStore.js'
import type { TwitchUser } from '../authStore.js'

export const TEST_USER: TwitchUser = {
  id: 'u1',
  login: 'back2warcraft',
  display_name: 'Back2Warcraft',
  profile_image_url: 'https://example.com/avatar.png',
}

/** Truncate all DB tables and clear in-memory store state. */
export async function resetAll(): Promise<void> {
  await sql`TRUNCATE traffic_stats, users CASCADE`
  gameStore.reset()
  authStore.reset()
}

/** Insert a user and return a fresh CLI token for them. */
export async function seedUserWithToken(user: TwitchUser = TEST_USER): Promise<string> {
  await authStore.upsertUser(user)
  return authStore.createCliToken(user.id, 'test token')
}

/** Minimal valid game patch factory. */
export function makePatch(overrides?: Record<string, unknown>) {
  return {
    game_id: 'test-game-1',
    seq: 0,
    is_final: false,
    map: 'Lost Temple',
    game: 'Test Game',
    players: [],
    ...overrides,
  }
}
