import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest'
import { migrate, sql } from '../db.js'
import { authStore } from '../authStore.js'
import { resetAll, TEST_USER, seedUnapprovedUserWithToken } from './helpers.js'

beforeAll(async () => {
  await migrate()
})
beforeEach(async () => {
  await resetAll()
})
afterAll(async () => {
  await sql.end()
})

describe('upsertUser', () => {
  it('inserts a new user', async () => {
    await authStore.upsertUser(TEST_USER)
    const rows = await sql`SELECT id, login FROM users WHERE id = ${TEST_USER.id}`
    expect(rows).toHaveLength(1)
    expect(rows[0].login).toBe('back2warcraft')
  })

  it('updates an existing user on conflict', async () => {
    await authStore.upsertUser(TEST_USER)
    await authStore.upsertUser({ ...TEST_USER, display_name: 'Updated' })
    const rows = await sql`SELECT display_name FROM users WHERE id = ${TEST_USER.id}`
    expect(rows[0].display_name).toBe('Updated')
  })

  it('returns allowed: false for a new user', async () => {
    const user = await authStore.upsertUser(TEST_USER)
    expect(user.allowed).toBe(false)
  })

  it('preserves allowed: true when upserting an existing approved user', async () => {
    await authStore.upsertUser(TEST_USER)
    await sql`UPDATE users SET allowed = true WHERE id = ${TEST_USER.id}`
    const user = await authStore.upsertUser({ ...TEST_USER, display_name: 'Updated' })
    expect(user.allowed).toBe(true)
  })

  it('does not grant allowed when upserting an unapproved user', async () => {
    await authStore.upsertUser(TEST_USER)
    const user = await authStore.upsertUser({ ...TEST_USER, display_name: 'Updated' })
    expect(user.allowed).toBe(false)
  })
})

describe('CLI tokens', () => {
  it('validateBearer approves a token for an approved user', async () => {
    await authStore.upsertUser(TEST_USER)
    await sql`UPDATE users SET allowed = true WHERE id = ${TEST_USER.id}`
    const token = await authStore.createCliToken(TEST_USER.id, 'test')
    const result = await authStore.validateBearer(token)
    expect(result.authorized).toBe(true)
    if (result.authorized) {
      expect(result.user.login).toBe(TEST_USER.login)
      expect(result.user.allowed).toBe(true)
    }
  })

  it('validateBearer rejects a token for an unapproved user', async () => {
    const token = await seedUnapprovedUserWithToken()
    const result = await authStore.validateBearer(token)
    expect(result.authorized).toBe(false)
    if (!result.authorized) {
      expect(result.reason).toMatch(/approved/)
    }
  })

  it('validateBearer rejects an unknown token', async () => {
    const result = await authStore.validateBearer('a'.repeat(64))
    expect(result.authorized).toBe(false)
  })

  it('validateBearer rejects a non-hex string', async () => {
    const result = await authStore.validateBearer('not-a-valid-token')
    expect(result.authorized).toBe(false)
  })

  it('validateBearer rejects after revokeToken', async () => {
    await authStore.upsertUser(TEST_USER)
    const token = await authStore.createCliToken(TEST_USER.id, 'test')
    await authStore.revokeToken(token, TEST_USER.id)
    const result = await authStore.validateBearer(token)
    expect(result.authorized).toBe(false)
  })

  it('listTokensForUser returns all tokens for the user', async () => {
    await authStore.upsertUser(TEST_USER)
    await authStore.createCliToken(TEST_USER.id, 'first')
    await authStore.createCliToken(TEST_USER.id, 'second')
    const tokens = await authStore.listTokensForUser(TEST_USER.id)
    expect(tokens).toHaveLength(2)
    expect(tokens.map((t) => t.label)).toContain('first')
    expect(tokens.map((t) => t.label)).toContain('second')
  })

  it('revokeToken only removes the specified token', async () => {
    await authStore.upsertUser(TEST_USER)
    const t1 = await authStore.createCliToken(TEST_USER.id, 'keep')
    const t2 = await authStore.createCliToken(TEST_USER.id, 'revoke')
    await authStore.revokeToken(t2, TEST_USER.id)
    const tokens = await authStore.listTokensForUser(TEST_USER.id)
    expect(tokens).toHaveLength(1)
    expect(tokens[0].token).toBe(t1)
  })

  it('revokeToken returns false for a token belonging to another user', async () => {
    const other = { ...TEST_USER, id: 'u2', login: 'other' }
    await authStore.upsertUser(TEST_USER)
    await authStore.upsertUser(other)
    const token = await authStore.createCliToken(other.id, 'other token')
    const revoked = await authStore.revokeToken(token, TEST_USER.id)
    expect(revoked).toBe(false)
  })
})

describe('public tokens', () => {
  it('ensurePublicToken creates a token', async () => {
    await authStore.upsertUser(TEST_USER)
    const token = await authStore.ensurePublicToken(TEST_USER.id)
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('ensurePublicToken is idempotent', async () => {
    await authStore.upsertUser(TEST_USER)
    const t1 = await authStore.ensurePublicToken(TEST_USER.id)
    const t2 = await authStore.ensurePublicToken(TEST_USER.id)
    expect(t1).toBe(t2)
  })

  it('getPublicTokenForUser returns null before ensurePublicToken is called', async () => {
    await authStore.upsertUser(TEST_USER)
    const token = await authStore.getPublicTokenForUser(TEST_USER.id)
    expect(token).toBeNull()
  })

  it('getPublicTokenForUser returns the token after ensurePublicToken', async () => {
    await authStore.upsertUser(TEST_USER)
    const created = await authStore.ensurePublicToken(TEST_USER.id)
    const fetched = await authStore.getPublicTokenForUser(TEST_USER.id)
    expect(fetched).toBe(created)
  })
})

describe('sessions', () => {
  it('getSession returns the session after createSession', () => {
    const token = authStore.createSession(TEST_USER)
    const session = authStore.getSession(token)
    expect(session?.user.login).toBe(TEST_USER.login)
  })

  it('getSession returns null after deleteSession', () => {
    const token = authStore.createSession(TEST_USER)
    authStore.deleteSession(token)
    expect(authStore.getSession(token)).toBeNull()
  })
})
