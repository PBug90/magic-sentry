import { brotliCompressSync } from 'node:zlib'
import { beforeAll, beforeEach, afterAll, describe, it, expect } from 'vitest'
import { migrate, sql } from '../db.js'
import { authStore } from '../authStore.js'
import { trafficStore } from '../trafficStore.js'
import { createApp } from '../app.js'
import { gameStore } from '../store.js'
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

  it('returns Cache-Control and ETag headers', async () => {
    const token = await seedUserWithToken()
    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch()),
    })
    const res = await app.request('/api/back2warcraft/live/full')
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('public, max-age=4, stale-while-revalidate=2')
    expect(res.headers.get('etag')).toMatch(/^"full-\d+"$/)
  })

  it('returns 304 when If-None-Match matches current ETag', async () => {
    const token = await seedUserWithToken()
    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch()),
    })
    const first = await app.request('/api/back2warcraft/live/full')
    const etag = first.headers.get('etag')!
    const second = await app.request('/api/back2warcraft/live/full', {
      headers: { 'if-none-match': etag },
    })
    expect(second.status).toBe(304)
    expect(await second.text()).toBe('')
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
// GET /api/game — caching headers
// ---------------------------------------------------------------------------

describe('GET /api/game', () => {
  it('returns Cache-Control and ETag headers', async () => {
    const res = await app.request('/api/game')
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('public, max-age=4, stale-while-revalidate=2')
    expect(res.headers.get('etag')).toMatch(/^"v\d+"$/)
  })

  it('returns 304 when If-None-Match matches current ETag', async () => {
    const first = await app.request('/api/game')
    const etag = first.headers.get('etag')!
    const second = await app.request('/api/game', {
      headers: { 'if-none-match': etag },
    })
    expect(second.status).toBe(304)
    expect(await second.text()).toBe('')
  })

  it('returns 200 after an ingest changes the ETag', async () => {
    const token = await seedUserWithToken()
    const before = await app.request('/api/game')
    const etagBefore = before.headers.get('etag')!

    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch()),
    })

    const stale = await app.request('/api/game', {
      headers: { 'if-none-match': etagBefore },
    })
    expect(stale.status).toBe(200)
    expect(stale.headers.get('etag')).not.toBe(etagBefore)
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
// GET /api/:channel/live/after/:from — game-agnostic entry point (no-store)
// GET /api/:channel/live/:gameId/after/:from — sealed immutable chunk stream
// ---------------------------------------------------------------------------

describe('GET /api/:channel/live/after/:from (entry route)', () => {
  async function ingest(token: string, seq: number) {
    return app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch({ seq })),
    })
  }

  it('returns 404 for an unknown channel', async () => {
    const res = await app.request('/api/unknownchannel/live/after/-1')
    expect(res.status).toBe(404)
  })

  it('returns 204 with no-store when no game is active', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    // latestSeq=0, requesting after/0 → no data beyond it
    const res = await app.request('/api/back2warcraft/live/after/0')
    expect(res.status).toBe(204)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })

  it('after/-1 returns all patches and a game-specific next URL', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    await ingest(token, 1)
    const publicId = gameStore.getPublicId('test-game-1')!
    const res = await app.request('/api/back2warcraft/live/after/-1')
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('no-store')
    const body = (await res.json()) as { patches: { seq: number }[]; next: string }
    expect(body.patches.map((p) => p.seq)).toEqual([0, 1])
    expect(body.next).toBe(`/api/back2warcraft/live/${publicId}/after/1`)
  })

  it('seals the chunk: further ingests do not change the sealed entry response', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    await ingest(token, 1)
    const publicId = gameStore.getPublicId('test-game-1')!

    // First request seals (publicId, -1) at toSeq=1
    const first = await app.request('/api/back2warcraft/live/after/-1')
    const firstBody = (await first.json()) as { patches: { seq: number }[]; next: string }
    expect(firstBody.patches.map((p) => p.seq)).toEqual([0, 1])
    expect(firstBody.next).toBe(`/api/back2warcraft/live/${publicId}/after/1`)

    // Ingest a third patch — latestSeq is now 2
    await ingest(token, 2)

    // Same URL must return the sealed chunk (still only patches 0 and 1)
    const second = await app.request('/api/back2warcraft/live/after/-1')
    const secondBody = (await second.json()) as { patches: { seq: number }[]; next: string }
    expect(secondBody.patches.map((p) => p.seq)).toEqual([0, 1])
    expect(secondBody.next).toBe(`/api/back2warcraft/live/${publicId}/after/1`)
  })
})

describe('GET /api/:channel/live/:gameId/after/:from (sealed chunk route)', () => {
  async function ingest(token: string, seq: number) {
    return app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch({ seq })),
    })
  }

  it('returns 204 with no-store when no new data exists beyond from', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    const publicId = gameStore.getPublicId('test-game-1')!
    const res = await app.request(`/api/back2warcraft/live/${publicId}/after/0`)
    expect(res.status).toBe(204)
    expect(res.headers.get('cache-control')).toBe('no-store')
  })

  it('returns only patches strictly after from', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    await ingest(token, 1)
    await ingest(token, 2)
    const publicId = gameStore.getPublicId('test-game-1')!
    const res = await app.request(`/api/back2warcraft/live/${publicId}/after/1`)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { patches: { seq: number }[]; next: string }
    expect(body.patches.map((p) => p.seq)).toEqual([2])
    expect(body.next).toBe(`/api/back2warcraft/live/${publicId}/after/2`)
  })

  it('returns Cache-Control: immutable and ETag headers', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    await ingest(token, 1)
    const publicId = gameStore.getPublicId('test-game-1')!
    const res = await app.request(`/api/back2warcraft/live/${publicId}/after/0`)
    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toBe('public, max-age=86400, immutable')
    expect(res.headers.get('etag')).toBe('"chunk-0-1"')
  })

  it('returns 304 when If-None-Match matches the chunk ETag', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    await ingest(token, 1)
    const publicId = gameStore.getPublicId('test-game-1')!
    const first = await app.request(`/api/back2warcraft/live/${publicId}/after/0`)
    const etag = first.headers.get('etag')!
    const second = await app.request(`/api/back2warcraft/live/${publicId}/after/0`, {
      headers: { 'if-none-match': etag },
    })
    expect(second.status).toBe(304)
    expect(await second.text()).toBe('')
  })

  it('seals the chunk: further ingests do not change the sealed response', async () => {
    const token = await seedUserWithToken()
    await ingest(token, 0)
    await ingest(token, 1)
    const publicId = gameStore.getPublicId('test-game-1')!

    // First request seals (publicId, 0) at toSeq=1
    const first = await app.request(`/api/back2warcraft/live/${publicId}/after/0`)
    const firstBody = (await first.json()) as { patches: { seq: number }[]; next: string }
    expect(firstBody.patches.map((p) => p.seq)).toEqual([1])

    // Ingest a third patch — latestSeq is now 2
    await ingest(token, 2)

    // Sealed chunk must still return only seq=1
    const second = await app.request(`/api/back2warcraft/live/${publicId}/after/0`)
    const secondBody = (await second.json()) as { patches: { seq: number }[]; next: string }
    expect(secondBody.patches.map((p) => p.seq)).toEqual([1])
    expect(secondBody.next).toBe(`/api/back2warcraft/live/${publicId}/after/1`)
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
      upgrades: [],
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
    const rawRes = await app.request('/api/back2warcraft/live/full')
    const rawBytes = new TextEncoder().encode(await rawRes.text()).byteLength

    // Discard traffic recorded by the raw measurement before we start the real assertion.
    await trafficStore.flush()
    await sql`TRUNCATE traffic_stats`

    // Fetch with gzip so the compress middleware compresses the body.
    const compRes = await app.request('/api/back2warcraft/live/full', {
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
    expect(compressedBytes).toBeGreaterThan(0)
    // Raw bytes must match the uncompressed JSON body.
    expect(fetchBytesRaw).toBe(rawBytes)
    expect(rawBytes).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// GET /api/:channel/history
// ---------------------------------------------------------------------------

describe('GET /api/:channel/history', () => {
  it('returns empty array when channel has no history', async () => {
    const res = await app.request('/api/back2warcraft/history')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })

  it('returns summaries for previous games after a game transition', async () => {
    const token = await seedUserWithToken()

    // Ingest game-1 and finalize it
    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch({ game_id: 'game-1', seq: 0, is_final: true,
        players: [makePlayer({ name: TEST_USER.login, result: 'Victory' })] })),
    })

    // Ingest game-2 — this triggers the game transition in setChannelGame
    await app.request('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makePatch({ game_id: 'game-2', seq: 0 })),
    })

    const res = await app.request(`/api/${TEST_USER.login}/history`)
    expect(res.status).toBe(200)
    const body = (await res.json()) as any[]
    expect(body).toHaveLength(1)
    expect(body[0].map).toBe('Lost Temple')
    expect(body[0].is_final).toBe(true)
    expect(typeof body[0].public_id).toBe('string')
    expect(body[0].players[0].name).toBe(TEST_USER.login)
    expect(body[0].players[0].result).toBe('Victory')
  })
})
