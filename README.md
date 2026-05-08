<p align="center">
  <img src="assets/magicsentry.webp" alt="Magic Sentry" width="160" />
</p>

# Magic Sentry

**Deployed at [magicsentry.pro](https://magicsentry.pro/)**

Live WarCraft III game intelligence — a monorepo containing three applications that work together to capture, stream, and visualise real-time game data.

## Applications

| Package | Stack | Description |
|---|---|---|
| [`cli`](cli/) | Rust · Windows | Reads live game data from WC3 shared memory, writes JSON snapshots to disk, and streams incremental patches to the web server |
| [`web`](web/) | TypeScript · Hono · React | Receives patches from the CLI, reconstructs full game records, and exposes a JSON API for viewers |
| [`twitch-extension`](twitch-extension/) | TypeScript · React · Vite | Twitch video overlay that polls the live API and renders interactive charts for heroes, resources, food, and army composition |

## Quick start

### CLI

See [`cli/README.md`](cli/README.md) for full usage.

```
magic-sentry.exe
```

Place a `magic-sentry.toml` next to the executable to enable HTTP streaming:

```toml
endpoint = "https://your-server.example.com/api/ingest"
secret   = "your-cli-token"   # token generated in the web UI → Settings
```

### Web server

```bash
cd web
npm start
```

## Local development

### Prerequisites

- Node.js 22+
- Docker (for Postgres)
- Rust with the `x86_64-pc-windows-msvc` target (CLI only, Windows)

### Web server

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres
docker compose up -d

# 3. Configure environment
cp web/.env.example web/.env
# Edit web/.env — fill in TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET
# Create a Twitch app at https://dev.twitch.tv/console and add
# http://localhost:3000/auth/twitch/callback as an OAuth redirect URL.

# 4. Start the dev server
npm run dev:web
```

The web UI is available at `http://localhost:3000`.

## Building

```bash
# Rust CLI (Windows target)
cargo build --release --target x86_64-pc-windows-msvc -p magic-sentry

# All JS/TS packages
npm install
npm run build:all
```

## Testing

```bash
# CLI integration tests (Windows)
cargo test -p magic-sentry

# TypeScript type-checking
npm run typecheck:extension
npm run typecheck:web
```
