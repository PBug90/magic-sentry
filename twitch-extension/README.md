# Magic Sentry — Twitch Extension

A Twitch Video Overlay extension that displays real-time Warcraft III game statistics sourced from [Magic Sentry](https://github.com/PBug90/magic-sentry), exactly mirroring what the Magic Sentry tab in w3gjs-webapp shows.

## What viewers see

A collapsible side panel (360 px wide) on the left edge of the video with five tabs:

| Tab        | Chart                                                                               |
| ---------- | ----------------------------------------------------------------------------------- |
| **Heroes** | Hero portraits, level, XP, damage/kills/deaths                                      |
| **Gold**   | Gold mined (solid), upkeep lost (dashed), net (dotted) per player                   |
| **Lumber** | Lumber mined per player                                                             |
| **Food**   | Food used vs. food cap per player                                                   |
| **Army**   | Mirrored butterfly chart — player 1 stacks up, player 2 stacks down, by army supply |

All charts have an interactive hover crosshair with a tooltip. The panel can be collapsed to a small chevron button at the video edge.

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

```
twitch-extension/
├── viewer.html          # Video overlay entry point
├── config.html          # Broadcaster config panel entry point
├── src/
│   ├── shared/
│   │   ├── types.ts     # GameRecord / Sample types (Magic Sentry schema)
│   │   ├── wc3data.ts   # Unit & hero data (supply costs, icon IDs)
│   │   ├── chartUtils.ts # SVG chart helpers (layers, areas, ticks)
│   │   └── twitch.d.ts  # window.Twitch.ext type declarations
│   ├── viewer/
│   │   ├── main.tsx
│   │   ├── Overlay.tsx  # Collapsible side panel, polling logic
│   │   ├── HeroPanel.tsx
│   │   └── charts/
│   │       ├── shared.tsx        # Hover hook, tooltip, UnitIcon
│   │       ├── ResourceChart.tsx # Gold + Lumber charts
│   │       ├── FoodChart.tsx
│   │       └── ArmyChart.tsx    # Butterfly army chart
│   └── config/
│       ├── main.tsx
│       └── Config.tsx   # URL input + test + save
└── public/
    ├── heroes/          # 24 hero portrait PNGs
    └── units/           # 68 unit portrait PNGs
```

## Twitch Developer Console settings

| Setting               | Value                        |
| --------------------- | ---------------------------- |
| Extension type        | Video Overlay                |
| Viewer HTML file      | `viewer.html`                |
| Config HTML file      | `config.html`                |
| Configuration method  | Twitch Configuration Service |
| Channel segment       | Broadcaster-writable         |
| External URLs (fetch) | Your Magic Sentry domain     |

## Data contract

The endpoint must return a JSON object matching this schema:

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
