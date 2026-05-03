import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest'
import { migrate, sql } from '../db.js'
import { authStore } from '../authStore.js'
import { createApp } from '../app.js'
import { resetAll, seedUserWithToken, makePatch, TEST_USER } from './helpers.js'

const app = createApp()

beforeAll(async () => {
  await migrate()
})
beforeEach(async () => {
  await resetAll()
})
afterAll(async () => {
  await sql.end()
})

// ---------------------------------------------------------------------------
// POST /api/ingest
// ---------------------------------------------------------------------------

describe('POST /api/ingest', () => {
  it('returns 401 without a token', async () => {
    const res = await app.request('/api/ingest', { method: 'POST' })
    expect(res.status).toBe(401)
  })

  it('returns 401 with an invalid token', async () => {
    const res = await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${'x'.repeat(64)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch()),
    })
    expect(res.status).toBe(401)
  })

  it('returns 400 for a malformed patch', async () => {
    const token = await seedUserWithToken()
    const res = await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ not: 'a patch' }),
    })
    expect(res.status).toBe(400)
  })

  it('accepts a valid patch and returns ok', async () => {
    const token = await seedUserWithToken()
    const res = await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch()),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.ok).toBe(true)
    expect(body.game_id).toBe('test-game-1')
  })
})

// ---------------------------------------------------------------------------
// GET /api/:channel/live/full
// ---------------------------------------------------------------------------

describe('GET /api/:channel/live/full', () => {
  it('returns 404 for an unknown channel', async () => {
    const res = await app.request('/api/back2warcraft/live/full')
    expect(res.status).toBe(404)
  })

  it('returns the game record after ingest', async () => {
    const token = await seedUserWithToken()
    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch({ map: 'Twisted Meadows' })),
    })

    const res = await app.request('/api/back2warcraft/live/full')
    expect(res.status).toBe(200)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.map).toBe('Twisted Meadows')
  })

  it('channel lookup is case-insensitive', async () => {
    const token = await seedUserWithToken()
    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch()),
    })

    const res = await app.request('/api/BACK2WARCRAFT/live/full')
    expect(res.status).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// GET /api/:channel/live/delta
// ---------------------------------------------------------------------------

describe('GET /api/:channel/live/delta', () => {
  it('returns 404 for an unknown channel', async () => {
    const res = await app.request('/api/back2warcraft/live/delta')
    expect(res.status).toBe(404)
  })

  it('returns all patches when since=0', async () => {
    const token = await seedUserWithToken()
    for (let seq = 0; seq < 3; seq++) {
      await app.request('/api/ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(makePatch({ seq })),
      })
    }

    const res = await app.request('/api/back2warcraft/live/delta?since=0')
    expect(res.status).toBe(200)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.patches).toHaveLength(3)
  })

  it('returns only patches at or after since', async () => {
    const token = await seedUserWithToken()
    for (let seq = 0; seq < 5; seq++) {
      await app.request('/api/ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(makePatch({ seq })),
      })
    }

    const res = await app.request('/api/back2warcraft/live/delta?since=3')
    const body = (await res.json()) as { patches: Array<{ seq: number }> }
    expect(body.patches).toHaveLength(2)
    expect(body.patches[0].seq).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// POST /auth/token/me
// ---------------------------------------------------------------------------

describe('POST /auth/token/me', () => {
  it('returns 401 with no token', async () => {
    const res = await app.request('/auth/token/me', { method: 'POST' })
    expect(res.status).toBe(401)
  })

  it('returns 401 for an invalid token', async () => {
    const res = await app.request('/auth/token/me', {
      method: 'POST',
      headers: { Authorization: `Bearer ${'a'.repeat(64)}` },
    })
    expect(res.status).toBe(401)
  })

  it('returns the user for a valid CLI token', async () => {
    const token = await seedUserWithToken()
    const res = await app.request('/auth/token/me', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { authorized: boolean; user: { login: string } }
    expect(body.authorized).toBe(true)
    expect(body.user.login).toBe(TEST_USER.login)
  })
})

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.status).toBe('ok')
  })
})

// ---------------------------------------------------------------------------
// Token management (session-based)
// ---------------------------------------------------------------------------

describe('token management', () => {
  function sessionHeader(token: string) {
    return { Cookie: `session=${token}` }
  }

  it('POST /api/tokens creates a token', async () => {
    await authStore.upsertUser(TEST_USER)
    const session = authStore.createSession(TEST_USER)

    const res = await app.request('/api/tokens', {
      method: 'POST',
      headers: { ...sessionHeader(session), 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'my cli' }),
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.label).toBe('my cli')
    expect(body.token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('GET /api/tokens lists tokens for the session user', async () => {
    await authStore.upsertUser(TEST_USER)
    await authStore.createCliToken(TEST_USER.id, 'first')
    const session = authStore.createSession(TEST_USER)

    const res = await app.request('/api/tokens', {
      headers: sessionHeader(session),
    })
    expect(res.status).toBe(200)
    const tokens = (await res.json()) as Record<string, unknown>[]
    expect(tokens).toHaveLength(1)
    expect(tokens[0].label).toBe('first')
  })

  it('DELETE /api/tokens/:token revokes a token', async () => {
    await authStore.upsertUser(TEST_USER)
    const token = await authStore.createCliToken(TEST_USER.id, 'to revoke')
    const session = authStore.createSession(TEST_USER)

    const res = await app.request(`/api/tokens/${token}`, {
      method: 'DELETE',
      headers: sessionHeader(session),
    })
    expect(res.status).toBe(200)

    const result = await authStore.validateBearer(token)
    expect(result.authorized).toBe(false)
  })

  it('token endpoints return 401 without a session', async () => {
    const res = await app.request('/api/tokens')
    expect(res.status).toBe(401)
  })
})
