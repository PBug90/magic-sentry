import { brotliCompressSync } from 'node:zlib'
import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest'
import { migrate, sql } from '../db.js'
import { authStore } from '../authStore.js'
import { trafficStore } from '../trafficStore.js'
import { createApp } from '../app.js'
import {
  resetAll,
  seedUserWithToken,
  seedUnapprovedUserWithToken,
  makePatch,
  makePlayer,
  TEST_USER,
} from './helpers.js'

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

  it('accepts a Brotli-compressed patch', async () => {
    const token = await seedUserWithToken()
    const json = Buffer.from(JSON.stringify(makePatch()))
    const compressed = brotliCompressSync(json)
    const res = await app.request('/api/ingest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'br',
        'Content-Length': String(compressed.byteLength),
      },
      body: compressed,
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as Record<string, unknown>
    expect(body.ok).toBe(true)
    expect(body.game_id).toBe('test-game-1')
  })

  it('records wire and raw bytes correctly for a Brotli-compressed ingest', async () => {
    const token = await seedUserWithToken()
    const json = Buffer.from(JSON.stringify(makePatch()))
    const compressed = brotliCompressSync(json)
    await app.request('/api/ingest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'br',
        'Content-Length': String(compressed.byteLength),
      },
      body: compressed,
    })
    await trafficStore.flush()
    const rows = await sql<{ ingest_bytes_raw: string; ingest_bytes_wire: string }[]>`
      SELECT ingest_bytes_raw, ingest_bytes_wire FROM traffic_stats WHERE token = ${token}
    `
    expect(rows).toHaveLength(1)
    expect(Number(rows[0].ingest_bytes_raw)).toBe(json.byteLength)
    expect(Number(rows[0].ingest_bytes_wire)).toBe(compressed.byteLength)
    expect(Number(rows[0].ingest_bytes_wire)).toBeLessThan(Number(rows[0].ingest_bytes_raw))
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
// allowed flag enforcement
// ---------------------------------------------------------------------------

describe('allowed flag enforcement', () => {
  function sessionHeader(token: string) {
    return { Cookie: `session=${token}` }
  }

  it('POST /api/ingest returns 401 for an unapproved user token', async () => {
    const token = await seedUnapprovedUserWithToken()
    const res = await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch()),
    })
    expect(res.status).toBe(401)
  })

  it('POST /auth/token/me returns 401 for an unapproved user token', async () => {
    const token = await seedUnapprovedUserWithToken()
    const res = await app.request('/auth/token/me', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(401)
  })

  it('POST /api/tokens returns 403 for an unapproved session user', async () => {
    const user = await authStore.upsertUser(TEST_USER)
    // user.allowed is false — session reflects that
    const session = authStore.createSession(user)
    const res = await app.request('/api/tokens', {
      method: 'POST',
      headers: { ...sessionHeader(session), 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'my cli' }),
    })
    expect(res.status).toBe(403)
  })

  it('POST /api/tokens succeeds once the user is approved', async () => {
    await authStore.upsertUser(TEST_USER)
    await sql`UPDATE users SET allowed = true WHERE id = ${TEST_USER.id}`
    const user = await authStore.upsertUser(TEST_USER) // re-fetch to get allowed: true
    const session = authStore.createSession(user)
    const res = await app.request('/api/tokens', {
      method: 'POST',
      headers: { ...sessionHeader(session), 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'my cli' }),
    })
    expect(res.status).toBe(201)
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

// ---------------------------------------------------------------------------
// Traffic tracking — compressed byte counts
// ---------------------------------------------------------------------------

describe('traffic tracking', () => {
  it('fetch_bytes reflects compressed wire size, not raw JSON size', async () => {
    const cliToken = await seedUserWithToken()
    await authStore.ensurePublicToken(TEST_USER.id)

    // Build a patch with enough repetitive content to be meaningfully compressible.
    const makeSample = (t: number) => ({
      time_ms: t * 2000,
      gold: 1000,
      gold_mined: 1000,
      gold_upkeep_lost: 0,
      lumber: 200,
      lumber_mined: 200,
      lumber_upkeep_lost: 0,
      food_used: 40,
      food_cap: 80,
      apm: 120,
      heroes: [],
      units: [],
    })
    const players = Array.from({ length: 8 }, (_, i) =>
      makePlayer({
        name: `Player${i}`,
        new_samples: Array.from({ length: 50 }, (__, t) => makeSample(t)),
      }),
    )
    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cliToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch({ players })),
    })

    // Measure raw (uncompressed) response size — no Accept-Encoding so body is plain JSON.
    const rawRes = await app.request('/api/back2warcraft/live/delta?since=0')
    const rawBytes = new TextEncoder().encode(await rawRes.text()).byteLength

    // Discard traffic recorded by the raw measurement before we start the real assertion.
    await trafficStore.flush()
    await sql`TRUNCATE traffic_stats`

    // Fetch with gzip so the compress middleware compresses the body.
    const compRes = await app.request('/api/back2warcraft/live/delta?since=0', {
      headers: { 'Accept-Encoding': 'gzip' },
    })
    // Consume the body — this drains the TransformStream and triggers its flush callback.
    const compressedBytes = (await compRes.arrayBuffer()).byteLength

    // Persist pending buckets to the DB.
    await trafficStore.flush()

    const publicToken = await authStore.getPublicTokenForUser(TEST_USER.id)
    const rows = await sql<
      {
        fetch_count: string
        fetch_bytes_raw: string
        fetch_bytes_wire: string
      }[]
    >`
      SELECT fetch_count, fetch_bytes_raw, fetch_bytes_wire FROM traffic_stats WHERE token = ${publicToken}
    `

    expect(rows).toHaveLength(1)
    const fetchCount = Number(rows[0].fetch_count)
    const fetchBytesRaw = Number(rows[0].fetch_bytes_raw)
    const fetchBytesWire = Number(rows[0].fetch_bytes_wire)

    expect(fetchCount).toBe(1)
    // Wire bytes must exactly match the compressed response body the client received.
    expect(fetchBytesWire).toBe(compressedBytes)
    expect(compressedBytes).toBe(1224)
    // Raw bytes must match the uncompressed JSON body.
    expect(fetchBytesRaw).toBe(rawBytes)
    expect(rawBytes).toBe(75139)
  })
})
