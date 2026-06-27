# @magic-sentry/wc3data

Warcraft III reference game data — units, buildings, heroes, items, upgrades, and
abilities — plus the lookup maps derived from it. Consumed across the project via the
package root:

```typescript
import { UNITS, UPGRADES_TECH, ITEM_BY_ID, ABILITY_BY_ID } from '@magic-sentry/wc3data'
```

There are two ways the data gets updated:

- **[Refresh balance numbers from SLK](#refreshing-balance-numbers-from-slk)** — pull
  `supply`/`gold`/`lumber` straight from the game's tables (the `generate` pipeline).
- **[Edit the records by hand](#editing-the-data-by-hand)** — names, stats, effects,
  abilities, icons, and brand-new entries.

After either, rebuild the package (see [Building](#building)).

## How the data is organised

Each entity is described by **one record** in a consolidated source file. The flat lookup
maps the rest of the app consumes (`UNITS`, `UNIT_NAME_BY_ID`, `UNIT_STATS_BY_ID`,
`BUILDING_IDS`, `HERO_STATS_BY_ID`, `UNIT_ABILITY_BY_ID`, …) are **derived** from those
records in `src/enriched.ts`.

| Source file (edit here) | Export | Holds |
|---|---|---|
| `src/units.ts` | `UNIT_DATA` | units **and** buildings |
| `src/heroes.ts` | `HERO_DATA` | playable heroes (`HERO_OBSERVER_IDS` = its keys) |
| `src/items.ts` | `ITEM_DATA` | items |
| `src/upgrades.ts` | `UPGRADE_DATA` | upgrades / tech |
| `src/abilities.ts` | `ABILITY_BY_ID` | ability id → name **and** detail (mana/cooldown/damage/…) |
| `src/roster.ts` | `ROSTER_UNIT_IDS` | whitelist of standard units shown per race |

> **Edit the records, never the derived maps.** `src/enriched.ts` is computed; don't
> hand-edit `UNIT_NAME_BY_ID`, `BUILDING_IDS`, etc.

Ids are the in-game **fourcc** codes (e.g. `hsor`, `Hamg`, `Aslo`). Record fields are
defined by `UnitEntry` / `HeroEntry` / `ItemEntry` / `UpgradeEntry` in `src/balance.ts`,
and `AbilityInfo` in `src/abilities.ts`.

Icons live in `assets/<heroes|units|buildings|items|abilities|upgrades>/<id>.webp`
(64×64) and are served at `/<dir>/<id>.webp`. A missing icon renders a blank tile (no
crash). After adding icons, run `npm run build:icons` (repo root) to re-inline them into
the standalone HTML report bundle.

## Refreshing balance numbers from SLK

The `generate` pipeline refreshes **only** the balance fields (`supply`/`gold`/`lumber`)
for units, heroes, items, and upgrades from the game's SLK tables. It **merges** into the
existing records, preserving every hand-authored field (name overrides, stats, effects,
icons, abilities, building/alias flags). It does not touch abilities.

### 1. Place SLK files in `slk/`

Copy these from your Warcraft III installation into `wc3data/slk/` (gitignored):

- `unitbalance.slk` → units & heroes
- `upgradedata.slk` → upgrades
- `itemdata.slk` → items

(`unitdata.slk` may also be present but is not consumed by the current pipeline.)

### 2. Run the pipeline

```bash
cd wc3data
npm run generate
```

This runs in two stages:

1. **Parse** — `parse-unitbalance.ts`, `parse-upgradedata.ts`, and `parse-itemdata.ts`
   read the SLK tables and write JSON intermediates (`src/UnitBalance.json`,
   `src/UpgradeBalance.json`, `src/ItemBalance.json` — all gitignored).
2. **Generate** — `generate-units.ts`, `generate-upgrades.ts`, and `generate-items.ts`
   merge those numbers into `src/units.ts`, `src/heroes.ts`, `src/upgrades.ts`, and
   `src/items.ts`, then prettier tidies the output.

Each step logs how many records it `updated` vs `added`. **New ids** are appended with
their raw SLK name and balance only — open the file and refine them (real display name,
stats, effect, icon, abilities, `building`/`alias` flags) by hand.

### 3. Review and commit

```bash
git diff src/units.ts src/heroes.ts src/upgrades.ts src/items.ts
git add src/units.ts src/heroes.ts src/upgrades.ts src/items.ts
git commit -m "chore: refresh unit/hero/upgrade/item balance from SLK"
```

The `slk/*.slk` inputs and `src/*Balance.json` intermediates are gitignored — only the
generated `.ts` records are committed.

## Editing the data by hand

### Add an ability

Use the in-game fourcc id (e.g. `Axyz`). One place now holds both the name and the
tooltip detail:

1. `src/abilities.ts` → `ABILITY_BY_ID`: add `Axyz: { name: 'Frost Nova', description: '…',
   manaCost: 75, cooldown: 6, range: 600, damage: [50, 100, 150] }`. `name` makes it
   appear in the encyclopedia **Abilities** tab; the detail fields populate the tooltip.
   See `AbilityInfo` for every field.
2. Link it to the caster's record in `src/units.ts` (or `src/heroes.ts`) by adding the id
   to its `abilities` array: `abilities: ['Aslo', 'Aivs', 'Axyz']`.
3. Add `assets/abilities/Axyz.webp`.

### Add a unit or building

Add a record to `UNIT_DATA` in `src/units.ts`:

```ts
hxyz: {
  name: 'New Unit', supply: 2, gold: 150, lumber: 0,
  stats: { hp: 420, armor: 1, armorType: 'Medium', damageMin: 12, damageMax: 14, damageType: 'Normal' },
  effect: 'Flavour text…',
  abilities: ['Axyz'],   // optional
  building: true,        // set for buildings (shown in the Buildings sections)
  // icon: 'hxyz',        // only when the icon file differs from the id
  // alias: true,         // hide a redundant duplicate id from the catalog
},
```

Add `assets/units/hxyz.webp` (or `assets/buildings/hxyz.webp` for buildings). The race is
inferred from the id's first letter (`h/o/e/u`, else neutral). To show a trainable unit in
the per-race **Units** sections, add its id to `ROSTER_UNIT_IDS` in `src/roster.ts`.

### Add a hero

Add a record to `HERO_DATA` in `src/heroes.ts` (its keys *are* `HERO_OBSERVER_IDS`, so it
shows in the Heroes section automatically). Use `stats` of shape `HeroEntry` and add
`assets/heroes/<id>.webp`.

### Add an item / upgrade

Add a record to `ITEM_DATA` (`src/items.ts`) or `UPGRADE_DATA` (`src/upgrades.ts`) and the
matching icon under `assets/items/` or `assets/upgrades/`.

## Building

The derived maps in `src/enriched.ts` recompute from the records at build time, so after
any change rebuild the package from the repo root:

```bash
npm run build:wc3data    # tsc -p wc3data/tsconfig.json
```

Run the parser/merge tests with `npm test` inside `wc3data/`.
