import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { Hono } from 'hono'
import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { gameStore } from '../store.js'
import { authStore } from '../authStore.js'
import { trafficStore } from '../trafficStore.js'
import { sql } from '../db.js'
import {
  validatePatch,
  validateTokenLabel,
  TOKEN_RE,
  CHANNEL_RE,
  MAX_TOKEN_LABEL,
} from '../validate.js'

const CC = 'public, max-age=4, stale-while-revalidate=2'
const CC_IMMUTABLE = 'public, max-age=86400, immutable'

export const trackChannelFetch: MiddlewareHandler = async (c, next) => {
  const channel = c.req.param('channel')
  const token = channel ? await authStore.getPublicTokenByLogin(channel) : null
  await next()
  if (!token) return
  const rawBytes = rawFetchBytesStore.get(c.req.raw) ?? 0
  rawFetchBytesStore.delete(c.req.raw)
  let wireBytes = 0
  const src = c.res
  if (!src.body) return
  const { readable, writable } = new TransformStream({
    transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
      wireBytes += chunk.byteLength
      controller.enqueue(chunk)
    },
    flush: () => trafficStore.record(token, 'fetch', rawBytes, wireBytes),
  })
  src.body!.pipeTo(writable)
  c.res = new Response(readable, src)
}

/** Measures the raw (pre-compression) response byte size and parks it for trackChannelFetch. */
const measureRawFetchBytes: MiddlewareHandler = async (c, next) => {
  await next()
  rawFetchBytesStore.set(c.req.raw, (await c.res.clone().arrayBuffer()).byteLength)
}

/** Shared store: inner measureRawFetchBytes writes here; outer trackChannelFetch reads it. */
export const rawFetchBytesStore = new WeakMap<Request, number>()

const api = new Hono()

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

function getSessionUser(c: Parameters<typeof getCookie>[0]) {
  const token = getCookie(c, 'session')
  if (!token) return null
  return authStore.getSession(token)?.user ?? null
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

api.get('/health', (c) => c.json({ status: 'ok' }))

// ---------------------------------------------------------------------------
// POST /api/load-example — ingest example-game.json into the in-memory store
// ---------------------------------------------------------------------------

const EXAMPLE_CHANNEL = '__example__'

const EXAMPLE_FILES: Record<string, string> = {
  all: 'example-game.json',
  'hu-orc': 'example-hu-orc.json',
  'ne-ud': 'example-ne-ud.json',
}

api.post('/load-example', (c) => {
  const game = c.req.query('game') ?? 'all'
  const filename = EXAMPLE_FILES[game]
  if (!filename) return c.json({ error: 'unknown example game' }, 400)

  let body: unknown
  try {
    const filePath = join(dirname(fileURLToPath(import.meta.url)), `../../../../${filename}`)
    body = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return c.json({ error: `${filename} not found` }, 404)
  }

  const parsed = validatePatch(body)
  if ('error' in parsed) return c.json({ error: `invalid patch: ${parsed.error}` }, 400)

  const patch = parsed.data
  gameStore.ingest(patch)
  gameStore.setChannelGame(EXAMPLE_CHANNEL, patch.game_id)
  const publicId = gameStore.getPublicId(patch.game_id)
  return c.json({ channel: EXAMPLE_CHANNEL, game_id: publicId })
})

// ---------------------------------------------------------------------------
// GET /api/me
// ---------------------------------------------------------------------------

api.get('/me', (c) => {
  const user = getSessionUser(c)
  return c.json({ user })
})

// ---------------------------------------------------------------------------
// POST /api/tokens — generate a new CLI token
// ---------------------------------------------------------------------------

api.post('/tokens', async (c) => {
  const user = getSessionUser(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  if (!user.allowed) return c.json({ error: 'account not yet approved' }, 403)

  const body = await c.req.json<{ label?: string }>().catch(() => ({}) as { label?: string })
  const labelErr = validateTokenLabel(body.label)
  if (labelErr) return c.json({ error: labelErr }, 400)

  const existing = await authStore.listTokensForUser(user.id)
  const label = body.label?.trim() || `CLI Token #${existing.length + 1}`

  const token = await authStore.createCliToken(user.id, label)
  return c.json({ token, label }, 201)
})

// ---------------------------------------------------------------------------
// GET /api/tokens — list tokens for the signed-in user
// ---------------------------------------------------------------------------

api.get('/tokens', async (c) => {
  const user = getSessionUser(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)

  const tokens = await authStore.listTokensForUser(user.id)
  return c.json(tokens.map(({ token, label, createdAt }) => ({ token, label, createdAt })))
})

// ---------------------------------------------------------------------------
// DELETE /api/tokens/:token — revoke a token
// ---------------------------------------------------------------------------

api.delete('/tokens/:token', async (c) => {
  const user = getSessionUser(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)

  const token = c.req.param('token')
  if (!TOKEN_RE.test(token)) return c.json({ error: 'not found' }, 404)

  const revoked = await authStore.revokeToken(token, user.id)
  if (!revoked) return c.json({ error: 'not found' }, 404)
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// GET /api/public-token
// ---------------------------------------------------------------------------

api.get('/public-token', async (c) => {
  const user = getSessionUser(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)
  const token = await authStore.getPublicTokenForUser(user.id)
  return c.json({ token })
})

// ---------------------------------------------------------------------------
// GET /api/traffic — per-day usage for the signed-in user (last 30 days)
// ---------------------------------------------------------------------------

api.get('/traffic', async (c) => {
  const user = getSessionUser(c)
  if (!user) return c.json({ error: 'unauthorized' }, 401)

  const rows = await sql<
    {
      day: string
      ingest_count: string
      ingest_bytes_raw: string
      ingest_bytes_wire: string
      fetch_count: string
      fetch_bytes_raw: string
      fetch_bytes_wire: string
    }[]
  >`
    WITH user_tokens AS (
      SELECT token FROM cli_tokens    WHERE user_id = ${user.id}
      UNION ALL
      SELECT token FROM public_tokens WHERE user_id = ${user.id}
    )
    SELECT
      ts.day::text                              AS day,
      SUM(ts.ingest_count)::bigint::text        AS ingest_count,
      SUM(ts.ingest_bytes_raw)::bigint::text    AS ingest_bytes_raw,
      SUM(ts.ingest_bytes_wire)::bigint::text   AS ingest_bytes_wire,
      SUM(ts.fetch_count)::bigint::text         AS fetch_count,
      SUM(ts.fetch_bytes_raw)::bigint::text     AS fetch_bytes_raw,
      SUM(ts.fetch_bytes_wire)::bigint::text    AS fetch_bytes_wire
    FROM traffic_stats ts
    JOIN user_tokens ut ON ut.token = ts.token
    WHERE ts.day >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY ts.day
    ORDER BY ts.day DESC
  `

  return c.json(
    rows.map((r) => ({
      day: r.day,
      ingestCount: Number(r.ingest_count),
      ingestBytesRaw: Number(r.ingest_bytes_raw),
      ingestBytesWire: Number(r.ingest_bytes_wire),
      fetchCount: Number(r.fetch_count),
      fetchBytesRaw: Number(r.fetch_bytes_raw),
      fetchBytesWire: Number(r.fetch_bytes_wire),
    })),
  )
})

// ---------------------------------------------------------------------------
// POST /api/ingest
// ---------------------------------------------------------------------------

api.post('/ingest', async (c) => {
  const bearer = c.req.header('authorization')?.startsWith('Bearer ')
    ? c.req.header('authorization')!.slice(7)
    : null
  if (!bearer) return c.json({ error: 'unauthorized' }, 401)
  const auth = await authStore.validateBearer(bearer)
  if (!auth.authorized) return c.json({ error: 'unauthorized' }, 401)

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    console.warn(`[ingest] malformed request from ${auth.user.login}: invalid JSON`)
    return c.json({ error: 'invalid JSON' }, 400)
  }

  const parsed = validatePatch(body)
  if ('error' in parsed) {
    console.warn(`[ingest] malformed request from ${auth.user.login}: ${parsed.error}`)
    return c.json({ error: `invalid patch: ${parsed.error}` }, 400)
  }

  const patch = parsed.data
  gameStore.ingest(patch)
  gameStore.setChannelGame(auth.user.login, patch.game_id)
  console.log(
    `[patch] channel=${auth.user.login} game=${patch.game_id} seq=${patch.seq} final=${patch.is_final}`,
  )
  return c.json({ ok: true, game_id: patch.game_id, seq: patch.seq })
})

// ---------------------------------------------------------------------------
// GET /api/game — list all known games
// ---------------------------------------------------------------------------

api.get('/game', (c) => {
  const etag = `"v${gameStore.getVersion()}"`
  if (c.req.header('if-none-match') === etag)
    return c.newResponse(null, 304, { ETag: etag, 'Cache-Control': CC })
  return c.newResponse(gameStore.getGameListJson(), 200, {
    'Content-Type': 'application/json',
    'Cache-Control': CC,
    ETag: etag,
  })
})

// ---------------------------------------------------------------------------
// GET /api/:channel/history
// ---------------------------------------------------------------------------

api.get('/:channel/history', (c) => {
  const channel = c.req.param('channel').toLowerCase()
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)
  return c.json(gameStore.getChannelHistory(channel), 200, { 'Cache-Control': CC })
})

// ---------------------------------------------------------------------------
// GET /api/:channel/live/full
// ---------------------------------------------------------------------------

api.get('/:channel/live/full', measureRawFetchBytes, (c) => {
  const channel = c.req.param('channel')
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)
  const gameId = gameStore.getChannelGameId(channel)
  if (!gameId) return c.json({ error: 'no game found for channel' }, 404)
  const record = gameStore.buildFullRecord(gameId)
  if (!record) return c.json({ error: 'game not found' }, 404)
  const etag = `"full-${gameStore.getLatestSeq(gameId)}"`
  if (c.req.header('if-none-match') === etag)
    return c.newResponse(null, 304, { ETag: etag, 'Cache-Control': CC })
  return c.json(record, 200, { 'Cache-Control': CC, ETag: etag })
})

// ---------------------------------------------------------------------------
// GET /api/:channel/live/after/:from — game-agnostic entry point
//
// Not cached (no-store): the current game changes over time so the channel
// URL is not stable. Returns `next` pointing at the game-specific immutable
// URL so every subsequent request is CDN-cacheable.
// ---------------------------------------------------------------------------

api.get('/:channel/live/after/:from', measureRawFetchBytes, (c) => {
  const channel = c.req.param('channel')
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)

  const fromSeq = parseInt(c.req.param('from'), 10)
  if (isNaN(fromSeq)) return c.json({ error: 'invalid from' }, 400)

  const internalId = gameStore.getChannelGameId(channel)
  if (!internalId)
    return c.json({ error: 'no game found for channel' }, 404, {
      'Cache-Control': 'public, max-age=30',
    })

  const publicId = gameStore.getPublicId(internalId)
  if (!publicId)
    return c.json({ error: 'no game found for channel' }, 404, {
      'Cache-Control': 'public, max-age=30',
    })

  const latestSeq = gameStore.getLatestSeq(internalId)
  if (latestSeq <= fromSeq)
    return c.newResponse(null, 204, { 'Cache-Control': 'public, max-age=10' })

  const toSeq = gameStore.sealChunk(publicId, fromSeq, latestSeq)
  const patches = gameStore.getChunk(internalId, fromSeq, toSeq)
  const next = `/api/${channel}/live/${publicId}/after/${toSeq}`

  return c.json({ patches, next }, 200, { 'Cache-Control': 'no-store' })
})

// ---------------------------------------------------------------------------
// GET /api/:channel/live/:gameId/after/:from — sealed immutable chunk stream
//
// Each response covers patches (fromSeq, toSeq] where toSeq is locked to
// latestSeq on the first request for that (gameId, fromSeq) pair
// (first-write-wins seal). Including gameId in the URL ensures chunks from
// different games never collide in the CDN cache.
//
// 204 no-store when no new patches exist yet — client should retry later.
// ---------------------------------------------------------------------------

api.get('/:channel/live/:gameId/after/:from', measureRawFetchBytes, (c) => {
  const channel = c.req.param('channel')
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)

  const publicId = c.req.param('gameId')
  const internalId = gameStore.getInternalGameId(publicId)
  if (!internalId) return c.newResponse(null, 204, { 'Cache-Control': 'public, max-age=5' })

  const fromSeq = parseInt(c.req.param('from'), 10)
  if (isNaN(fromSeq)) return c.json({ error: 'invalid from' }, 400)

  const latestSeq = gameStore.getLatestSeq(internalId)
  if (latestSeq <= fromSeq)
    return c.newResponse(null, 204, { 'Cache-Control': 'public, max-age=5' })

  const toSeq = gameStore.sealChunk(publicId, fromSeq, latestSeq)
  const patches = gameStore.getChunk(internalId, fromSeq, toSeq)
  const next = `/api/${channel}/live/${publicId}/after/${toSeq}`
  const etag = `"chunk-${fromSeq}-${toSeq}"`

  if (c.req.header('if-none-match') === etag)
    return c.newResponse(null, 304, { ETag: etag, 'Cache-Control': CC_IMMUTABLE })

  return c.json({ patches, next }, 200, { 'Cache-Control': CC_IMMUTABLE, ETag: etag })
})

export default api
