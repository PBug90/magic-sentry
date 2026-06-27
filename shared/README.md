# @magic-sentry/shared

Shared TypeScript domain types and pure logic used across the project — the game-record
schema, the incremental patch protocol, chart helpers, and fight/timeline detection.

> **Looking for WC3 reference data** (units, heroes, items, upgrades, abilities, icons and
> the SLK refresh pipeline)? That moved to [`@magic-sentry/wc3data`](../wc3data/README.md).
> This package depends on it for unit colours and supply lookups.

## Usage

Import from the package root:

```typescript
import {
  GameRecordSchema,
  type GameRecord,
  type Sample,
  buildGameRecord,
  detectFights,
  detectTimeline,
  PLAYER_COLORS,
} from '@magic-sentry/shared'
```

## What's in here

| Source file | Holds |
|---|---|
| `src/types.ts` | The canonical game model — Zod schemas (`GameRecordSchema`, `SampleSchema`, `GamePatchSchema`, …) and the types inferred from them (`GameRecord`, `Sample`, `PlayerRecord`, `GamePatch`, `ChartPlayer`), plus the `MAX_*` validation bounds and `TOKEN_RE` / `CHANNEL_RE`. |
| `src/patches.ts` | `buildGameRecord(accumulated)` — reconstructs a full `GameRecord` from the map of `GamePatch` chunks the web server accumulates by sequence. |
| `src/chartUtils.ts` | Presentation helpers shared by every chart: `PLAYER_COLORS` / `UNIT_COLORS` / `HERO_COLOR`, `unitColor`, `heroSupply`, `formatDuration` / `fmtTime`, `niceMax` / `timeTicks`, `nearestSample(Idx)`, and the `buildLayers` / `buildAreas` / `buildByTime` stacked-area builders. |
| `src/fightDetection.ts` | `detectFights(players)` → `Fight[]` — derives engagements from the sample stream. |
| `src/timelineDetection.ts` | `detectTimeline(players)` → `TimelineEvent[]` — derives build/tech/expansion timing events. |

The Zod schemas are the **single source of truth** for the wire format: the CLI emits it,
the web server validates ingest against it, and the viewer/extension consume the inferred
types. Keep `cli/src/report.rs` in sync when the schema changes.

`ChartPlayer`, `unitColor`, and `heroSupply` reach into `@magic-sentry/wc3data` for the
unit/hero metadata, so changes there can affect chart output here.

## Building & testing

The package is compiled with `tsc`; consumers import the build output in `dist/`. From the
repo root:

```bash
npm run build:shared   # builds @magic-sentry/wc3data first, then this package
```

Run the unit tests (Vitest) from inside `shared/`:

```bash
npm test
```
