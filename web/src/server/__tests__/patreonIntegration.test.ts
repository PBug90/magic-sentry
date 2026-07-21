import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from 'vitest'
import { migrate, sql } from '../db.js'
import { authStore } from '../authStore.js'
import { createApp } from '../app.js'
import type { Membership } from '../patreon.js'
import { resetAll, TEST_USER } from './helpers.js'

const app = createApp()

// A patron account distinct from TEST_USER, inserted with the DB default
// allowed=false so we can watch Patreon flip it.
const patron = {
  id: 'patron1',
  login: 'patron',
  display_name: 'Patron',
  profile_image_url: 'https://example.com/p.png',
  allowed: false,
}

const membership = (over: Partial<Membership> = {}): Membership => ({
  patreonId: 'pat-1',
  active: true,
  entitledTierIds: ['gold'],
  tierNames: { gold: 'Gold' },
  ...over,
})

const PATREON_ENV = [
  'PATREON_CLIENT_ID',
  'PATREON_CLIENT_SECRET',
  'PATREON_REDIRECT_URI',
  'PATREON_CAMPAIGN_ID',
  'PATREON_ACCESS_TIER_IDS',
  'PATREON_CREATOR_ACCESS_TOKEN',
  'PATREON_CREATOR_REFRESH_TOKEN',
]

beforeAll(async () => {
  await migrate()
})
beforeEach(async () => {
  await resetAll()
  await sql`TRUNCATE patreon_creator`
  for (const k of PATREON_ENV) delete process.env[k]
})
afterAll(async () => {
  await sql.end()
})

const cookie = (token: string) => ({ Cookie: `session=${token}` })
const allowedOf = async (id: string) => (await authStore.getUserById(id))?.allowed

// ---------------------------------------------------------------------------
// Store — link / access recompute
// ---------------------------------------------------------------------------

describe('authStore.linkPatreon (DB)', () => {
  beforeEach(() => {
    process.env.PATREON_ACCESS_TIER_IDS = 'gold'
  })

  it('grants access for an active patron on an allow-listed tier', async () => {
    await authStore.upsertUser(patron)
    const res = await authStore.linkPatreon(patron.id, membership())
    expect(res).toEqual({ ok: true, allowed: true })
    expect(await authStore.getPatreonStatus(patron.id)).toEqual({
      linked: true,
      active: true,
      tierId: 'gold',
      tierName: 'Gold',
    })
    expect(await allowedOf(patron.id)).toBe(true)
  })

  it('does not grant for a non-allow-listed tier', async () => {
    await authStore.upsertUser(patron)
    const res = await authStore.linkPatreon(
      patron.id,
      membership({ entitledTierIds: ['bronze'], tierNames: { bronze: 'Bronze' } }),
    )
    expect(res).toEqual({ ok: true, allowed: false })
    expect(await allowedOf(patron.id)).toBe(false)
  })

  it('does not grant for an inactive patron', async () => {
    await authStore.upsertUser(patron)
    const res = await authStore.linkPatreon(patron.id, membership({ active: false }))
    expect(res).toEqual({ ok: true, allowed: false })
  })

  it('rejects a Patreon already linked to another user, leaving the second unlinked', async () => {
    await authStore.upsertUser(patron)
    await authStore.upsertUser({ ...patron, id: 'other', login: 'other' })
    await authStore.linkPatreon('other', membership({ patreonId: 'shared' }))
    const res = await authStore.linkPatreon(patron.id, membership({ patreonId: 'shared' }))
    expect(res).toEqual({ ok: false, reason: 'conflict' })
    expect((await authStore.getPatreonStatus(patron.id)).linked).toBe(false)
  })

  it('keeps an admin-approved user allowed even without a qualifying membership', async () => {
    await authStore.upsertUser(patron)
    await sql`UPDATE users SET admin_allowed = true WHERE id = ${patron.id}`
    const res = await authStore.linkPatreon(
      patron.id,
      membership({ active: false, entitledTierIds: [] }),
    )
    expect(res).toEqual({ ok: true, allowed: true })
  })
})

describe('authStore.unlinkPatreon (DB)', () => {
  it('clears the link and drops access', async () => {
    process.env.PATREON_ACCESS_TIER_IDS = 'gold'
    await authStore.upsertUser(patron)
    await authStore.linkPatreon(patron.id, membership())
    expect(await allowedOf(patron.id)).toBe(true)

    expect(await authStore.unlinkPatreon(patron.id)).toBe(false)
    expect(await authStore.getPatreonStatus(patron.id)).toEqual({
      linked: false,
      active: false,
      tierId: null,
      tierName: null,
    })
    expect(await allowedOf(patron.id)).toBe(false)
  })

  it('keeps access for an admin-approved user after unlink', async () => {
    await authStore.upsertUser(patron)
    await sql`UPDATE users SET admin_allowed = true WHERE id = ${patron.id}`
    expect(await authStore.unlinkPatreon(patron.id)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Store — periodic member sync
// ---------------------------------------------------------------------------

describe('authStore.syncAllPatreon (DB)', () => {
  beforeEach(() => {
    process.env.PATREON_ACCESS_TIER_IDS = 'gold'
  })

  it('revokes a linked user who is no longer in the member list', async () => {
    await authStore.upsertUser(patron)
    await authStore.linkPatreon(patron.id, membership())
    expect(await allowedOf(patron.id)).toBe(true)

    expect(await authStore.syncAllPatreon([])).toBe(1)
    expect((await authStore.getPatreonStatus(patron.id)).active).toBe(false)
    expect(await allowedOf(patron.id)).toBe(false)
  })

  it('grants access when a linked user upgrades into an allow-listed tier', async () => {
    await authStore.upsertUser(patron)
    await authStore.linkPatreon(patron.id, membership({ active: false, entitledTierIds: [] }))
    expect(await allowedOf(patron.id)).toBe(false)

    await authStore.syncAllPatreon([membership()])
    expect(await authStore.getPatreonStatus(patron.id)).toMatchObject({
      active: true,
      tierId: 'gold',
      tierName: 'Gold',
    })
    expect(await allowedOf(patron.id)).toBe(true)
  })

  it('leaves unlinked users untouched', async () => {
    await authStore.upsertUser(patron)
    expect(await authStore.syncAllPatreon([membership()])).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Store — creator token (single row)
// ---------------------------------------------------------------------------

describe('authStore creator tokens (DB)', () => {
  it('returns null when nothing is configured or stored', async () => {
    expect(await authStore.getCreatorTokens()).toBeNull()
  })

  it('seeds from env once, then serves the stored pair (env ignored after)', async () => {
    process.env.PATREON_CREATOR_ACCESS_TOKEN = 'acc'
    process.env.PATREON_CREATOR_REFRESH_TOKEN = 'ref'
    expect(await authStore.getCreatorTokens()).toEqual({ accessToken: 'acc', refreshToken: 'ref' })

    process.env.PATREON_CREATOR_ACCESS_TOKEN = 'changed'
    expect(await authStore.getCreatorTokens()).toEqual({ accessToken: 'acc', refreshToken: 'ref' })
  })

  it('saveCreatorTokens upserts the single row', async () => {
    await authStore.saveCreatorTokens({ accessToken: 'a1', refreshToken: 'r1' })
    await authStore.saveCreatorTokens({ accessToken: 'a2', refreshToken: 'r2' })
    expect(await authStore.getCreatorTokens()).toEqual({ accessToken: 'a2', refreshToken: 'r2' })
    const rows = await sql`SELECT count(*)::int AS n FROM patreon_creator`
    expect(rows[0].n).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

describe('GET /auth/patreon', () => {
  it('returns 500 naming the missing var when unconfigured', async () => {
    const res = await app.request('/auth/patreon')
    expect(res.status).toBe(500)
    expect(await res.text()).toContain('PATREON_CLIENT_ID')
  })

  it('returns 500 for PATREON_CAMPAIGN_ID when only the client id is set', async () => {
    process.env.PATREON_CLIENT_ID = 'cid'
    const res = await app.request('/auth/patreon')
    expect(res.status).toBe(500)
    expect(await res.text()).toContain('PATREON_CAMPAIGN_ID')
  })

  it('redirects to Patreon consent for a logged-in user', async () => {
    process.env.PATREON_CLIENT_ID = 'cid'
    process.env.PATREON_CAMPAIGN_ID = 'camp-1'
    process.env.PATREON_REDIRECT_URI = 'http://localhost:3000/auth/patreon/callback'
    await authStore.upsertUser(patron)
    const session = authStore.createSession(patron)
    const res = await app.request('/auth/patreon', { headers: cookie(session) })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('patreon.com/oauth2/authorize')
  })

  it('redirects to login_required without a session', async () => {
    process.env.PATREON_CLIENT_ID = 'cid'
    process.env.PATREON_CAMPAIGN_ID = 'camp-1'
    const res = await app.request('/auth/patreon')
    expect(res.headers.get('location')).toContain('patreon=login_required')
  })
})

describe('POST /auth/patreon/disconnect', () => {
  it('returns 401 without a session', async () => {
    const res = await app.request('/auth/patreon/disconnect', { method: 'POST' })
    expect(res.status).toBe(401)
  })

  it('unlinks the session user', async () => {
    process.env.PATREON_ACCESS_TIER_IDS = 'gold'
    await authStore.upsertUser(patron)
    await authStore.linkPatreon(patron.id, membership())
    const session = authStore.createSession(patron)
    const res = await app.request('/auth/patreon/disconnect', {
      method: 'POST',
      headers: cookie(session),
    })
    expect(res.status).toBe(200)
    expect((await authStore.getPatreonStatus(patron.id)).linked).toBe(false)
  })
})

describe('GET /api/me (Patreon)', () => {
  it('returns fresh allowed and the patreon status after linking', async () => {
    process.env.PATREON_ACCESS_TIER_IDS = 'gold'
    await authStore.upsertUser(patron)
    const session = authStore.createSession(patron) // snapshot: allowed=false
    await authStore.linkPatreon(patron.id, membership()) // flips DB allowed=true
    const res = await app.request('/api/me', { headers: cookie(session) })
    const body = (await res.json()) as any
    expect(body.user.allowed).toBe(true) // fresh, not the stale session snapshot
    expect(body.patreon).toEqual({ linked: true, active: true, tierId: 'gold', tierName: 'Gold' })
  })

  it('returns nulls when signed out', async () => {
    const res = await app.request('/api/me')
    const body = (await res.json()) as any
    expect(body.user).toBeNull()
    expect(body.patreon).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Callback — full OAuth round-trip with Patreon HTTP mocked
// ---------------------------------------------------------------------------

describe('GET /auth/patreon/callback', () => {
  beforeEach(() => {
    process.env.PATREON_CLIENT_ID = 'cid'
    process.env.PATREON_CLIENT_SECRET = 'sec'
    process.env.PATREON_CAMPAIGN_ID = 'camp-1'
    process.env.PATREON_ACCESS_TIER_IDS = 'gold'
    process.env.PATREON_REDIRECT_URI = 'http://localhost:3000/auth/patreon/callback'
  })

  const mockFetch = (identity: unknown) =>
    vi.fn(async (url: string) => {
      if (String(url).includes('/oauth2/token')) {
        return new Response(JSON.stringify({ access_token: 'AT', refresh_token: 'RT' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      }
      if (String(url).includes('/identity')) {
        return new Response(JSON.stringify(identity), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      }
      throw new Error(`unexpected fetch: ${url}`)
    })

  const identityJson = (campaign: string) => ({
    data: { id: 'pat-9' },
    included: [
      {
        type: 'member',
        id: 'm',
        attributes: { patron_status: 'active_patron' },
        relationships: {
          campaign: { data: { id: campaign } },
          currently_entitled_tiers: { data: [{ id: 'gold' }] },
        },
      },
      { type: 'tier', id: 'gold', attributes: { title: 'Gold' } },
    ],
  })

  it('links and grants access on the happy path', async () => {
    await authStore.upsertUser(patron)
    const session = authStore.createSession(patron)
    const state = authStore.createOAuthState()
    vi.stubGlobal('fetch', mockFetch(identityJson('camp-1')))
    try {
      const res = await app.request(`/auth/patreon/callback?code=abc&state=${state}`, {
        headers: cookie(session),
      })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toContain('patreon=connected')
      expect(await authStore.getPatreonStatus(patron.id)).toEqual({
        linked: true,
        active: true,
        tierId: 'gold',
        tierName: 'Gold',
      })
      expect(await allowedOf(patron.id)).toBe(true)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('ignores a membership to a different campaign (no access)', async () => {
    await authStore.upsertUser(patron)
    const session = authStore.createSession(patron)
    const state = authStore.createOAuthState()
    vi.stubGlobal('fetch', mockFetch(identityJson('someone-else')))
    try {
      const res = await app.request(`/auth/patreon/callback?code=abc&state=${state}`, {
        headers: cookie(session),
      })
      expect(res.headers.get('location')).toContain('patreon=connected')
      // Linked, but not an active patron of *our* campaign → no access.
      const status = await authStore.getPatreonStatus(patron.id)
      expect(status.active).toBe(false)
      expect(await allowedOf(patron.id)).toBe(false)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('redirects to error for a bad/consumed state', async () => {
    await authStore.upsertUser(patron)
    const session = authStore.createSession(patron)
    const res = await app.request(`/auth/patreon/callback?code=abc&state=nope`, {
      headers: cookie(session),
    })
    expect(res.headers.get('location')).toContain('patreon=error')
  })
})
