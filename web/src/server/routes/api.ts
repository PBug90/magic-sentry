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
  parseSince,
  TOKEN_RE,
  CHANNEL_RE,
  MAX_TOKEN_LABEL,
} from '../validate.js'

export const trackChannelFetch: MiddlewareHandler = async (c, next) => {
  const channel = c.req.param('channel')
  const token = channel ? await authStore.getPublicTokenByLogin(channel) : null
  await next()
  if (!token) return
  const rawBytes = rawFetchBytesStore.get(c.req.raw) ?? 0
  rawFetchBytesStore.delete(c.req.raw)
  let wireBytes = 0
  const src = c.res
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
    return c.json({ error: 'invalid JSON' }, 400)
  }

  const parsed = validatePatch(body)
  if ('error' in parsed) return c.json({ error: `invalid patch: ${parsed.error}` }, 400)

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
  return c.json(gameStore.listGames())
})

// ---------------------------------------------------------------------------
// GET /api/:channel/live/full
// GET /api/:channel/live/delta?since=0
// ---------------------------------------------------------------------------

api.get('/:channel/live/full', measureRawFetchBytes, (c) => {
  const channel = c.req.param('channel')
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)
  const gameId = gameStore.getChannelGameId(channel)
  if (!gameId) return c.json({ error: 'no game found for channel' }, 404)
  const record = gameStore.buildFullRecord(gameId)
  if (!record) return c.json({ error: 'game not found' }, 404)
  return c.json(record)
})

api.get('/:channel/live/delta', measureRawFetchBytes, (c) => {
  const channel = c.req.param('channel')
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)
  const gameId = gameStore.getChannelGameId(channel)
  if (!gameId) return c.json({ error: 'no game found for channel' }, 404)
  const since = parseSince(c.req.query('since'))
  const patches = gameStore.getPatches(gameId, since)
  return c.json({ patches })
})

export default api
