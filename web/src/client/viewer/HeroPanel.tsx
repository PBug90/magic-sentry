import { useState } from 'react'
import {
  AbilitySnapshot,
  ChartPlayer,
  HeroSample,
  ItemSnapshot,
  UpgradeSnapshot,
} from '../shared/types'
import {
  ABILITY_BY_ID,
  HERO_XP_THRESHOLDS,
  ITEM_BY_ID,
  UNIT_NAME_BY_ID,
  UPGRADE_NAME_BY_ID,
  UPGRADE_GOLD_BY_ID,
  UPGRADE_LUMBER_BY_ID,
} from '@magic-sentry/shared'
import { iconSrc } from './iconSrc'

// Unified hero display shape — works for both HeroFinal (summary) and HeroSample (live).
interface HeroDisplay {
  id: string
  level: number
  xp: number
  deaths: number
  damage_dealt: number
  damage_received: number
  healing_done: number
  abilities: AbilitySnapshot[]
  inventory: ItemSnapshot[]
}

/** When the final summary isn't available yet, derive one entry per hero from the
 *  most recent sample that mentions them. */
function heroesFromSamples(player: ChartPlayer): HeroDisplay[] {
  const latest = new Map<string, HeroSample>()
  for (const sample of player.samples) {
    for (const h of sample.heroes) {
      latest.set(h.id, h)
    }
  }
  return [...latest.values()]
}

function HeroIcon({ id, size = 44 }: { id: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '1px solid #2a2a3a',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <img
        src={iconSrc(`/heroes/${id}.webp`)}
        alt={id}
        title={id}
        width={size}
        height={size}
        style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}

function fmtStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

function AbilityTile({ ability }: { ability: AbilitySnapshot }) {
  const info = ABILITY_BY_ID[ability.id]
  const name = info?.name ?? ability.id
  const size = 32
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div
        title={`${name} (Lv.${ability.level})`}
        style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
      >
        <div
          style={{
            width: size,
            height: size,
            border: '1px solid #2a2a3a',
            overflow: 'hidden',
            background: '#0d0d14',
          }}
        >
          <img
            src={iconSrc(`/abilities/${ability.id}.webp`)}
            alt={name}
            width={size}
            height={size}
            style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            fontSize: '.42em',
            color: '#c8a050',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.82)',
            padding: '1px 3px',
            lineHeight: 1,
          }}
        >
          {ability.level}
        </span>
      </div>
      {ability.damage_dealt > 0 && (
        <span style={{ fontSize: '.42em', color: '#777', fontFamily: 'monospace' }}>
          {fmtStat(ability.damage_dealt)}
        </span>
      )}
      {ability.healing_done > 0 && (
        <span style={{ fontSize: '.42em', color: '#3fb950', fontFamily: 'monospace' }}>
          {fmtStat(ability.healing_done)}
        </span>
      )}
    </div>
  )
}

function ItemTile({ item }: { item: ItemSnapshot }) {
  const [hovered, setHovered] = useState(false)
  const item_info = ITEM_BY_ID[item.id]
  const name = item_info?.name ?? item.id
  const gold = item_info?.gold
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 4,
            background: '#0f0f1a',
            border: '1px solid #2a2a3a',
            padding: '4px 8px',
            whiteSpace: 'nowrap',
            zIndex: 100,
            pointerEvents: 'none',
            fontSize: '0.7rem',
            lineHeight: 1.5,
            color: '#f0ece0',
          }}
        >
          <div>{name}</div>
          {gold !== undefined && (
            <div style={{ color: '#c8a050', fontFamily: 'monospace' }}>{gold}g</div>
          )}
        </div>
      )}
      <div
        style={{
          width: 32,
          height: 32,
          border: '1px solid #2a2a3a',
          overflow: 'hidden',
          background: '#0d0d14',
        }}
      >
        <img
          src={`/items/${item.id}.webp`}
          alt={item.id}
          width={32}
          height={32}
          style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      {item.charges > 0 && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 2,
            fontSize: '.45em',
            color: '#efeff1',
            fontFamily: 'monospace',
            textShadow: '0 0 3px #000, 0 0 3px #000',
          }}
        >
          {item.charges}
        </span>
      )}
    </div>
  )
}

function XpBar({ xp, level }: { xp: number; level: number }) {
  const maxLevel = HERO_XP_THRESHOLDS.length
  const isMax = level >= maxLevel
  const floorXp = HERO_XP_THRESHOLDS[Math.min(level - 1, maxLevel - 1)] ?? 0
  const ceilXp = HERO_XP_THRESHOLDS[Math.min(level, maxLevel - 1)] ?? floorXp
  const fraction = isMax
    ? 1
    : ceilXp === floorXp
      ? 1
      : Math.min((xp - floorXp) / (ceilXp - floorXp), 1)
  const label = isMax
    ? `${xp.toLocaleString()} xp — max level`
    : `${xp.toLocaleString()} / ${ceilXp.toLocaleString()} xp`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        style={{
          height: 4,
          background: '#1e1e26',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
        title={label}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${fraction * 100}%`,
            background: isMax ? '#c8a050' : 'linear-gradient(90deg, #c8a050, #e8c070)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <span style={{ fontSize: '.5em', color: '#888', fontFamily: 'monospace' }}>{label}</span>
    </div>
  )
}

function EmptyHeroSlot({ index, color }: { index: number; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 10px',
        background: '#0d0d12',
        border: '1px solid #1e1e26',
        borderTop: `3px solid ${color}`,
        opacity: 0.35,
        minHeight: 80,
        justifyContent: 'center',
        gap: 6,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: '1px dashed #2a2a3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '.55em', color: '#888', fontFamily: 'monospace' }}>
          {index + 1}
        </span>
      </div>
      <span
        style={{
          fontSize: '.5em',
          color: '#777',
          fontFamily: 'monospace',
          letterSpacing: '.06em',
        }}
      >
        —
      </span>
    </div>
  )
}

function HeroCard({
  hero,
  player,
  index,
}: {
  hero: HeroDisplay
  player: ChartPlayer
  index: number
}) {
  const display = UNIT_NAME_BY_ID[hero.id] ?? hero.id
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '8px 10px',
        background: '#12121a',
        border: '1px solid #2a2a3a',
        borderTop: `3px solid ${player.color}`,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Left: icon + name, stats, abilities */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <HeroIcon id={hero.id} size={44} />
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  fontSize: '.48em',
                  background: 'rgba(0,0,0,0.78)',
                  color: '#c8a050',
                  padding: '1px 4px',
                  letterSpacing: '.06em',
                  fontFamily: 'monospace',
                }}
              >
                {index + 1}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span
                style={{
                  fontSize: '.78em',
                  color: '#efeff1',
                  letterSpacing: '.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {display}
              </span>
              <span
                style={{
                  fontSize: '.65em',
                  color: '#c8a050',
                  fontFamily: 'monospace',
                  opacity: 0.85,
                }}
              >
                Lv.{hero.level}
              </span>
              <XpBar xp={hero.xp} level={hero.level} />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            {(
              [
                ['Deaths', hero.deaths],
                ['Dmg dealt', hero.damage_dealt.toLocaleString()],
                ['Dmg recv', hero.damage_received.toLocaleString()],
                ['Healing', hero.healing_done.toLocaleString()],
              ] as Array<[string, string | number]>
            ).map(([label, val]) => (
              <span key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontSize: '.5em',
                    color: '#888',
                    letterSpacing: '.06em',
                    fontFamily: 'monospace',
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: '.66em', color: '#efeff1', fontFamily: 'monospace' }}>
                  {val}
                </span>
              </span>
            ))}
          </div>
          {hero.abilities.length > 0 && (
            <div
              style={{
                borderTop: '1px solid #1e1e26',
                paddingTop: 6,
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
              }}
            >
              {hero.abilities.map((a) => (
                <AbilityTile key={a.id} ability={a} />
              ))}
            </div>
          )}
        </div>
        {/* Right: 2×3 inventory grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 32px)',
            gridTemplateRows: 'repeat(3, 32px)',
            gap: 2,
            flexShrink: 0,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const item = hero.inventory[i]
            if (!item) {
              return (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #1e1e26',
                    background: '#0a0a10',
                  }}
                />
              )
            }
            return <ItemTile key={item.id + i} item={item} />
          })}
        </div>
      </div>
    </div>
  )
}

function upgradesFromPlayer(player: ChartPlayer): UpgradeSnapshot[] {
  if (player.summary.upgrades.length > 0) return player.summary.upgrades
  const last = [...player.samples].reverse().find((s) => s.upgrades.length > 0)
  return last?.upgrades ?? []
}

function UpgradeRow({ upgrade }: { upgrade: UpgradeSnapshot }) {
  const [hovered, setHovered] = useState(false)
  const name = UPGRADE_NAME_BY_ID[upgrade.id] ?? upgrade.id
  const gold = UPGRADE_GOLD_BY_ID[upgrade.id]
  const lumber = UPGRADE_LUMBER_BY_ID[upgrade.id]
  const pips = Array.from({ length: upgrade.max_level }, (_, i) => i < upgrade.level)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{ position: 'relative', flexShrink: 0 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 4,
              background: '#0f0f1a',
              border: '1px solid #2a2a3a',
              padding: '4px 8px',
              whiteSpace: 'nowrap',
              zIndex: 100,
              pointerEvents: 'none',
              fontSize: '0.7rem',
              lineHeight: 1.5,
              color: '#f0ece0',
              borderRadius: 3,
            }}
          >
            <div>{name}</div>
            {gold !== undefined && gold > 0 && (
              <div style={{ color: '#c8a050', fontFamily: 'monospace' }}>{gold}g</div>
            )}
            {lumber !== undefined && lumber > 0 && (
              <div style={{ color: '#7dbf7d', fontFamily: 'monospace' }}>{lumber}w</div>
            )}
          </div>
        )}
        <div
          style={{
            width: 25,
            height: 25,
            border: '1px solid #2a2a3a',
            overflow: 'hidden',
            background: '#0d0d14',
          }}
        >
          <img
            src={iconSrc(`/upgrades/${upgrade.id}.webp`)}
            alt={upgrade.id}
            width={25}
            height={25}
            style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        {pips.map((filled, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 1,
              background: filled ? '#c8a050' : '#2a2a3a',
              border: '1px solid ' + (filled ? '#c8a050' : '#3a3a4a'),
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function HeroPanel({ players }: { players: ChartPlayer[] }) {
  const playerData = players.map((player) => {
    const heroes: HeroDisplay[] =
      player.summary.heroes.length > 0
        ? [...player.summary.heroes].reverse()
        : heroesFromSamples(player)
    const upgrades = upgradesFromPlayer(player)
    return { player, heroes, upgrades }
  })

  if (playerData.every(({ heroes }) => heroes.length === 0)) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {playerData.map(({ player, heroes, upgrades }) => (
        <div key={player.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              fontSize: '.62em',
              letterSpacing: '.12em',
              color: player.color,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            {player.name}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[0, 1, 2].map((i) =>
              heroes[i] ? (
                <HeroCard key={heroes[i].id} hero={heroes[i]} player={player} index={i} />
              ) : (
                <EmptyHeroSlot key={i} index={i} color={player.color} />
              ),
            )}
          </div>
          {upgrades.length > 0 && (
            <div
              style={{
                padding: '8px 10px',
                background: '#12121a',
                border: '1px solid #2a2a3a',
                borderLeft: `3px solid ${player.color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: '.5em',
                  color: '#888',
                  letterSpacing: '.1em',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}
              >
                Upgrades
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '3px 16px',
                }}
              >
                {upgrades.map((u) => (
                  <UpgradeRow key={u.id} upgrade={u} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
