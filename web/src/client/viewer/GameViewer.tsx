import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import { GameRecord, GamePatch, PlayerRecord, ChartPlayer } from '../shared/types'
import { PLAYER_COLORS, formatDuration } from '../shared/chartUtils'
import { HeroPanel } from './HeroPanel'
import { EconomyChart, LumberChart } from './charts/ResourceChart'
import { FoodChart } from './charts/FoodChart'
import { ArmyChart } from './charts/ArmyChart'

type TabKey = 'heroes' | 'gold' | 'lumber' | 'food' | 'army'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'heroes', label: 'Heroes' },
  { key: 'gold', label: 'Gold' },
  { key: 'lumber', label: 'Lumber' },
  { key: 'food', label: 'Food' },
  { key: 'army', label: 'Army' },
]

function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #1e1e26' }}>
      {TABS.map(({ key, label }) => {
        const isActive = key === active
        const style: CSSProperties = {
          padding: '9px 18px',
          fontFamily: 'monospace',
          fontSize: '.7rem',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          borderBottom: isActive ? '2px solid #c8a050' : '2px solid transparent',
          color: isActive ? '#c8a050' : '#555',
          transition: 'color .12s',
          marginBottom: -1,
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
                fontSize: '.55rem',
                letterSpacing: '.14em',
                color: '#555',
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
                <span style={{ fontSize: '.75rem', color: '#efeff1' }}>{p.name}</span>
              </span>
            ))}
            {won && (
              <span
                style={{
                  fontSize: '.52rem',
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

interface GameViewerProps {
  channel: string
  onBack: () => void
}

export function GameViewer({ channel, onBack }: GameViewerProps) {
  const [tab, setTab] = useState<TabKey>('heroes')
  const [game, setGame] = useState<GameRecord | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextSeqRef = useRef(0)
  const accumulatedPatchesRef = useRef(new Map<number, GamePatch>())

  const fetchDelta = useCallback(async () => {
    try {
      const since = nextSeqRef.current
      const res = await fetch(`/api/${channel}/live/delta?since=${since}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { patches: GamePatch[] }

      const incoming = data.patches
      if (incoming.length === 0) return

      for (const p of incoming) accumulatedPatchesRef.current.set(p.seq, p)
      nextSeqRef.current = Math.max(...incoming.map((p) => p.seq)) + 1

      const sorted = [...accumulatedPatchesRef.current.values()].sort((a, b) => a.seq - b.seq)

      const playerMap = new Map<string, PlayerRecord>()
      for (const patch of sorted) {
        for (const pp of patch.players) {
          let record = playerMap.get(pp.name)
          if (!record) {
            record = {
              name: pp.name,
              race: pp.race,
              team: pp.team,
              result: '',
              time_in_upkeep_ms: [],
              samples: [],
              summary: { heroes: [], units: [] },
            }
            playerMap.set(pp.name, record)
          }
          record.samples.push(...pp.new_samples)
          if (pp.result) record.result = pp.result
          if (pp.summary) record.summary = pp.summary
        }
      }

      const players = [...playerMap.values()]
      const duration_ms = players
        .flatMap((p) => p.samples)
        .reduce((max, s) => Math.max(max, s.time_ms), 0)

      setGame({ map: sorted[0].map, game: sorted[0].game, duration_ms, players })
      setFetchError(null)
      setLastUpdated(new Date())
    } catch (e) {
      setFetchError(String(e))
    }
  }, [channel])

  useEffect(() => {
    nextSeqRef.current = 0
    accumulatedPatchesRef.current = new Map()
    void fetchDelta()
    intervalRef.current = setInterval(() => void fetchDelta(), 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchDelta])

  const playerData: ChartPlayer[] = (game?.players ?? []).map((p, i) => ({
    ...p,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }))

  return (
    <div
      style={{
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
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
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid #2a2a3a',
            borderRadius: 3,
            color: '#777',
            cursor: 'pointer',
            fontSize: '.7rem',
            fontFamily: 'monospace',
            padding: '4px 10px',
          }}
        >
          ← Back
        </button>
        <span
          style={{
            fontSize: '.75rem',
            letterSpacing: '.1em',
            color: '#c8a050',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          Magic Sentry
        </span>
        {game && (
          <>
            <span style={{ color: '#2a2a3a' }}>·</span>
            <span style={{ fontSize: '.8rem', color: '#efeff1' }}>{game.map}</span>
            <span style={{ fontSize: '.72rem', color: '#555', fontFamily: 'monospace' }}>
              {formatDuration(game.duration_ms)}
            </span>
            <TeamsBar players={playerData} />
          </>
        )}
        {lastUpdated && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '.6rem',
              color: '#444',
              fontFamily: 'monospace',
            }}
          >
            updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error / loading */}
      {!game && (
        <div style={{ padding: '20px 24px' }}>
          {fetchError ? (
            <span style={{ fontSize: '.7rem', color: '#ff7b72', fontFamily: 'monospace' }}>
              Error: {fetchError}
            </span>
          ) : (
            <span style={{ fontSize: '.7rem', color: '#555', fontFamily: 'monospace' }}>
              Loading…
            </span>
          )}
        </div>
      )}

      {game && (
        <>
          <div style={{ padding: '0 24px' }}>
            <TabBar active={tab} onChange={setTab} />
          </div>

          <div style={{ padding: '24px' }}>
            {fetchError && (
              <div
                style={{
                  fontSize: '.65rem',
                  color: '#ff7b72',
                  fontFamily: 'monospace',
                  padding: '7px 12px',
                  background: 'rgba(255,0,0,0.08)',
                  border: '1px solid rgba(255,0,0,0.2)',
                  borderRadius: 3,
                  marginBottom: 20,
                }}
              >
                Poll error: {fetchError}
              </div>
            )}
            {tab === 'heroes' && <HeroPanel players={playerData} />}
            {tab === 'gold' && <EconomyChart players={playerData} />}
            {tab === 'lumber' && <LumberChart players={playerData} />}
            {tab === 'food' && <FoodChart players={playerData} />}
            {tab === 'army' && <ArmyChart players={playerData} />}
          </div>
        </>
      )}
    </div>
  )
}
