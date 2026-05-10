import { useState } from 'react'
import type { GameRecord, ChartPlayer } from '../shared/types'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import { HeroPanel } from '../viewer/HeroPanel'
import { ItemsPanel } from '../viewer/ItemsPanel'
import { EconomyChart, LumberChart, ApmChart } from '../viewer/charts/ResourceChart'
import { FoodChart } from '../viewer/charts/FoodChart'
import { ArmyChart, CurrentArmies } from '../viewer/charts/ArmyChart'

type TabKey = 'heroes' | 'items' | 'gold' | 'lumber' | 'food' | 'armies' | 'army' | 'apm'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'heroes', label: 'Heroes' },
  { key: 'items', label: 'Items' },
  { key: 'gold', label: 'Gold' },
  { key: 'lumber', label: 'Lumber' },
  { key: 'food', label: 'Food' },
  { key: 'armies', label: 'Current Armies' },
  { key: 'army', label: 'Army over time' },
  { key: 'apm', label: 'APM' },
]

function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #1e1e26' }}>
      {TABS.map(({ key, label }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              padding: '9px 18px',
              fontFamily: 'monospace',
              fontSize: '.7em',
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid #c8a050' : '2px solid transparent',
              color: isActive ? '#c8a050' : '#888',
              transition: 'color .12s',
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function TeamsBar({ players }: { players: ChartPlayer[] }) {
  const teams = [...new Set(players.map((p) => p.team))].sort((a, b) => a - b)
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {teams.map((team, ti) => {
        const tp = players.filter((p) => p.team === team)
        const won = tp.some((p) => p.result === 'Victory')
        return (
          <div
            key={team}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              background: '#12121a',
              border: won ? '1px solid rgba(200,160,80,0.4)' : '1px solid #2a2a3a',
              borderRadius: 3,
            }}
          >
            <span
              style={{
                fontSize: '.55em',
                letterSpacing: '.14em',
                color: '#888',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
              }}
            >
              T{ti + 1}
            </span>
            {tp.map((p) => (
              <span key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: p.color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: '.75em', color: '#efeff1' }}>{p.name}</span>
              </span>
            ))}
            {won && (
              <span
                style={{
                  fontSize: '.52em',
                  letterSpacing: '.14em',
                  color: '#c8a050',
                  fontFamily: 'monospace',
                }}
              >
                VICTOR
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function StandaloneViewer({ game }: { game: GameRecord }) {
  const [tab, setTab] = useState<TabKey>('heroes')

  const players: ChartPlayer[] = game.players.map((p, i) => ({
    ...p,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }))

  return (
    <div
      style={{
        fontSize: '22px',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          padding: '12px 24px',
          borderBottom: '1px solid #1e1e26',
        }}
      >
        <span
          style={{
            fontSize: '.75em',
            letterSpacing: '.1em',
            color: '#c8a050',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          Magic Sentry
        </span>
        <span style={{ color: '#2a2a3a' }}>·</span>
        <span style={{ fontSize: '.8em', color: '#efeff1' }}>{game.map}</span>
        <span style={{ fontSize: '.72em', color: '#888', fontFamily: 'monospace' }}>
          {formatDuration(game.duration_ms)}
        </span>
        <TeamsBar players={players} />
      </div>

      <div style={{ padding: '0 24px' }}>
        <TabBar active={tab} onChange={setTab} />
      </div>

      <div style={{ padding: '24px' }}>
        {tab === 'heroes' && <HeroPanel players={players} />}
        {tab === 'items' && <ItemsPanel players={players} />}
        {tab === 'gold' && <EconomyChart players={players} />}
        {tab === 'lumber' && <LumberChart players={players} />}
        {tab === 'food' && <FoodChart players={players} />}
        {tab === 'armies' && <CurrentArmies players={players} />}
        {tab === 'army' && <ArmyChart players={players} />}
        {tab === 'apm' && <ApmChart players={players} />}
      </div>
    </div>
  )
}
