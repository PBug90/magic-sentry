import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { gameStore } from '../store.js'
import { authStore } from '../authStore.js'
import { sql } from '../db.js'
import {
  validatePatch,
  validateTokenLabel,
  parseSince,
  TOKEN_RE,
  CHANNEL_RE,
  MAX_TOKEN_LABEL,
} from '../validate.js'

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
      ingest_bytes: string
      fetch_count: string
      fetch_bytes: string
    }[]
  >`
    WITH user_tokens AS (
      SELECT token FROM cli_tokens    WHERE user_id = ${user.id}
      UNION ALL
      SELECT token FROM public_tokens WHERE user_id = ${user.id}
    )
    SELECT
      ts.day::text                        AS day,
      SUM(ts.ingest_count)::bigint::text  AS ingest_count,
      SUM(ts.ingest_bytes)::bigint::text  AS ingest_bytes,
      SUM(ts.fetch_count)::bigint::text   AS fetch_count,
      SUM(ts.fetch_bytes)::bigint::text   AS fetch_bytes
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
      ingestBytes: Number(r.ingest_bytes),
      fetchCount: Number(r.fetch_count),
      fetchBytes: Number(r.fetch_bytes),
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

api.get('/:channel/live/full', (c) => {
  const channel = c.req.param('channel')
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)
  const gameId = gameStore.getChannelGameId(channel)
  if (!gameId) return c.json({ error: 'no game found for channel' }, 404)
  const record = gameStore.buildFullRecord(gameId)
  if (!record) return c.json({ error: 'game not found' }, 404)
  return c.json(record)
})

api.get('/:channel/live/delta', (c) => {
  const channel = c.req.param('channel')
  if (!CHANNEL_RE.test(channel)) return c.json({ error: 'invalid channel' }, 400)
  const gameId = gameStore.getChannelGameId(channel)
  if (!gameId) return c.json({ error: 'no game found for channel' }, 404)
  const since = parseSince(c.req.query('since'))
  const patches = gameStore.getPatches(gameId, since)
  return c.json({ patches })
})

export default api
