// Patreon OAuth + API client. All network access to Patreon lives here so the
// rest of the server (and the tests) work against small, pure helpers. No DB
// imports — keep this module side-effect free so patreon.test.ts runs without a
// database.

const AUTHORIZE_URL = 'https://www.patreon.com/oauth2/authorize'
const TOKEN_URL = 'https://www.patreon.com/api/oauth2/token'
const API = 'https://www.patreon.com/api/oauth2/v2'

// --- Config (env) ----------------------------------------------------------

// Requires a campaign id: the identity endpoint can return the user's
// memberships to *other* creators' campaigns, so we must scope to ours.
export const patreonConfigured = (): boolean =>
  !!process.env.PATREON_CLIENT_ID && !!process.env.PATREON_CAMPAIGN_ID
const clientId = () => process.env.PATREON_CLIENT_ID ?? ''
const clientSecret = () => process.env.PATREON_CLIENT_SECRET ?? ''
export const redirectUri = () =>
  process.env.PATREON_REDIRECT_URI ?? 'http://localhost:3000/auth/patreon/callback'

/** Allow-listed tier ids that grant access, parsed from PATREON_ACCESS_TIER_IDS. */
export const accessTierIds = (): Set<string> =>
  new Set(
    (process.env.PATREON_ACCESS_TIER_IDS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )

export const campaignId = (): string => process.env.PATREON_CAMPAIGN_ID ?? ''

// --- Shapes ----------------------------------------------------------------

export interface PatreonTokens {
  accessToken: string
  refreshToken: string
}

/** A patron's standing in the campaign, distilled from the Patreon API. */
export interface Membership {
  patreonId: string
  active: boolean
  entitledTierIds: string[]
  /** Tier id -> display title, for tiers present in the same API response. */
  tierNames?: Record<string, string>
}

// --- Pure helpers (unit-tested) -------------------------------------------

/** OAuth consent URL for linking a Patreon account to the current session. */
export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId(),
    redirect_uri: redirectUri(),
    scope: 'identity identity.memberships',
    state,
  })
  return `${AUTHORIZE_URL}?${params}`
}

type Rel = { data?: { id: string } | { id: string }[] }
interface Resource {
  type: string
  id: string
  attributes?: { patron_status?: string | null; title?: string | null }
  relationships?: {
    user?: Rel
    campaign?: Rel
    currently_entitled_tiers?: Rel
  }
}

const campaignIdOf = (r: Resource): string | null => {
  const c = r.relationships?.campaign?.data
  return c && !Array.isArray(c) ? c.id : null
}

const tierIdsOf = (r: Resource): string[] => {
  const d = r.relationships?.currently_entitled_tiers?.data
  return Array.isArray(d) ? d.map((t) => t.id) : d ? [d.id] : []
}

/** Map tier id -> title from the `included` resources of any API response. */
const tierNamesFromIncluded = (included: Resource[]): Record<string, string> => {
  const names: Record<string, string> = {}
  for (const r of included)
    if (r.type === 'tier' && r.attributes?.title) names[r.id] = r.attributes.title
  return names
}

/** The display title for the tier we store, if the API returned it. */
export function primaryTierInfo(
  m: Membership,
  access: Set<string>,
): { id: string | null; name: string | null } {
  const id = primaryTier(m, access)
  return { id, name: id ? (m.tierNames?.[id] ?? null) : null }
}

/**
 * Parse the /identity response (include=memberships.currently_entitled_tiers).
 * `data.id` is the Patreon user id; the single `member` in `included` carries
 * their patron_status and entitled tiers for this client's campaign.
 */
export function parseIdentity(json: any, campaignId?: string): Membership {
  const patreonId: string = json?.data?.id ?? ''
  const included: Resource[] = json?.included ?? []
  const members = included.filter((r) => r.type === 'member')
  // Only the membership to *our* campaign counts. Without a campaign id we
  // cannot scope, so treat the user as a non-patron rather than risk reading a
  // membership to a different creator's project.
  const member = campaignId ? members.find((m) => campaignIdOf(m) === campaignId) : undefined
  return {
    patreonId,
    active: member?.attributes?.patron_status === 'active_patron',
    entitledTierIds: member ? tierIdsOf(member) : [],
    tierNames: tierNamesFromIncluded(included),
  }
}

/**
 * Parse one page of /campaigns/{id}/members (include=currently_entitled_tiers,user).
 * Returns each member's standing plus the next-page URL for pagination.
 */
export function parseMembers(json: any): { members: Membership[]; next: string | null } {
  const tierNames = tierNamesFromIncluded(json?.included ?? [])
  const members: Membership[] = (json?.data ?? []).map((m: Resource): Membership => {
    const userRel = m.relationships?.user?.data
    const patreonId = userRel && !Array.isArray(userRel) ? userRel.id : ''
    return {
      patreonId,
      active: m.attributes?.patron_status === 'active_patron',
      entitledTierIds: tierIdsOf(m),
      tierNames,
    }
  })
  return { members: members.filter((m) => m.patreonId), next: json?.links?.next ?? null }
}

/** The tier to store/display: an allow-listed entitled tier if any, else the first. */
export function primaryTier(m: Membership, access: Set<string>): string | null {
  return m.entitledTierIds.find((t) => access.has(t)) ?? m.entitledTierIds[0] ?? null
}

/** Whether a stored (active, tierId) grants access under the current allow-list. */
export function grantsAccess(active: boolean, tierId: string | null, access: Set<string>): boolean {
  return active && tierId !== null && access.has(tierId)
}

// --- Network ---------------------------------------------------------------

async function postForm(body: Record<string, string>): Promise<PatreonTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })
  if (!res.ok) throw new Error(`patreon token exchange failed: ${res.status}`)
  const json = (await res.json()) as { access_token: string; refresh_token: string }
  return { accessToken: json.access_token, refreshToken: json.refresh_token }
}

export function exchangeCode(code: string): Promise<PatreonTokens> {
  return postForm({
    code,
    grant_type: 'authorization_code',
    client_id: clientId(),
    client_secret: clientSecret(),
    redirect_uri: redirectUri(),
  })
}

export function refreshTokens(refreshToken: string): Promise<PatreonTokens> {
  return postForm({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId(),
    client_secret: clientSecret(),
  })
}

/** Fetch the linking user's own membership standing. */
export async function fetchIdentity(accessToken: string): Promise<Membership> {
  const url = `${API}/identity?include=memberships.currently_entitled_tiers,memberships.campaign&fields%5Bmember%5D=patron_status&fields%5Btier%5D=title`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) throw new Error(`patreon identity failed: ${res.status}`)
  return parseIdentity(await res.json(), campaignId())
}

/** Fetch every member of the configured campaign (paginated), using a creator token. */
export async function fetchCampaignMembers(creatorAccessToken: string): Promise<Membership[]> {
  const first = `${API}/campaigns/${campaignId()}/members?include=currently_entitled_tiers,user&fields%5Bmember%5D=patron_status&fields%5Btier%5D=title&page%5Bcount%5D=500`
  const out: Membership[] = []
  let url: string | null = first
  while (url) {
    const res: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${creatorAccessToken}` },
    })
    if (!res.ok) throw new Error(`patreon members failed: ${res.status}`)
    const { members, next } = parseMembers(await res.json())
    out.push(...members)
    url = next
  }
  return out
}
