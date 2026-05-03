import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { gameStore } from '../store.js'
import { authStore } from '../authStore.js'
import type { GamePatch } from '../types.js'

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

  const revoked = await authStore.revokeToken(c.req.param('token'), user.id)
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
// POST /api/ingest
// ---------------------------------------------------------------------------

api.post('/ingest', async (c) => {
  const bearer = c.req.header('authorization')?.startsWith('Bearer ')
    ? c.req.header('authorization')!.slice(7)
    : null
  if (!bearer) return c.json({ error: 'unauthorized' }, 401)
  const auth = await authStore.validateBearer(bearer)
  if (!auth.authorized) return c.json({ error: 'unauthorized' }, 401)

  let patch: GamePatch
  try {
    patch = await c.req.json<GamePatch>()
  } catch {
    return c.json({ error: 'invalid JSON' }, 400)
  }

  if (
    typeof patch.game_id !== 'string' ||
    typeof patch.seq !== 'number' ||
    typeof patch.is_final !== 'boolean' ||
    !Array.isArray(patch.players)
  ) {
    return c.json({ error: 'malformed patch: missing required fields' }, 400)
  }

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
  const gameId = gameStore.getChannelGameId(c.req.param('channel'))
  if (!gameId) return c.json({ error: 'no game found for channel' }, 404)
  const record = gameStore.buildFullRecord(gameId)
  if (!record) return c.json({ error: 'game not found' }, 404)
  return c.json(record)
})

api.get('/:channel/live/delta', (c) => {
  const gameId = gameStore.getChannelGameId(c.req.param('channel'))
  if (!gameId) return c.json({ error: 'no game found for channel' }, 404)
  const since = Math.max(0, Number(c.req.query('since') ?? '0'))
  const patches = gameStore.getPatches(gameId, since)
  return c.json({ patches })
})

export default api
