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
      allowed           BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed BOOLEAN NOT NULL DEFAULT FALSE
  `

  // Split the manual approval flag out from the effective `allowed` so the
  // Patreon sync can grant/revoke access without clobbering manual grants.
  // Seeded from the current `allowed` exactly once, on first add.
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'admin_allowed'
      ) THEN
        ALTER TABLE users ADD COLUMN admin_allowed BOOLEAN NOT NULL DEFAULT FALSE;
        UPDATE users SET admin_allowed = allowed;
      END IF;
    END $$
  `

  // Patreon link (campaign-members model: we store the patron's id + standing,
  // never their tokens).
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS patreon_id      TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS patreon_tier_id   TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS patreon_tier_name TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS patreon_active  BOOLEAN NOT NULL DEFAULT FALSE`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS patreon_synced_at TIMESTAMPTZ`
  // One Patreon account per user, and it can't be claimed by two accounts.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_patreon_id_key
    ON users (patreon_id) WHERE patreon_id IS NOT NULL
  `

  // Single creator token used by the periodic sync to read campaign members.
  // Seeded from env on first run; refreshed in place thereafter.
  await sql`
    CREATE TABLE IF NOT EXISTS patreon_creator (
      id            INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      access_token  TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

  // Migrate: drop legacy single-row-per-token table if it has the old PK schema
  await sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'traffic_stats'
          AND constraint_type = 'PRIMARY KEY'
          AND constraint_name = 'traffic_stats_pkey'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'traffic_stats' AND column_name = 'day'
      ) THEN
        DROP TABLE traffic_stats;
      END IF;
    END $$
  `

  await sql`
    CREATE TABLE IF NOT EXISTS traffic_stats (
      token             TEXT   NOT NULL,
      day               DATE   NOT NULL,
      ingest_count      BIGINT NOT NULL DEFAULT 0,
      ingest_bytes_raw  BIGINT NOT NULL DEFAULT 0,
      ingest_bytes_wire BIGINT NOT NULL DEFAULT 0,
      fetch_count       BIGINT NOT NULL DEFAULT 0,
      fetch_bytes_raw   BIGINT NOT NULL DEFAULT 0,
      fetch_bytes_wire  BIGINT NOT NULL DEFAULT 0,
      PRIMARY KEY (token, day)
    )
  `

  await sql`
    CREATE INDEX IF NOT EXISTS traffic_stats_token_idx ON traffic_stats (token)
  `

  // Rename legacy single-column byte fields to the wire variants if they exist.
  await sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'traffic_stats' AND column_name = 'ingest_bytes'
      ) THEN
        ALTER TABLE traffic_stats RENAME COLUMN ingest_bytes TO ingest_bytes_wire;
      END IF;
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'traffic_stats' AND column_name = 'fetch_bytes'
      ) THEN
        ALTER TABLE traffic_stats RENAME COLUMN fetch_bytes TO fetch_bytes_wire;
      END IF;
    END $$
  `

  await sql`ALTER TABLE traffic_stats ADD COLUMN IF NOT EXISTS ingest_bytes_raw  BIGINT NOT NULL DEFAULT 0`
  await sql`ALTER TABLE traffic_stats ADD COLUMN IF NOT EXISTS ingest_bytes_wire BIGINT NOT NULL DEFAULT 0`
  await sql`ALTER TABLE traffic_stats ADD COLUMN IF NOT EXISTS fetch_bytes_raw   BIGINT NOT NULL DEFAULT 0`
  await sql`ALTER TABLE traffic_stats ADD COLUMN IF NOT EXISTS fetch_bytes_wire  BIGINT NOT NULL DEFAULT 0`
}
