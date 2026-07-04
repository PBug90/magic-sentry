import { randomBytes } from 'crypto'
import { sql } from './db.js'
import {
  grantsAccess,
  accessTierIds,
  primaryTierInfo,
  type Membership,
  type PatreonTokens,
} from './patreon.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TwitchUser {
  id: string
  login: string
  display_name: string
  profile_image_url: string
  allowed: boolean
}

export interface Session {
  user: TwitchUser
  createdAt: Date
}

export interface CliToken {
  token: string
  userId: string
  label: string
  createdAt: Date
}

// ---------------------------------------------------------------------------
// Row shapes returned by postgres
// ---------------------------------------------------------------------------

interface CliTokenRow {
  token: string
  user_id: string
  label: string
  created_at: Date
}

// ---------------------------------------------------------------------------
// Token validation result
// ---------------------------------------------------------------------------

export type TokenValidationResult =
  | { authorized: true; user: TwitchUser }
  | { authorized: false; reason: string }

export interface PatreonStatus {
  linked: boolean
  active: boolean
  tierId: string | null
  tierName: string | null
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

class AuthStore {
  // OAuth CSRF nonces — short-lived, in-memory only
  private oauthStates = new Map<string, number>() // state -> expiry ms

  // Sessions — in-memory only (users re-authenticate after restart)
  private sessions = new Map<string, Session>() // sessionToken -> Session

  // ---------------------------------------------------------------------------
  // OAuth state nonces
  // ---------------------------------------------------------------------------

  reset(): void {
    this.oauthStates.clear()
    this.sessions.clear()
  }

  createOAuthState(): string {
    const state = randomBytes(16).toString('hex')
    this.oauthStates.set(state, Date.now() + 10 * 60 * 1000) // 10-min TTL
    return state
  }

  consumeOAuthState(state: string): boolean {
    const expiry = this.oauthStates.get(state)
    if (!expiry || Date.now() > expiry) return false
    this.oauthStates.delete(state)
    return true
  }

  // ---------------------------------------------------------------------------
  // Sessions
  // ---------------------------------------------------------------------------

  createSession(user: TwitchUser): string {
    const token = randomBytes(32).toString('hex')
    this.sessions.set(token, { user, createdAt: new Date() })
    return token
  }

  getSession(token: string): Session | null {
    return this.sessions.get(token) ?? null
  }

  deleteSession(token: string): void {
    this.sessions.delete(token)
  }

  // ---------------------------------------------------------------------------
  // Users (persisted)
  // ---------------------------------------------------------------------------

  async upsertUser(user: Omit<TwitchUser, 'allowed'>): Promise<TwitchUser> {
    const rows = await sql<{ allowed: boolean }[]>`
      INSERT INTO users (id, login, display_name, profile_image_url)
      VALUES (${user.id}, ${user.login}, ${user.display_name}, ${user.profile_image_url})
      ON CONFLICT (id) DO UPDATE SET
        login             = EXCLUDED.login,
        display_name      = EXCLUDED.display_name,
        profile_image_url = EXCLUDED.profile_image_url,
        updated_at        = NOW()
      RETURNING allowed
    `
    return { ...user, allowed: rows[0].allowed }
  }

  // ---------------------------------------------------------------------------
  // CLI tokens (persisted)
  // ---------------------------------------------------------------------------

  async createCliToken(userId: string, label: string): Promise<string> {
    const token = randomBytes(32).toString('hex')
    await sql`
      INSERT INTO cli_tokens (token, user_id, label)
      VALUES (${token}, ${userId}, ${label})
    `
    return token
  }

  async listTokensForUser(userId: string): Promise<CliToken[]> {
    const rows = await sql<CliTokenRow[]>`
      SELECT token, user_id, label, created_at
      FROM cli_tokens
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `
    return rows.map((r) => ({
      token: r.token,
      userId: r.user_id,
      label: r.label,
      createdAt: r.created_at,
    }))
  }

  async revokeToken(token: string, userId: string): Promise<boolean> {
    const result = await sql`
      DELETE FROM cli_tokens WHERE token = ${token} AND user_id = ${userId}
    `
    return result.count > 0
  }

  async isValidCliToken(token: string): Promise<boolean> {
    const rows = await sql`
      SELECT 1 FROM cli_tokens WHERE token = ${token} LIMIT 1
    `
    return rows.length > 0
  }

  /** Returns the Twitch user associated with a CLI token, or null if not found. */
  async getUserByCliToken(token: string): Promise<TwitchUser | null> {
    const rows = await sql<
      {
        id: string
        login: string
        display_name: string
        profile_image_url: string
        allowed: boolean
      }[]
    >`
      SELECT u.id, u.login, u.display_name, u.profile_image_url, u.allowed
      FROM cli_tokens ct
      JOIN users u ON u.id = ct.user_id
      WHERE ct.token = ${token}
      LIMIT 1
    `
    return rows.length > 0 ? rows[0] : null
  }

  // ---------------------------------------------------------------------------
  // Public tokens (one per user, auto-generated on login)
  // ---------------------------------------------------------------------------

  async ensurePublicToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex')
    await sql`
      INSERT INTO public_tokens (token, user_id)
      VALUES (${token}, ${userId})
      ON CONFLICT (user_id) DO NOTHING
    `
    const rows = await sql<{ token: string }[]>`
      SELECT token FROM public_tokens WHERE user_id = ${userId}
    `
    return rows[0].token
  }

  async getPublicTokenForUser(userId: string): Promise<string | null> {
    const rows = await sql<{ token: string }[]>`
      SELECT token FROM public_tokens WHERE user_id = ${userId}
    `
    return rows.length > 0 ? rows[0].token : null
  }

  async getPublicTokenByLogin(login: string): Promise<string | null> {
    const rows = await sql<{ token: string }[]>`
      SELECT pt.token
      FROM public_tokens pt
      JOIN users u ON u.id = pt.user_id
      WHERE u.login = ${login.toLowerCase()}
      LIMIT 1
    `
    return rows.length > 0 ? rows[0].token : null
  }

  private async getUserByPublicToken(token: string): Promise<TwitchUser | null> {
    const rows = await sql<
      {
        id: string
        login: string
        display_name: string
        profile_image_url: string
        allowed: boolean
      }[]
    >`
      SELECT u.id, u.login, u.display_name, u.profile_image_url, u.allowed
      FROM public_tokens pt
      JOIN users u ON u.id = pt.user_id
      WHERE pt.token = ${token}
      LIMIT 1
    `
    return rows.length > 0 ? rows[0] : null
  }

  // ---------------------------------------------------------------------------
  // Users (lookup by id) — used to read the current (recomputed) `allowed`.
  // ---------------------------------------------------------------------------

  async getUserById(userId: string): Promise<TwitchUser | null> {
    const rows = await sql<
      { id: string; login: string; display_name: string; profile_image_url: string; allowed: boolean }[]
    >`
      SELECT id, login, display_name, profile_image_url, allowed FROM users WHERE id = ${userId}
    `
    return rows.length > 0 ? rows[0] : null
  }

  /** Refresh a live session's cached `allowed` from the DB (after Patreon changes). */
  async refreshSessionAllowed(token: string): Promise<void> {
    const session = this.sessions.get(token)
    if (!session) return
    const rows = await sql<{ allowed: boolean }[]>`
      SELECT allowed FROM users WHERE id = ${session.user.id}
    `
    if (rows.length > 0) session.user.allowed = rows[0].allowed
  }

  // ---------------------------------------------------------------------------
  // Patreon link + access recompute
  // ---------------------------------------------------------------------------

  /** allowed = admin_allowed OR an active membership on an allow-listed tier. */
  async recomputeAllowed(userId: string): Promise<boolean> {
    const rows = await sql<
      { admin_allowed: boolean; patreon_active: boolean; patreon_tier_id: string | null }[]
    >`
      SELECT admin_allowed, patreon_active, patreon_tier_id FROM users WHERE id = ${userId}
    `
    if (rows.length === 0) return false
    const u = rows[0]
    const allowed =
      u.admin_allowed || grantsAccess(u.patreon_active, u.patreon_tier_id, accessTierIds())
    await sql`UPDATE users SET allowed = ${allowed} WHERE id = ${userId}`
    return allowed
  }

  /** Link a Patreon account to a user; rejects if it's already linked elsewhere. */
  async linkPatreon(
    userId: string,
    m: Membership,
  ): Promise<{ ok: true; allowed: boolean } | { ok: false; reason: 'conflict' }> {
    const other = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE patreon_id = ${m.patreonId} AND id <> ${userId}
    `
    if (other.length > 0) return { ok: false, reason: 'conflict' }

    const tier = primaryTierInfo(m, accessTierIds())
    await sql`
      UPDATE users SET
        patreon_id        = ${m.patreonId},
        patreon_tier_id   = ${tier.id},
        patreon_tier_name = ${tier.name},
        patreon_active    = ${m.active},
        patreon_synced_at = NOW()
      WHERE id = ${userId}
    `
    const allowed = await this.recomputeAllowed(userId)
    return { ok: true, allowed }
  }

  async unlinkPatreon(userId: string): Promise<boolean> {
    await sql`
      UPDATE users SET
        patreon_id = NULL, patreon_tier_id = NULL, patreon_tier_name = NULL,
        patreon_active = FALSE, patreon_synced_at = NOW()
      WHERE id = ${userId}
    `
    return this.recomputeAllowed(userId)
  }

  async getPatreonStatus(userId: string): Promise<PatreonStatus> {
    const rows = await sql<
      {
        patreon_id: string | null
        patreon_active: boolean
        patreon_tier_id: string | null
        patreon_tier_name: string | null
      }[]
    >`
      SELECT patreon_id, patreon_active, patreon_tier_id, patreon_tier_name
      FROM users WHERE id = ${userId}
    `
    const u = rows[0]
    if (!u || !u.patreon_id) return { linked: false, active: false, tierId: null, tierName: null }
    return {
      linked: true,
      active: u.patreon_active,
      tierId: u.patreon_tier_id,
      tierName: u.patreon_tier_name,
    }
  }

  /** Reconcile every linked user against the campaign member list. Returns count synced. */
  async syncAllPatreon(members: Membership[]): Promise<number> {
    const access = accessTierIds()
    const byId = new Map(members.map((m) => [m.patreonId, m]))
    const linked = await sql<{ id: string; patreon_id: string }[]>`
      SELECT id, patreon_id FROM users WHERE patreon_id IS NOT NULL
    `
    for (const u of linked) {
      const m = byId.get(u.patreon_id)
      const tier = m ? primaryTierInfo(m, access) : { id: null, name: null }
      await sql`
        UPDATE users SET
          patreon_active    = ${m?.active ?? false},
          patreon_tier_id   = ${tier.id},
          patreon_tier_name = ${tier.name},
          patreon_synced_at = NOW()
        WHERE id = ${u.id}
      `
      await this.recomputeAllowed(u.id)
    }
    return linked.length
  }

  // ---------------------------------------------------------------------------
  // Creator token (single row) — used by the periodic member sync
  // ---------------------------------------------------------------------------

  async getCreatorTokens(): Promise<PatreonTokens | null> {
    const rows = await sql<{ access_token: string; refresh_token: string }[]>`
      SELECT access_token, refresh_token FROM patreon_creator WHERE id = 1
    `
    if (rows.length > 0) {
      return { accessToken: rows[0].access_token, refreshToken: rows[0].refresh_token }
    }
    // Seed from env the first time.
    const accessToken = process.env.PATREON_CREATOR_ACCESS_TOKEN
    const refreshToken = process.env.PATREON_CREATOR_REFRESH_TOKEN
    if (accessToken && refreshToken) {
      await this.saveCreatorTokens({ accessToken, refreshToken })
      return { accessToken, refreshToken }
    }
    return null
  }

  async saveCreatorTokens(t: PatreonTokens): Promise<void> {
    await sql`
      INSERT INTO patreon_creator (id, access_token, refresh_token, updated_at)
      VALUES (1, ${t.accessToken}, ${t.refreshToken}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        access_token  = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        updated_at    = NOW()
    `
  }

  // ---------------------------------------------------------------------------
  // Token validation (centralised) — CLI tokens only; public tokens are read-only
  // ---------------------------------------------------------------------------

  async validateBearer(bearer: string): Promise<TokenValidationResult> {
    // All tokens are 64-char lowercase hex
    if (/^[0-9a-f]{64}$/.test(bearer)) {
      const user = await this.getUserByCliToken(bearer)
      if (user) {
        if (!user.allowed) return { authorized: false, reason: 'account not yet approved' }
        return { authorized: true, user }
      }
    }

    return { authorized: false, reason: 'invalid token' }
  }
}

export const authStore = new AuthStore()
