# @magic-sentry/shared

Shared TypeScript types and WC3 reference data for the magic-sentry project.

## Usage

Import from the package root:

```typescript
import { UNITS, UPGRADES_TECH, ITEM_BY_ID, ABILITY_BY_ID } from '@magic-sentry/shared'
```

## Regenerating game data

The generated files (`src/units.ts`, `src/upgrades.ts`, `src/items.ts`) are committed and
ready to use. To update them when the game data changes:

### 1. Place SLK files in `slk/`

Copy these files from your Warcraft III installation into `shared/slk/`:

- `unitbalance.slk`
- `upgradedata.slk`
- `itemdata.slk`

These files are gitignored — they live only on your local machine.

### 2. Run the pipeline

```bash
npm run generate
```

This parses the SLK files into JSON intermediates, then generates `src/units.ts`,
`src/upgrades.ts`, and `src/items.ts`. The JSON files are gitignored.

### 3. Commit the generated files

```bash
git add src/units.ts src/upgrades.ts src/items.ts
git commit -m "chore: regenerate unit/upgrade/item data from SLK"
```
