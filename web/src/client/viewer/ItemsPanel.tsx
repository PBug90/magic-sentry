import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ChartPlayer, PlayerItemStatSnapshot } from '../shared/types'
import { ITEM_BY_ID } from '@magic-sentry/shared'
import { iconSrc } from './iconSrc'

function itemsFromPlayer(player: ChartPlayer): PlayerItemStatSnapshot[] {
  const last = [...player.samples].reverse().find((s) => s.player_items.length > 0)
  const items = last?.player_items ?? []
  return [...items].sort((a, b) => b.purchased + b.collected - (a.purchased + a.collected))
}

function ItemRow({ item }: { item: PlayerItemStatSnapshot }) {
  const [hovered, setHovered] = useState(false)
  const meta = ITEM_BY_ID[item.id]
  const name = meta?.name ?? item.id
  const totalGold = item.purchased * (meta?.gold ?? 0)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '22px 1fr 32px 48px 32px 32px 32px 48px 48px',
        alignItems: 'center',
        gap: 4,
        padding: '2px 0',
        borderBottom: '1px solid #1a1a24',
        fontSize: '.65em',
        fontFamily: 'monospace',
      }}
    >
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
              fontSize: '1rem',
              lineHeight: 1.5,
              color: '#f0ece0',
              borderRadius: 3,
            }}
          >
            <div>{name}</div>
            {meta?.gold !== undefined && meta.gold > 0 && (
              <div style={{ color: '#c8a050' }}>{meta.gold}g</div>
            )}
          </div>
        )}
        <div style={{ position: 'relative', width: 20, height: 20 }}>
          <img
            src={iconSrc(`/items/${item.id}.webp`)}
            alt={item.id}
            width={20}
            height={20}
            style={{
              display: 'block',
              imageRendering: 'pixelated',
              width: '100%',
              height: '100%',
              border: '1px solid #2a2a3a',
            }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          {item.item_level > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: 'rgba(0,0,0,0.75)',
                color: '#c8a050',
                fontSize: '.55em',
                lineHeight: 1,
                padding: '1px 2px',
              }}
            >
              {item.item_level}
            </div>
          )}
        </div>
      </div>

      <span
        style={{
          color: '#efeff1',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </span>
      <span style={{ color: '#c8a050', textAlign: 'right' }}>{item.purchased || '—'}</span>
      <span style={{ color: '#c8a050', textAlign: 'right', opacity: totalGold > 0 ? 1 : 0.3 }}>
        {totalGold > 0 ? `${totalGold.toLocaleString()}g` : '—'}
      </span>
      <span style={{ color: '#7dbf7d', textAlign: 'right' }}>{item.used || '—'}</span>
      <span style={{ color: '#888', textAlign: 'right' }}>{item.sold || '—'}</span>
      <span style={{ color: '#e06c6c', textAlign: 'right' }}>{item.destroyed || '—'}</span>
      <span style={{ color: '#ff9944', textAlign: 'right' }}>
        {item.damage_dealt > 0 ? item.damage_dealt.toLocaleString() : '—'}
      </span>
      <span style={{ color: '#7dbf7d', textAlign: 'right' }}>
        {item.healing_done > 0 ? item.healing_done.toLocaleString() : '—'}
      </span>
    </div>
  )
}

const HEADER_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '22px 1fr 32px 48px 32px 32px 32px 48px 48px',
  gap: 4,
  padding: '0 0 4px 0',
  borderBottom: '1px solid #2a2a3a',
  fontSize: '.52em',
  fontFamily: 'monospace',
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: '#555',
}

export function ItemsPanel({ players }: { players: ChartPlayer[] }) {
  const playerData = players.map((player) => {
    const items = itemsFromPlayer(player)
    const totalGold = items.reduce(
      (sum, item) => sum + item.purchased * (ITEM_BY_ID[item.id]?.gold ?? 0),
      0,
    )
    return { player, items, totalGold }
  })

  if (playerData.every(({ items }) => items.length === 0)) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {playerData.map(({ player, items, totalGold }) => {
        if (items.length === 0) return null
        return (
          <div
            key={player.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              flex: '1 1 0',
              minWidth: 240,
            }}
          >
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
            <div
              style={{
                padding: '8px 10px',
                background: '#12121a',
                border: '1px solid #2a2a3a',
                borderLeft: `3px solid ${player.color}`,
              }}
            >
              <div style={HEADER_STYLE}>
                <div />
                <div>Item</div>
                <div style={{ textAlign: 'right' }}>Buy</div>
                <div style={{ textAlign: 'right' }}>Gold</div>
                <div style={{ textAlign: 'right' }}>Use</div>
                <div style={{ textAlign: 'right' }}>Sell</div>
                <div style={{ textAlign: 'right' }}>Lost</div>
                <div style={{ textAlign: 'right' }}>Dmg</div>
                <div style={{ textAlign: 'right' }}>Heal</div>
              </div>
              {items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
              {totalGold > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 6,
                    paddingTop: 6,
                    marginTop: 2,
                    borderTop: '1px solid #2a2a3a',
                    fontSize: '.62em',
                    fontFamily: 'monospace',
                    color: '#c8a050',
                  }}
                >
                  <span
                    style={{ color: '#555', textTransform: 'uppercase', letterSpacing: '.08em' }}
                  >
                    Total invested
                  </span>
                  <span>{totalGold.toLocaleString()}g</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
