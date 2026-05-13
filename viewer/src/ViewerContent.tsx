import { useState, type CSSProperties } from 'react'
import type { ChartPlayer } from '@magic-sentry/shared'
import { HeroPanel } from './HeroPanel'
import { ItemsPanel } from './ItemsPanel'
import { EconomyChart, LumberChart, ApmChart } from './charts/ResourceChart'
import { FoodChart } from './charts/FoodChart'
import { ArmyChart, CurrentArmies } from './charts/ArmyChart'
import { IconSrcProvider } from './context'

export type TabKey = 'heroes' | 'items' | 'gold' | 'lumber' | 'food' | 'armies' | 'army' | 'apm'

export const VIEWER_TABS: { key: TabKey; label: string }[] = [
  { key: 'heroes', label: 'Heroes' },
  { key: 'items', label: 'Items' },
  { key: 'gold', label: 'Gold' },
  { key: 'lumber', label: 'Lumber' },
  { key: 'food', label: 'Food' },
  { key: 'armies', label: 'Current Armies' },
  { key: 'army', label: 'Army over time' },
  { key: 'apm', label: 'APM' },
]

export function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '.68em',
        color: '#888',
        fontFamily: 'monospace',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: ok ? '#3fb950' : '#ff7b72',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  )
}

export function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid #1e1e26',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {VIEWER_TABS.map(({ key, label }) => {
        const isActive = key === active
        const style: CSSProperties = {
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
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }
        return (
          <button key={key} style={style} onClick={() => onChange(key)}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

export function TeamsBar({ players }: { players: ChartPlayer[] }) {
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

export function ViewerContent({
  players,
  iconSrc,
  error,
}: {
  players: ChartPlayer[]
  iconSrc: (path: string) => string
  error?: string | null
}) {
  const [tab, setTab] = useState<TabKey>('heroes')

  return (
    <IconSrcProvider value={iconSrc}>
      <>
        <div style={{ padding: '0 24px', flexShrink: 0 }}>
          <TabBar active={tab} onChange={setTab} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '24px' }}>
          {error && (
            <div
              style={{
                fontSize: '.65em',
                color: '#ff7b72',
                fontFamily: 'monospace',
                padding: '7px 12px',
                background: 'rgba(255,0,0,0.08)',
                border: '1px solid rgba(255,0,0,0.2)',
                borderRadius: 3,
                marginBottom: 20,
              }}
            >
              Poll error: {error}
            </div>
          )}
          {tab === 'heroes' && <HeroPanel players={players} />}
          {tab === 'items' && <ItemsPanel players={players} />}
          {tab === 'gold' && <EconomyChart players={players} />}
          {tab === 'lumber' && <LumberChart players={players} />}
          {tab === 'food' && <FoodChart players={players} />}
          {tab === 'armies' && <CurrentArmies players={players} />}
          {tab === 'army' && <ArmyChart players={players} />}
          {tab === 'apm' && <ApmChart players={players} />}
        </div>
      </>
    </IconSrcProvider>
  )
}
