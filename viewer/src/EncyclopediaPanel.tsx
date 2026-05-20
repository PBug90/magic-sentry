import { useState, useMemo } from 'react'
import {
  UNITS,
  ITEM_BY_ID,
  UPGRADES_TECH,
  HERO_OBSERVER_IDS,
  UNIT_ICON_BY_ID,
} from '@magic-sentry/shared'
import { useIconSrc } from './context'

type Category = 'units' | 'buildings' | 'heroes' | 'items' | 'upgrades'
type Race = 'All' | 'Human' | 'Orc' | 'Night Elf' | 'Undead'

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'units', label: 'Units' },
  { key: 'buildings', label: 'Buildings' },
  { key: 'heroes', label: 'Heroes' },
  { key: 'items', label: 'Items' },
  { key: 'upgrades', label: 'Upgrades' },
]

const RACES: Race[] = ['All', 'Human', 'Orc', 'Night Elf', 'Undead']

const HAS_RACE_FILTER = new Set<Category>(['units', 'buildings', 'heroes'])

function raceFromId(id: string): string {
  const c = id[0]
  if (c === 'H' || c === 'h') return 'Human'
  if (c === 'O' || c === 'o') return 'Orc'
  if (c === 'E' || c === 'e') return 'Night Elf'
  if (c === 'U' || c === 'u') return 'Undead'
  return 'Neutral'
}

interface Entry {
  id: string
  name: string
  gold: number
  lumber: number
  supply?: number
  race: string
}

function buildEntries(category: Category): Entry[] {
  switch (category) {
    case 'units':
      return Object.entries(UNITS)
        .filter(([id, d]) => d.supply > 0 && d.gold > 0 && !HERO_OBSERVER_IDS.has(id))
        .map(([id, d]) => ({
          id,
          name: d.name,
          gold: d.gold,
          lumber: d.lumber,
          supply: d.supply,
          race: raceFromId(id),
        }))
    case 'buildings':
      return Object.entries(UNITS)
        .filter(([id, d]) => d.supply === 0 && d.gold > 0 && !HERO_OBSERVER_IDS.has(id))
        .map(([id, d]) => ({
          id,
          name: d.name,
          gold: d.gold,
          lumber: d.lumber,
          race: raceFromId(id),
        }))
    case 'heroes':
      return Object.entries(UNITS)
        .filter(([id]) => HERO_OBSERVER_IDS.has(id))
        .map(([id, d]) => ({
          id,
          name: d.name,
          gold: d.gold,
          lumber: d.lumber,
          race: raceFromId(id),
        }))
    case 'items':
      return Object.entries(ITEM_BY_ID).map(([id, d]) => ({
        id,
        name: d.name,
        gold: d.gold,
        lumber: 0,
        race: 'Neutral',
      }))
    case 'upgrades':
      return Object.entries(UPGRADES_TECH).map(([id, d]) => ({
        id,
        name: d.name,
        gold: d.gold,
        lumber: d.lumber,
        race: raceFromId(id),
      }))
  }
}

function Stat({ value, color, suffix }: { value: number; color: string; suffix: string }) {
  if (value === 0) return <span style={{ color: '#333', minWidth: 44, fontSize: '.6em' }}>—</span>
  return (
    <span style={{ color, fontFamily: 'monospace', fontSize: '.6em', minWidth: 44 }}>
      {value}
      {suffix}
    </span>
  )
}

function EntryRow({
  entry,
  iconPath,
  showSupply,
  iconSrc,
}: {
  entry: Entry
  iconPath: string
  showSupply: boolean
  iconSrc: (p: string) => string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 0',
        borderBottom: '1px solid #16161e',
      }}
    >
      <img
        src={iconSrc(`${iconPath}/${UNIT_ICON_BY_ID[entry.id] ?? entry.id}.webp`)}
        width={20}
        height={20}
        alt=""
        style={{ imageRendering: 'pixelated', flexShrink: 0 }}
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.visibility = 'hidden'
        }}
      />
      <span
        style={{
          flex: 1,
          fontSize: '.7em',
          color: '#ccc',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.name}
      </span>
      <Stat value={entry.gold} color="#c8a050" suffix="g" />
      <Stat value={entry.lumber} color="#6ca86c" suffix="l" />
      {showSupply && <Stat value={entry.supply ?? 0} color="#888" suffix=" food" />}
    </div>
  )
}

export function EncyclopediaPanel({
  iconSrc: iconSrcProp,
}: { iconSrc?: (p: string) => string } = {}) {
  const contextIconSrc = useIconSrc()
  const iconSrc = iconSrcProp ?? contextIconSrc

  const [category, setCategory] = useState<Category>('units')
  const [race, setRace] = useState<Race>('All')
  const [search, setSearch] = useState('')

  const entries = useMemo(() => buildEntries(category), [category])

  const filtered = useMemo(() => {
    let result = entries
    if (HAS_RACE_FILTER.has(category) && race !== 'All') {
      result = result.filter((e) => e.race === race)
    }
    const q = search.trim().toLowerCase()
    if (q) result = result.filter((e) => e.name.toLowerCase().includes(q))
    return [...result].sort((a, b) => a.name.localeCompare(b.name))
  }, [entries, race, search, category])

  const iconPath = category === 'items' ? '/items' : '/units'
  const showSupply = category === 'units'
  const showRaceFilter = HAS_RACE_FILTER.has(category)

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 10px',
    fontSize: '.65em',
    fontFamily: 'monospace',
    letterSpacing: '.05em',
    color: active ? '#c8a050' : '#555',
    borderBottom: active ? '2px solid #c8a050' : '2px solid transparent',
  })

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? '#1e1e2e' : 'none',
    border: `1px solid ${active ? '#2a2a4a' : '#1a1a28'}`,
    borderRadius: 3,
    cursor: 'pointer',
    padding: '2px 7px',
    fontSize: '.6em',
    fontFamily: 'monospace',
    color: active ? '#ccc' : '#555',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Category tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e1e26', flexShrink: 0 }}>
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            style={tabStyle(category === key)}
            onClick={() => {
              setCategory(key)
              setRace('All')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search + race filter */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          padding: '8px 12px',
          flexShrink: 0,
          flexWrap: 'wrap',
          borderBottom: '1px solid #1e1e26',
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{
            background: '#0d0d18',
            border: '1px solid #2a2a3a',
            borderRadius: 3,
            padding: '3px 8px',
            color: '#ccc',
            fontSize: '.65em',
            fontFamily: 'monospace',
            width: 110,
            outline: 'none',
          }}
        />
        {showRaceFilter && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {RACES.map((r) => (
              <button key={r} style={filterBtnStyle(race === r)} onClick={() => setRace(r)}>
                {r === 'Night Elf' ? 'NE' : r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '3px 12px',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 20, flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: '.55em',
            color: '#444',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
          }}
        >
          Name
        </span>
        <span
          style={{
            fontSize: '.55em',
            color: '#444',
            fontFamily: 'monospace',
            minWidth: 44,
            textTransform: 'uppercase',
            letterSpacing: '.05em',
          }}
        >
          Gold
        </span>
        <span
          style={{
            fontSize: '.55em',
            color: '#444',
            fontFamily: 'monospace',
            minWidth: 44,
            textTransform: 'uppercase',
            letterSpacing: '.05em',
          }}
        >
          Lumber
        </span>
        {showSupply && (
          <span
            style={{
              fontSize: '.55em',
              color: '#444',
              fontFamily: 'monospace',
              minWidth: 44,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
            }}
          >
            Food
          </span>
        )}
      </div>

      {/* Entries */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 12px' }}>
        {filtered.length === 0 ? (
          <div
            style={{ fontSize: '.65em', color: '#444', fontFamily: 'monospace', paddingTop: 16 }}
          >
            No results
          </div>
        ) : (
          filtered.map((e) => (
            <EntryRow
              key={e.id}
              entry={e}
              iconPath={iconPath}
              showSupply={showSupply}
              iconSrc={iconSrc}
            />
          ))
        )}
      </div>
    </div>
  )
}
