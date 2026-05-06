import { randomBytes } from 'crypto'
import { sql } from './db.js'

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
