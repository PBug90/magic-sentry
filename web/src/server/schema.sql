-- Magic Sentry — core schema
-- Run once against your Postgres database, or let the server auto-migrate on startup.

CREATE TABLE IF NOT EXISTS users (
  id                TEXT        PRIMARY KEY,       -- Twitch user ID
  login             TEXT        NOT NULL,           -- Twitch login name (lowercase)
  display_name      TEXT        NOT NULL,
  profile_image_url TEXT        NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cli_tokens (
  token      TEXT        PRIMARY KEY,
  user_id    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cli_tokens_user_id_idx ON cli_tokens(user_id);
