import { sql } from '../db.js'
import { gameStore } from '../store.js'
import { authStore } from '../authStore.js'
import type { TwitchUser } from '../authStore.js'

export const TEST_USER: TwitchUser = {
  id: 'u1',
  login: 'back2warcraft',
  display_name: 'Back2Warcraft',
  profile_image_url: 'https://example.com/avatar.png',
  allowed: true,
}

/** Truncate all DB tables and clear in-memory store state. */
export async function resetAll(): Promise<void> {
  await sql`TRUNCATE traffic_stats, users CASCADE`
  gameStore.reset()
  authStore.reset()
}

/** Insert an approved user and return a fresh CLI token for them. */
export async function seedUserWithToken(user: TwitchUser = TEST_USER): Promise<string> {
  await authStore.upsertUser(user)
  await sql`UPDATE users SET allowed = true WHERE id = ${user.id}`
  return authStore.createCliToken(user.id, 'test token')
}

/** Insert an unapproved user (allowed=false) and return a fresh CLI token for them. */
export async function seedUnapprovedUserWithToken(user: TwitchUser = TEST_USER): Promise<string> {
  await authStore.upsertUser(user)
  // allowed stays false (DB default)
  return authStore.createCliToken(user.id, 'test token')
}

/** Minimal valid player patch. */
export function makePlayer(overrides?: Record<string, unknown>) {
  return {
    name: 'TestPlayer',
    race: 'Human',
    team: 0,
    result: '',
    new_samples: [],
    summary: null,
    ...overrides,
  }
}

/** Minimal valid game patch factory. */
export function makePatch(overrides?: Record<string, unknown>) {
  return {
    game_id: 'test-game-1',
    seq: 0,
    is_final: false,
    map: 'Lost Temple',
    game: 'Test Game',
    players: [makePlayer()],
    ...overrides,
  }
}
