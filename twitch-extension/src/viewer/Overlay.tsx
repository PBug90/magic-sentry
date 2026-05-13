import { useState, useEffect, useRef } from 'react'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import { ViewerContent, TeamsBar, StatusDot } from '@magic-sentry/viewer'
import type { ChartPlayer } from '../shared/types'
import { useTwitchConfig } from './hooks/useTwitchConfig'
import { useMagicSentryGame } from './hooks/useMagicSentryGame'

function twitchIconSrc(path: string): string {
  return `.${path}`
}

export function Overlay() {
  const [fontSize, setFontSize] = useState(16)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setFontSize(Math.max(16, 22 - (8 * (w - 300)) / 700))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { config, configReady } = useTwitchConfig()
  const { game, fetchError, lastUpdated, refresh } = useMagicSentryGame(config, configReady)

  const playerData: ChartPlayer[] = (game?.players ?? []).map((p, i) => ({
    ...p,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }))

  return (
    <div
      ref={containerRef}
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
            <span style={{ fontSize: '.72em', color: '#6a6a6a', fontFamily: 'monospace' }}>
              {formatDuration(game.duration_ms)}
            </span>
            <TeamsBar players={playerData} />
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdated && (
            <span style={{ fontSize: '.6em', color: '#555', fontFamily: 'monospace' }}>
              updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            title="Refresh"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#555',
              fontSize: '.85em',
              padding: '2px 4px',
              lineHeight: 1,
            }}
          >
            ↺
          </button>
        </div>
      </div>

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

      {game && <ViewerContent players={playerData} iconSrc={twitchIconSrc} error={fetchError} />}
    </div>
  )
}
