import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { authStore } from '../authStore.js'
import { patreonConfigured, buildAuthorizeUrl, exchangeCode, fetchIdentity } from '../patreon.js'

const auth = new Hono()

/** The Twitch user for the current session cookie, or null. */
function sessionUser(c: Parameters<typeof getCookie>[0]) {
  const token = getCookie(c, 'session')
  if (!token) return null
  return authStore.getSession(token)?.user ?? null
}

function clientId() {
  return process.env.TWITCH_CLIENT_ID ?? ''
}
function clientSecret() {
  return process.env.TWITCH_CLIENT_SECRET ?? ''
}
function redirectUri() {
  return process.env.TWITCH_REDIRECT_URI ?? 'http://localhost:3000/auth/twitch/callback'
}

// ---------------------------------------------------------------------------
// GET /auth/twitch — redirect to Twitch OAuth consent screen
// ---------------------------------------------------------------------------

auth.get('/twitch', (c) => {
  if (!clientId()) return c.text('TWITCH_CLIENT_ID not configured', 500)
  const state = authStore.createOAuthState()
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'user:read:email',
    state,
  })
  return c.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`)
})

// ---------------------------------------------------------------------------
// GET /auth/twitch/callback — exchange code, create session, redirect home
// ---------------------------------------------------------------------------

auth.get('/twitch/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')

  if (error || !code || !state || !authStore.consumeOAuthState(state)) {
    return c.redirect('/?auth=error')
  }

  // Exchange authorization code for access token
  const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri(),
    }),
  })

  if (!tokenRes.ok) return c.redirect('/?auth=error')

  const { access_token } = (await tokenRes.json()) as { access_token: string }

  // Fetch Twitch user profile
  const userRes = await fetch('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Client-Id': clientId(),
    },
  })

  if (!userRes.ok) return c.redirect('/?auth=error')

  const { data } = (await userRes.json()) as {
    data: Array<{
      id: string
      login: string
      display_name: string
      profile_image_url: string
    }>
  }

  const twitchUser = data[0]
  const user = await authStore.upsertUser(twitchUser)
  await authStore.ensurePublicToken(user.id)
  const sessionToken = authStore.createSession(user)

  setCookie(c, 'session', sessionToken, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return c.redirect('/')
})

// ---------------------------------------------------------------------------
// POST /auth/me — validate a Bearer token and return the associated user.
// Used by the CLI to confirm its token is accepted before recording begins.
// Returns { authorized: true, user } on success.
// ---------------------------------------------------------------------------

auth.post('/token/me', async (c) => {
  const authHeader = c.req.header('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!bearer) return c.json({ error: 'missing token' }, 401)

  const result = await authStore.validateBearer(bearer)
  if (!result.authorized) return c.json({ error: result.reason }, 401)

  return c.json({ authorized: true, user: result.user })
})

// ---------------------------------------------------------------------------
// POST /auth/logout
// ---------------------------------------------------------------------------

auth.post('/logout', (c) => {
  const token = getCookie(c, 'session')
  if (token) authStore.deleteSession(token)
  deleteCookie(c, 'session', { path: '/' })
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Patreon linking (requires an existing Twitch session)
// ---------------------------------------------------------------------------

// GET /auth/patreon — redirect a logged-in user to Patreon consent
auth.get('/patreon', (c) => {
  if (!process.env.PATREON_CLIENT_ID) return c.text('PATREON_CLIENT_ID not configured', 500)
  if (!process.env.PATREON_CAMPAIGN_ID) return c.text('PATREON_CAMPAIGN_ID not configured', 500)
  if (!patreonConfigured()) return c.text('Patreon not configured', 500)
  if (!sessionUser(c)) return c.redirect('/settings?patreon=login_required')
  const state = authStore.createOAuthState()
  return c.redirect(buildAuthorizeUrl(state))
})

// GET /auth/patreon/callback — verify, evaluate tier, link to the session user
auth.get('/patreon/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')
  const token = getCookie(c, 'session')
  const user = token ? (authStore.getSession(token)?.user ?? null) : null

  if (error || !code || !state || !authStore.consumeOAuthState(state) || !user || !token) {
    return c.redirect('/settings?patreon=error')
  }

  try {
    const tokens = await exchangeCode(code)
    const membership = await fetchIdentity(tokens.accessToken)
    if (!membership.patreonId) return c.redirect('/settings?patreon=error')
    const res = await authStore.linkPatreon(user.id, membership)
    if (!res.ok) return c.redirect('/settings?patreon=already_linked')
    await authStore.refreshSessionAllowed(token)
    return c.redirect('/settings?patreon=connected')
  } catch (e) {
    console.error('[patreon] callback failed:', e)
    return c.redirect('/settings?patreon=error')
  }
  // Note: the linking user's Patreon tokens are intentionally discarded here —
  // ongoing access is re-evaluated from the campaign member list, not per-user.
})

// POST /auth/patreon/disconnect — unlink and re-evaluate access
auth.post('/patreon/disconnect', async (c) => {
  const token = getCookie(c, 'session')
  const user = token ? (authStore.getSession(token)?.user ?? null) : null
  if (!user || !token) return c.json({ error: 'unauthorized' }, 401)
  await authStore.unlinkPatreon(user.id)
  await authStore.refreshSessionAllowed(token)
  return c.json({ ok: true })
})

export default auth
