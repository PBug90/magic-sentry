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
