# Magic Sentry — Twitch Extension

A Twitch Video Overlay extension that displays real-time Warcraft III game statistics sourced from [Magic Sentry](https://github.com/PBug90/magic-sentry), exactly mirroring what the Magic Sentry tab in w3gjs-webapp shows.

## What viewers see

An icon **rail** at the edge of the video. With no tab selected the stream is fully clear;
clicking a rail icon opens that panel. The panels are the same ones the web viewer renders —
they come from the shared [`@magic-sentry/viewer`](../viewer/) package (`VIEWER_TABS`):

| Tab | Shows |
| --- | --- |
| **Heroes and Upgrades** | Hero portraits, level, XP, damage/kills/deaths, and researched upgrades |
| **Items** | Items held/used per player |
| **Gold** | Gold mined (solid), upkeep lost (dashed), net (dotted) per player |
| **Lumber** | Lumber mined per player |
| **Food** | Food used vs. food cap per player |
| **Current Armies** | Snapshot of each player's live army composition |
| **Army over time** | Mirrored butterfly chart — player 1 stacks up, player 2 down, by army supply |
| **APM** | Actions per minute per player |
| **Fights** | Detected engagements (gated behind `VITE_ENABLE_FIGHTS`) |
| **Timings** | Build/tech/expansion timeline events |

All charts have an interactive hover crosshair with a tooltip. A **Settings** panel lets the
broadcaster tune background opacity and layout (docked / corner / fullscreen), persisted in
`localStorage`. A game-history dropdown switches between past games, and a `NoGameScreen`
shows when the channel has no live game.

## Setup

### 1. Deploy the Magic Sentry web server

The extension fetches game data from the `web` server in this repo. Deploy it somewhere publicly accessible (VPS, cloud run, etc.) and point a domain at it. The web server handles CORS for `https://ext-twitch.tv` automatically.

### 2. Configure the CLI

Place a `magic-sentry.toml` next to `magic-sentry.exe` with your server's ingest endpoint and your CLI token (generated in the web UI under **Settings**):

```toml
endpoint = "https://your-server.example.com/api/ingest"
secret   = "your-cli-token"
```

Run `magic-sentry.exe` alongside your Warcraft III game. It will push live game patches to the server as you play.

### 3. Configure the extension

In your Twitch channel's Extension Manager, open the extension's **Configuration** panel and enter:

- **Endpoint URL** — your web server's live data URL: `https://your-server.example.com/api/your-twitch-username/live/full`
- **Token** — your Twitch Extension Token from the web UI **Settings** page (used for traffic attribution)
- **Poll interval** — how often the overlay refreshes, default 5 seconds

## Building

```bash
npm install
npm run build
```

Output goes to `dist/`. Upload the contents of `dist/` to the Twitch Developer Console when creating your extension version.

## Extension structure

Panels, charts, and the WC3 reference data now live in shared workspace packages
(`@magic-sentry/viewer`, `@magic-sentry/shared`, `@magic-sentry/wc3data`); this package is
just the Twitch-specific shell, polling, and config around them.

```
twitch-extension/
├── video_overlay.html   # Video overlay entry point
├── config.html          # Broadcaster config panel entry point
├── dev.html             # Local dev harness entry point
├── src/
│   ├── shared/
│   │   ├── types.ts     # Re-exports the GameRecord/Sample types from @magic-sentry/shared
│   │   └── twitch.d.ts  # window.Twitch.ext type declarations
│   ├── viewer/
│   │   ├── main.tsx
│   │   ├── Overlay.tsx        # Rail + panel shell, settings, polling logic
│   │   ├── OverlayRail.tsx    # Edge icon rail / tab selector
│   │   ├── OverlaySettings.tsx # Opacity + layout controls
│   │   ├── NoGameScreen.tsx   # Shown when the channel has no live game
│   │   ├── icons.tsx          # Rail tab icons
│   │   └── hooks/             # useTwitchConfig, useMagicSentryGame, useExtensionHistory
│   ├── config/
│   │   ├── main.tsx
│   │   └── Config.tsx   # URL input + test + save
│   └── dev/
│       └── DevMain.tsx  # Renders the overlay outside Twitch for local iteration
└── public/              # Icons served to the overlay
```

## Twitch Developer Console settings

| Setting               | Value                        |
| --------------------- | ---------------------------- |
| Extension type        | Video Overlay                |
| Viewer HTML file      | `video_overlay.html`         |
| Config HTML file      | `config.html`                |
| Configuration method  | Twitch Configuration Service |
| Channel segment       | Broadcaster-writable         |
| External URLs (fetch) | Your Magic Sentry domain     |

## Data contract

The endpoint must return a JSON object matching the game-record schema. The canonical
definition is the Zod schema in [`@magic-sentry/shared`](../shared/) (`GameRecordSchema`);
the shape is summarised below:

```typescript
interface GameRecord {
  map: string
  game: string
  duration_ms: number
  players: PlayerRecord[]
}

interface PlayerRecord {
  name: string
  race: string
  team: number
  result: string // "Victory" | "Defeat"
  samples: Sample[] // time-series snapshots
  summary: PlayerSummary // end-of-game hero/unit stats
  time_in_upkeep_ms: number[]
}

interface Sample {
  time_ms: number
  gold: number
  gold_mined: number
  gold_upkeep_lost: number
  lumber: number
  lumber_mined: number
  lumber_upkeep_lost: number
  food_used: number
  food_cap: number
  apm: number
  heroes: HeroSample[]
  units: UnitSnapshot[]
}
```

This is identical to the format Magic Sentry already produces.
