import { describe, it, expect } from 'vitest'
import {
  parseIdentity,
  parseMembers,
  primaryTier,
  primaryTierInfo,
  grantsAccess,
  buildAuthorizeUrl,
} from '../patreon.js'

// Identity response shape: data = the patreon user, included = their member
// record (patron_status + currently_entitled_tiers) plus the tier resources
// (title) requested via fields[tier]=title.
const CAMPAIGN = 'camp-1'
const identity = (patronStatus: string | null, tiers: [string, string][], campaign = CAMPAIGN) => ({
  data: { type: 'user', id: 'pat-123' },
  included: [
    {
      type: 'member',
      id: 'm1',
      attributes: { patron_status: patronStatus },
      relationships: {
        campaign: { data: { type: 'campaign', id: campaign } },
        currently_entitled_tiers: { data: tiers.map(([id]) => ({ type: 'tier', id })) },
      },
    },
    ...tiers.map(([id, title]) => ({ type: 'tier', id, attributes: { title } })),
  ],
})

describe('parseIdentity', () => {
  it('reads patreon id, status, entitled tiers and their titles for our campaign', () => {
    expect(
      parseIdentity(
        identity('active_patron', [
          ['t1', 'Bronze'],
          ['t2', 'Gold'],
        ]),
        CAMPAIGN,
      ),
    ).toEqual({
      patreonId: 'pat-123',
      active: true,
      entitledTierIds: ['t1', 't2'],
      tierNames: { t1: 'Bronze', t2: 'Gold' },
    })
  })

  it('ignores a membership to a different campaign', () => {
    const m = parseIdentity(identity('active_patron', [['t1', 'Gold']], 'someone-elses-campaign'), CAMPAIGN)
    expect(m.active).toBe(false)
    expect(m.entitledTierIds).toEqual([])
  })

  it('marks non-active patrons inactive', () => {
    expect(parseIdentity(identity('declined_patron', [['t1', 'Bronze']]), CAMPAIGN).active).toBe(false)
  })

  it('handles a user with no membership', () => {
    expect(parseIdentity({ data: { id: 'pat-9' }, included: [] }, CAMPAIGN)).toEqual({
      patreonId: 'pat-9',
      active: false,
      entitledTierIds: [],
      tierNames: {},
    })
  })
})

describe('parseMembers', () => {
  it('maps members with tier titles from shared included, and follows pagination', () => {
    const page = {
      data: [
        {
          type: 'member',
          id: 'm1',
          attributes: { patron_status: 'active_patron' },
          relationships: {
            user: { data: { type: 'user', id: 'pat-1' } },
            currently_entitled_tiers: { data: [{ id: 'gold' }] },
          },
        },
      ],
      included: [{ type: 'tier', id: 'gold', attributes: { title: 'Gold' } }],
      links: { next: 'https://patreon/next' },
    }
    const { members, next } = parseMembers(page)
    expect(next).toBe('https://patreon/next')
    expect(members).toEqual([
      { patreonId: 'pat-1', active: true, entitledTierIds: ['gold'], tierNames: { gold: 'Gold' } },
    ])
  })

  it('drops members without a resolvable user id and reports no next page', () => {
    const { members, next } = parseMembers({ data: [{ type: 'member', id: 'm', attributes: {} }] })
    expect(members).toEqual([])
    expect(next).toBeNull()
  })
})

describe('primaryTier / primaryTierInfo', () => {
  const access = new Set(['gold', 'diamond'])
  const m = {
    patreonId: 'p',
    active: true,
    entitledTierIds: ['bronze', 'gold'],
    tierNames: { bronze: 'Bronze', gold: 'Gold' },
  }
  it('prefers an allow-listed entitled tier', () => {
    expect(primaryTier(m, access)).toBe('gold')
  })
  it('returns the tier id and its display name', () => {
    expect(primaryTierInfo(m, access)).toEqual({ id: 'gold', name: 'Gold' })
  })
  it('falls back to the first tier when none are allow-listed', () => {
    expect(
      primaryTierInfo({ patreonId: 'p', active: true, entitledTierIds: ['bronze'], tierNames: { bronze: 'Bronze' } }, access),
    ).toEqual({ id: 'bronze', name: 'Bronze' })
  })
  it('is null/null with no tiers', () => {
    expect(primaryTierInfo({ patreonId: 'p', active: true, entitledTierIds: [] }, access)).toEqual({
      id: null,
      name: null,
    })
  })
})

describe('grantsAccess', () => {
  const access = new Set(['gold'])
  it('grants for an active patron on an allow-listed tier', () => {
    expect(grantsAccess(true, 'gold', access)).toBe(true)
  })
  it('denies inactive patrons', () => {
    expect(grantsAccess(false, 'gold', access)).toBe(false)
  })
  it('denies active patrons on a non-allow-listed tier', () => {
    expect(grantsAccess(true, 'bronze', access)).toBe(false)
  })
  it('denies when there is no tier', () => {
    expect(grantsAccess(true, null, access)).toBe(false)
  })
})

describe('buildAuthorizeUrl', () => {
  it('includes client id, redirect, scopes and state', () => {
    process.env.PATREON_CLIENT_ID = 'cid'
    process.env.PATREON_REDIRECT_URI = 'http://localhost:3000/auth/patreon/callback'
    const url = new URL(buildAuthorizeUrl('xyz'))
    expect(url.origin + url.pathname).toBe('https://www.patreon.com/oauth2/authorize')
    expect(url.searchParams.get('client_id')).toBe('cid')
    expect(url.searchParams.get('state')).toBe('xyz')
    expect(url.searchParams.get('scope')).toBe('identity identity.memberships')
    expect(url.searchParams.get('response_type')).toBe('code')
  })
})
