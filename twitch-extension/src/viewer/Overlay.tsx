import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'
import {
  GameRecord,
  GamePatch,
  PlayerRecord,
  ChartPlayer,
  ExtensionConfig,
  DEFAULT_CONFIG,
} from '../shared/types'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import { HeroPanel } from './HeroPanel'
import { EconomyChart, LumberChart, ApmChart } from './charts/ResourceChart'
import { FoodChart } from './charts/FoodChart'
import { ArmyChart, CurrentArmies } from './charts/ArmyChart'

type TabKey = 'heroes' | 'gold' | 'lumber' | 'food' | 'armies' | 'army' | 'apm'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'heroes', label: 'Heroes' },
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

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '.68em',
        color: '#777',
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

export function Overlay() {
  const [tab, setTab] = useState<TabKey>('heroes')
  const [game, setGame] = useState<GameRecord | null>(null)
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [configReady, setConfigReady] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextUrlRef = useRef('')
  const currentGameIdRef = useRef<string | null>(null)
  const accumulatedPatchesRef = useRef(new Map<number, GamePatch>())

  useEffect(() => {
    const ext = window.Twitch?.ext
    console.log('[viewer] useEffect — window.Twitch.ext present:', !!ext)
    if (!ext) {
      console.warn('[viewer] window.Twitch.ext not available — overlay will not load config')
      return
    }

    function applyConfig() {
      console.log('[viewer] applyConfig called')
      const seg = ext.configuration.broadcaster
      console.log('[viewer] broadcaster segment:', seg ?? 'undefined')
      if (seg?.content) {
        try {
          const parsed = JSON.parse(seg.content) as ExtensionConfig
          console.log('[viewer] parsed config:', parsed)
          setConfig(parsed)
        } catch (e) {
          console.error('[viewer] failed to parse broadcaster segment:', e)
        }
      } else {
        console.log(
          '[viewer] no broadcaster segment content — polling disabled until config is set',
        )
      }
      setConfigReady(true)
    }

    console.log('[viewer] registering onAuthorized + onChanged')
    ext.configuration.onChanged(() => {
      console.log('[viewer] onChanged fired')
      applyConfig()
    })
    ext.onAuthorized((auth) => {
      console.log('[viewer] onAuthorized fired — full auth object:', auth)
      console.log('[viewer] ext.viewer:', (ext as any).viewer)
      console.log('[viewer] ext.features:', (ext as any).features)
      console.log('[viewer] ext.configuration.broadcaster:', ext.configuration.broadcaster)
      console.log('[viewer] ext.configuration.developer:', ext.configuration.developer)
      console.log('[viewer] ext.configuration.global:', ext.configuration.global)
      applyConfig()
    })
    ext.onContext((context, changed) => {
      console.log('[viewer] onContext fired — changed fields:', changed)
      console.log('[viewer] full context:', context)
    })
    ext.onError((e) => console.error('[viewer] Twitch ext error:', e))
  }, [])

  // Returns true if a chunk was received (more may follow), false on 204 or error.
  const fetchDelta = useCallback(async (baseUrl: string, token: string): Promise<boolean> => {
    if (!baseUrl) return false
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const res = await fetch(nextUrlRef.current, { headers })
      if (res.status === 204) return false
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { patches: GamePatch[]; next: string }

      let incoming = data.patches
      if (incoming.length === 0) return false

      const origin = new URL(baseUrl).origin
      const incomingGameId = incoming[0].game_id

      if (incomingGameId !== currentGameIdRef.current) {
        // New game — discard accumulated state and re-fetch from the beginning
        accumulatedPatchesRef.current = new Map()
        currentGameIdRef.current = incomingGameId
        const startUrl = `${baseUrl}/after/-1`
        nextUrlRef.current = startUrl
        const res2 = await fetch(startUrl, { headers })
        if (res2.status === 204) return false
        if (!res2.ok) throw new Error(`HTTP ${res2.status}`)
        const data2 = (await res2.json()) as { patches: GamePatch[]; next: string }
        incoming = data2.patches
        nextUrlRef.current = `${origin}${data2.next}`
      } else {
        nextUrlRef.current = `${origin}${data.next}`
      }

      for (const p of incoming) accumulatedPatchesRef.current.set(p.seq, p)

      const sorted = [...accumulatedPatchesRef.current.values()].sort((a, b) => a.seq - b.seq)
      if (sorted.length === 0) return false

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
              samples: [],
              summary: { heroes: [], units: [], upgrades: [] },
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
      return true
    } catch (e) {
      setFetchError(String(e))
      return false
    }
  }, [])

  useEffect(() => {
    if (!configReady) return
    if (intervalRef.current) clearInterval(intervalRef.current)

    // Reset chunk state whenever the endpoint or token changes
    nextUrlRef.current = config.endpointUrl ? `${config.endpointUrl}/after/-1` : ''
    currentGameIdRef.current = null
    accumulatedPatchesRef.current = new Map()

    if (!config.endpointUrl || !config.token) {
      setGame(null)
      setFetchError(null)
      return
    }

    async function catchUp() {
      while (await fetchDelta(config.endpointUrl, config.token)) {
        /* drain chain */
      }
    }

    void catchUp()
    intervalRef.current = setInterval(() => void catchUp(), config.pollIntervalSec * 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [config.endpointUrl, config.pollIntervalSec, config.token, configReady, fetchDelta])

  const playerData: ChartPlayer[] = (game?.players ?? []).map((p, i) => ({
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
      {/* Top bar: title + map info + timestamp */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <img
            src="./magicsentry.webp"
            alt="Magic Sentry"
            width={18}
            height={18}
            style={{ imageRendering: 'auto', flexShrink: 0 }}
          />
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
        </div>
        {game && (
          <>
            <span style={{ color: '#2a2a3a' }}>·</span>
            <span style={{ fontSize: '.8em', color: '#efeff1' }}>{game.map}</span>
            <span style={{ fontSize: '.72em', color: '#555', fontFamily: 'monospace' }}>
              {formatDuration(game.duration_ms)}
            </span>
            <TeamsBar players={playerData} />
          </>
        )}
        {lastUpdated && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '.6em',
              color: '#444',
              fontFamily: 'monospace',
            }}
          >
            updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Status when no game data yet */}
      {!game && configReady && (
        <div style={{ padding: '20px 24px' }}>
          {!config.endpointUrl || !config.token ? (
            <StatusDot ok={false} label="Incomplete setup — endpoint and token required" />
          ) : fetchError ? (
            <StatusDot ok={false} label={`Error: ${fetchError}`} />
          ) : (
            <StatusDot ok={true} label="Waiting for data…" />
          )}
        </div>
      )}

      {game && (
        <>
          {/* Tab bar */}
          <div style={{ padding: '0 24px' }}>
            <TabBar active={tab} onChange={setTab} />
          </div>

          {/* Tab content */}
          <div style={{ padding: '24px' }}>
            {fetchError && (
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
                Poll error: {fetchError}
              </div>
            )}
            {tab === 'heroes' && <HeroPanel players={playerData} />}
            {tab === 'gold' && <EconomyChart players={playerData} />}
            {tab === 'lumber' && <LumberChart players={playerData} />}
            {tab === 'food' && <FoodChart players={playerData} />}
            {tab === 'armies' && <CurrentArmies players={playerData} />}
            {tab === 'army' && <ArmyChart players={playerData} />}
            {tab === 'apm' && <ApmChart players={playerData} />}
          </div>
        </>
      )}
    </div>
  )
}
