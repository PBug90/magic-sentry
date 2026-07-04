import { useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { UNITS } from '@magic-sentry/wc3data'
import {
  ITEM_BY_ID,
  ITEM_INFO_BY_ID,
  UNIT_EFFECT_BY_ID,
  ABILITY_BY_ID,
  UNIT_ABILITY_BY_ID,
  UNIT_STATS_BY_ID,
  HERO_STATS_BY_ID,
  UPGRADES_TECH,
  HERO_OBSERVER_IDS,
  UNIT_ICON_BY_ID,
  UNIT_ALIAS_IDS,
  BUILDING_IDS,
  ROSTER_UNIT_IDS,
  UPGRADE_INFO_BY_ID,
} from '@magic-sentry/wc3data'
import { useIconSrc } from './context'
import { HoverTooltip } from './HoverTooltip'
import { AbilityTooltipBody } from './AbilityTooltipBody'
import { ItemTooltipBody } from './ItemTooltipBody'
import { UpgradeTooltipBody } from './UpgradeTooltipBody'
import { UnitTooltipBody } from './UnitTooltipBody'
import { HeroTooltipBody } from './HeroTooltipBody'
import { ITEM_ICON_IDS } from './itemIcons'
import { DamageTable } from './DamageTable'
import { ArmorTable } from './ArmorTable'
import { GoldIcon, LumberIcon } from './StatIcons'

type RaceTab = 'Human' | 'Orc' | 'Night Elf' | 'Undead'
type OtherTab = 'items' | 'upgrades' | 'abilities' | 'damage'
// 'Neutral' is a buildings-only tab (no neutral heroes/units/upgrades shown).
type Tab = RaceTab | 'Neutral' | OtherTab

const RACE_TABS: RaceTab[] = ['Human', 'Orc', 'Night Elf', 'Undead']
const OTHER_TABS: { key: OtherTab; label: string }[] = [
  { key: 'items', label: 'Items' },
  { key: 'upgrades', label: 'Upgrades' },
  { key: 'abilities', label: 'Abilities' },
  { key: 'damage', label: 'Combat' },
]
const RACE_SET = new Set<string>(RACE_TABS)

function raceFromId(id: string): string {
  const c = id[0]
  if (c === 'H' || c === 'h') return 'Human'
  if (c === 'O' || c === 'o') return 'Orc'
  if (c === 'E' || c === 'e') return 'Night Elf'
  if (c === 'U' || c === 'u') return 'Undead'
  return 'Neutral'
}

// Upgrade ids are 'R' + a race letter (e.g. 'Rhme' → Human). Letters other than
// h/o/e/u (w, g, n) are neutral/special and belong to no race tab.
function upgradeRaceFromId(id: string): string {
  if (id[0] !== 'R') return 'Neutral'
  switch (id[1]) {
    case 'h':
      return 'Human'
    case 'o':
      return 'Orc'
    case 'e':
      return 'Night Elf'
    case 'u':
      return 'Undead'
    default:
      return 'Neutral'
  }
}

const byUnitName = (a: string, b: string) =>
  (UNITS[a]?.name ?? a).localeCompare(UNITS[b]?.name ?? b)

const byUpgradeName = (a: string, b: string) =>
  (UPGRADES_TECH[a]?.name ?? a).localeCompare(UPGRADES_TECH[b]?.name ?? b)

// Upgrades kept in the data (for game-view name resolution) but hidden from the
// encyclopedia: Roch = orc chaos conversion, Rusl = undead skeleton life span.
const HIDDEN_UPGRADE_IDS = new Set(['Roch', 'Rusl'])

function unitAbilities(id: string) {
  return (UNIT_ABILITY_BY_ID[id] ?? []).flatMap((aid) => {
    const info = ABILITY_BY_ID[aid]
    return info ? [{ id: aid, info }] : []
  })
}

const nameLine = (name: string) => <div style={{ color: '#efeff1' }}>{name}</div>

function CostRow({ gold, lumber }: { gold: number; lumber: number }) {
  if (gold <= 0 && lumber <= 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'monospace' }}>
      {gold > 0 && (
        <span style={{ color: '#c8a050', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {gold}
          <GoldIcon />
        </span>
      )}
      {lumber > 0 && (
        <span style={{ color: '#3fb950', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          {lumber}
          <LumberIcon />
        </span>
      )}
    </div>
  )
}

function IconTile({
  iconSrc,
  iconPath,
  id,
  alt,
  tooltip,
}: {
  iconSrc: (p: string) => string
  iconPath: string
  id: string
  alt: string
  tooltip: ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  const size = 32
  return (
    <div
      className="ms-icon-frame"
      style={{
        position: 'relative',
        width: size,
        height: size,
        border: '1px solid #2a2a3a',
        overflow: 'hidden',
        flexShrink: 0,
        background: '#0d0d14',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && <HoverTooltip>{tooltip}</HoverTooltip>}
      <img
        src={iconSrc(`${iconPath}/${UNIT_ICON_BY_ID[id] ?? id}.webp`)}
        alt={alt}
        width={size}
        height={size}
        style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
        }}
      />
    </div>
  )
}

const sectionLabel: CSSProperties = {
  color: '#6a6a6a',
  textTransform: 'uppercase',
  fontFamily: 'monospace',
  fontSize: '.55em',
  fontWeight: 700,
  letterSpacing: '.16em',
  margin: '12px 0 5px',
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div style={sectionLabel}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{children}</div>
    </div>
  )
}

export function EncyclopediaPanel({
  iconSrc: iconSrcProp,
}: { iconSrc?: (p: string) => string } = {}) {
  const contextIconSrc = useIconSrc()
  const iconSrc = iconSrcProp ?? contextIconSrc
  const [tab, setTab] = useState<Tab>('Human')

  const tabStyle = (active: boolean): CSSProperties => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 10px',
    fontSize: '.6em',
    fontFamily: 'monospace',
    fontWeight: active ? 700 : 400,
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color: active ? '#c8a050' : '#888',
    borderBottom: active ? '2px solid #c8a050' : '2px solid transparent',
  })

  const heroesOf = (race: string) =>
    Object.keys(UNITS)
      .filter(
        (id) => HERO_OBSERVER_IDS.has(id) && !UNIT_ALIAS_IDS.has(id) && raceFromId(id) === race,
      )
      .sort(byUnitName)
  // Units come from the curated ROSTER_UNIT_IDS whitelist, not a heuristic —
  // this keeps campaign characters, cinematic doubles and morph forms out.
  const unitsOf = (race: string) =>
    [...ROSTER_UNIT_IDS].filter((id) => raceFromId(id) === race).sort(byUnitName)
  // Buildings come from the curated BUILDING_IDS allowlist (Liquipedia Buildings
  // page), not a heuristic — every id has a /buildings icon and a UNITS entry.
  const buildingsOf = (race: string) =>
    [...BUILDING_IDS].filter((id) => raceFromId(id) === race).sort(byUnitName)
  const upgradesOf = (race: string) =>
    Object.keys(UPGRADES_TECH)
      .filter((id) => upgradeRaceFromId(id) === race && !HIDDEN_UPGRADE_IDS.has(id))
      .sort(byUpgradeName)

  const heroTip = (id: string) => (
    <>
      {nameLine(UNITS[id]?.name ?? id)}
      <HeroTooltipBody stats={HERO_STATS_BY_ID[id]} abilities={unitAbilities(id)} />
    </>
  )
  const unitTip = (id: string) => {
    const d = UNITS[id]
    return (
      <>
        {nameLine(d?.name ?? id)}
        <CostRow gold={d?.gold ?? 0} lumber={d?.lumber ?? 0} />
        <UnitTooltipBody
          stats={UNIT_STATS_BY_ID[id]}
          effect={UNIT_EFFECT_BY_ID[id]}
          abilities={unitAbilities(id)}
        />
      </>
    )
  }
  const itemTip = (id: string) => {
    const d = ITEM_BY_ID[id]
    const info = ITEM_INFO_BY_ID[id]
    return (
      <>
        {nameLine(d?.name ?? id)}
        <CostRow gold={d?.gold ?? 0} lumber={0} />
        {info && <ItemTooltipBody info={info} />}
      </>
    )
  }
  const upgradeTip = (id: string) => {
    const d = UPGRADES_TECH[id]
    const info = UPGRADE_INFO_BY_ID[id]
    return (
      <>
        {nameLine(d?.name ?? id)}
        <CostRow gold={d?.gold ?? 0} lumber={d?.lumber ?? 0} />
        {info && <UpgradeTooltipBody info={info} />}
      </>
    )
  }
  const abilityTip = (id: string) => {
    const info = ABILITY_BY_ID[id]
    return (
      <>
        {nameLine(ABILITY_BY_ID[id]?.name ?? id)}
        {info && <AbilityTooltipBody info={info} />}
      </>
    )
  }

  const tile = (iconPath: string, id: string, alt: string, tooltip: ReactNode) => (
    <IconTile key={id} iconSrc={iconSrc} iconPath={iconPath} id={id} alt={alt} tooltip={tooltip} />
  )

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          borderBottom: '1px solid #2a2a3a',
          flexShrink: 0,
        }}
      >
        {RACE_TABS.map((r) => (
          <button key={r} style={tabStyle(tab === r)} onClick={() => setTab(r)}>
            {r}
          </button>
        ))}
        <button style={tabStyle(tab === 'Neutral')} onClick={() => setTab('Neutral')}>
          Neutral
        </button>
        {OTHER_TABS.map(({ key, label }) => (
          <button key={key} style={tabStyle(tab === key)} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ overflowY: 'auto', flex: 1, minHeight: 0, padding: '4px 12px 14px' }}>
        {RACE_SET.has(tab) ? (
          <>
            {heroesOf(tab).length > 0 && (
              <Section label="Heroes">
                {heroesOf(tab).map((id) => tile('/heroes', id, UNITS[id]?.name ?? id, heroTip(id)))}
              </Section>
            )}
            {unitsOf(tab).length > 0 && (
              <Section label="Units">
                {unitsOf(tab).map((id) => tile('/units', id, UNITS[id]?.name ?? id, unitTip(id)))}
              </Section>
            )}
            {buildingsOf(tab).length > 0 && (
              <Section label="Buildings">
                {buildingsOf(tab).map((id) =>
                  tile('/buildings', id, UNITS[id]?.name ?? id, unitTip(id)),
                )}
              </Section>
            )}
            {upgradesOf(tab).length > 0 && (
              <Section label="Upgrades">
                {upgradesOf(tab).map((id) =>
                  tile('/upgrades', id, UPGRADES_TECH[id]?.name ?? id, upgradeTip(id)),
                )}
              </Section>
            )}
          </>
        ) : tab === 'Neutral' ? (
          <Section label="Buildings">
            {buildingsOf('Neutral').map((id) =>
              tile('/buildings', id, UNITS[id]?.name ?? id, unitTip(id)),
            )}
          </Section>
        ) : tab === 'items' ? (
          <Section label="Items">
            {Object.keys(ITEM_BY_ID)
              .filter((id) => ITEM_ICON_IDS.has(id))
              .sort((a, b) => ITEM_BY_ID[a].name.localeCompare(ITEM_BY_ID[b].name))
              .map((id) => tile('/items', id, ITEM_BY_ID[id].name, itemTip(id)))}
          </Section>
        ) : tab === 'upgrades' ? (
          <Section label="Upgrades">
            {Object.keys(UPGRADES_TECH)
              .filter((id) => !HIDDEN_UPGRADE_IDS.has(id))
              .sort((a, b) => UPGRADES_TECH[a].name.localeCompare(UPGRADES_TECH[b].name))
              .map((id) => tile('/upgrades', id, UPGRADES_TECH[id].name, upgradeTip(id)))}
          </Section>
        ) : tab === 'abilities' ? (
          <Section label="Abilities">
            {Object.keys(ABILITY_BY_ID)
              .sort((a, b) => ABILITY_BY_ID[a].name.localeCompare(ABILITY_BY_ID[b].name))
              .map((id) => tile('/abilities', id, ABILITY_BY_ID[id].name, abilityTip(id)))}
          </Section>
        ) : (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <DamageTable />
            <ArmorTable />
          </div>
        )}
      </div>
    </div>
  )
}
