import { useState, useEffect, useRef } from 'react'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import {
  ViewerContent,
  TeamsBar,
  StatusDot,
  EncyclopediaPanel,
  VIEWER_TABS,
  GameHistoryDropdown,
} from '@magic-sentry/viewer'
import { useExtensionHistory } from './hooks/useExtensionHistory'

const visibleTabs =
  import.meta.env.VITE_ENABLE_FIGHTS === 'true'
    ? VIEWER_TABS
    : VIEWER_TABS.filter((t) => t.key !== 'fights')

const WIKI_ENABLED = import.meta.env.VITE_ENABLE_WIKI === 'true'
import type { ChartPlayer } from '../shared/types'
import { useTwitchConfig } from './hooks/useTwitchConfig'
import { useMagicSentryGame } from './hooks/useMagicSentryGame'
import { NoGameScreen } from './NoGameScreen'

function twitchIconSrc(path: string): string {
  return `.${path}`
}

export function Overlay() {
  const [fontSize, setFontSize] = useState(16)
  const [view, setView] = useState<'game' | 'encyclopedia'>('game')
  const effectiveView = WIKI_ENABLED ? view : 'game'
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

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const history = useExtensionHistory(config.endpointUrl)

  // Reset to live view when the channel/endpoint changes
  useEffect(() => {
    setSelectedHistoryId(null)
  }, [config.endpointUrl])

  // When a history game is selected, point useMagicSentryGame at that specific game
  const effectiveConfig = selectedHistoryId
    ? { ...config, endpointUrl: `${config.endpointUrl}/${selectedHistoryId}` }
    : config

  // endpointUrl is https://host/api/:channel/live — extract the channel segment
  const channel = (() => {
    try {
      const parts = new URL(config.endpointUrl).pathname.split('/')
      return parts[parts.length - 2] ?? ''
    } catch {
      return ''
    }
  })()

  const { game, fetchError, lastUpdated, refresh } = useMagicSentryGame(
    effectiveConfig,
    configReady,
  )

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
          {lastUpdated && effectiveView === 'game' && !selectedHistoryId && (
            <span style={{ fontSize: '.6em', color: '#555', fontFamily: 'monospace' }}>
              updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {WIKI_ENABLED && (
            <button
              onClick={() => setView((v) => (v === 'encyclopedia' ? 'game' : 'encyclopedia'))}
              title={effectiveView === 'encyclopedia' ? 'Back to game' : 'Encyclopedia'}
              style={{
                background: effectiveView === 'encyclopedia' ? '#1e1e2e' : 'none',
                border: `1px solid ${effectiveView === 'encyclopedia' ? '#2a2a4a' : 'transparent'}`,
                borderRadius: 3,
                cursor: 'pointer',
                color: effectiveView === 'encyclopedia' ? '#c8a050' : '#555',
                fontSize: '.7em',
                padding: '2px 7px',
                lineHeight: 1.4,
                fontFamily: 'monospace',
              }}
            >
              {effectiveView === 'encyclopedia' ? '← game' : '⊞ wiki'}
            </button>
          )}
          {effectiveView === 'game' && !selectedHistoryId && (
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
          )}
          {effectiveView === 'game' && (
            <GameHistoryDropdown
              channel={channel}
              liveGame={effectiveConfig === config ? game : null}
              history={history}
              selectedHistoryId={selectedHistoryId}
              onSelect={setSelectedHistoryId}
            />
          )}
        </div>
      </div>

      {effectiveView === 'encyclopedia' && <EncyclopediaPanel iconSrc={twitchIconSrc} />}

      {effectiveView === 'game' && !game && configReady && (
        <div style={{ padding: '20px 24px' }}>
          {!config.endpointUrl || !config.token ? (
            <StatusDot ok={false} label="Incomplete setup — endpoint and token required" />
          ) : (
            <NoGameScreen />
          )}
        </div>
      )}

      {effectiveView === 'game' && game && (
        <ViewerContent
          players={playerData}
          iconSrc={twitchIconSrc}
          error={fetchError}
          tabs={visibleTabs}
        />
      )}
    </div>
  )
}
