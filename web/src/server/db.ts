import postgres from 'postgres'

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

export const sql = postgres(process.env.DATABASE_URL ?? 'postgres://localhost/magic_sentry', {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
})

// ---------------------------------------------------------------------------
// Migration — idempotent, runs on server startup
// ---------------------------------------------------------------------------

export async function migrate(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id                TEXT        PRIMARY KEY,
      login             TEXT        NOT NULL,
      display_name      TEXT        NOT NULL,
      profile_image_url TEXT        NOT NULL,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS cli_tokens (
      token      TEXT        PRIMARY KEY,
      user_id    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label      TEXT        NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS cli_tokens_user_id_idx ON cli_tokens(user_id)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS public_tokens (
      token   TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS traffic_stats (
      token        TEXT        PRIMARY KEY,
      ingest_count BIGINT      NOT NULL DEFAULT 0,
      ingest_bytes BIGINT      NOT NULL DEFAULT 0,
      fetch_count  BIGINT      NOT NULL DEFAULT 0,
      fetch_bytes  BIGINT      NOT NULL DEFAULT 0,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    ALTER TABLE traffic_stats
      ADD COLUMN IF NOT EXISTS ingest_count BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS ingest_bytes BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS fetch_count  BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS fetch_bytes  BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `
}
