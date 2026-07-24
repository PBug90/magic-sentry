import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import {
  TabContent,
  TeamsBar,
  StatusDot,
  EncyclopediaPanel,
  VIEWER_TABS,
  GameHistoryDropdown,
  IconSrcProvider,
  PanelOpacityProvider,
  isGraphTab,
} from '@magic-sentry/viewer'
import type { TabKey } from '@magic-sentry/viewer'
import { useExtensionHistory } from './hooks/useExtensionHistory'
import { OverlayRail, RAIL_WIDTH, type PanelKey } from './OverlayRail'
import { OverlaySettings, type OverlayLayout, type OverlaySide } from './OverlaySettings'

const visibleTabs =
  import.meta.env.VITE_ENABLE_FIGHTS === 'true'
    ? VIEWER_TABS
    : VIEWER_TABS.filter((t) => t.key !== 'fights')

import type { ChartPlayer } from '../shared/types'
import { useTwitchConfig } from './hooks/useTwitchConfig'
import { useMagicSentryGame } from './hooks/useMagicSentryGame'
import { NoGameScreen } from './NoGameScreen'

function twitchIconSrc(path: string): string {
  return `.${path}`
}

export function Overlay() {
  const [fontSize, setFontSize] = useState(16)
  // null = no tab active → only the rail shows and the stream is fully clear.
  const [activeTab, setActiveTab] = useState<PanelKey | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Persisted viewer settings (broadcaster-tunable via the Settings panel).
  const [opacity, setOpacity] = useState<number>(() => {
    const s = localStorage.getItem('magic-sentry-bg-opacity')
    const n = s === null ? 0.92 : parseFloat(s)
    return isNaN(n) ? 0.92 : Math.max(0.3, Math.min(1, n))
  })
  const [layout, setLayout] = useState<OverlayLayout>(() => {
    const s = localStorage.getItem('magic-sentry-layout')
    return s === 'fullscreen' || s === 'corner' ? s : 'docked'
  })
  const [side, setSide] = useState<OverlaySide>(() =>
    localStorage.getItem('magic-sentry-side') === 'right' ? 'right' : 'left',
  )
  // Viewer-adjustable text-size multiplier applied on top of the responsive base.
  const [fontScale, setFontScale] = useState<number>(() => {
    const s = localStorage.getItem('magic-sentry-font-scale')
    const n = s === null ? 1 : parseFloat(s)
    return isNaN(n) ? 1 : Math.max(0.7, Math.min(1.5, n))
  })
  // Collapsed by default on first load; remembered across reloads.
  const [railOpen, setRailOpen] = useState<boolean>(
    () => localStorage.getItem('magic-sentry-rail-open') === 'true',
  )
  useEffect(() => {
    localStorage.setItem('magic-sentry-bg-opacity', String(opacity))
  }, [opacity])
  useEffect(() => {
    localStorage.setItem('magic-sentry-layout', layout)
  }, [layout])
  useEffect(() => {
    localStorage.setItem('magic-sentry-side', side)
  }, [side])
  useEffect(() => {
    localStorage.setItem('magic-sentry-font-scale', String(fontScale))
  }, [fontScale])
  useEffect(() => {
    localStorage.setItem('magic-sentry-rail-open', String(railOpen))
  }, [railOpen])

  // Collapsing the rail returns the stream to fully clear: close any open panel.
  const toggleRail = () =>
    setRailOpen((prev) => {
      const next = !prev
      if (!next) setActiveTab(null)
      return next
    })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width
      setFontSize(Math.max(15, 22 - (8 * (w - 300)) / 700))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { config, configReady } = useTwitchConfig()

  // Without a full broadcaster config (endpoint + key) the extension runs in
  // encyclopedia-only mode: no game tabs, no settings, and no network requests.
  const configured = !!(config.endpointUrl && config.token)

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const history = useExtensionHistory(configured ? config.endpointUrl : '')

  // If the config goes away while a game tab or settings is open, close it —
  // those panels no longer exist in encyclopedia-only mode.
  useEffect(() => {
    if (!configured && activeTab !== null && activeTab !== 'encyclopedia') setActiveTab(null)
  }, [configured, activeTab])

  // Reset to live view when the channel/endpoint changes
  useEffect(() => {
    setSelectedHistoryId(null)
  }, [config.endpointUrl])

  const effectiveConfig = selectedHistoryId
    ? { ...config, endpointUrl: `${config.endpointUrl}/${selectedHistoryId}` }
    : config

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

  const showSettings = activeTab === 'settings'
  const isWiki = activeTab === 'encyclopedia'
  const isGameTab = activeTab !== null && !isWiki && !showSettings
  // Chart tabs show players in their own legends, so the map/duration/players
  // block in the header is redundant there. (The refresh/history controls stay.)
  const isGraphView = isGameTab && isGraphTab(activeTab as TabKey)
  // Settings stays docked for a stable form position, but uses the live opacity
  // for its background so dragging the slider previews the effect instantly.
  const effLayout: OverlayLayout = showSettings ? 'docked' : layout
  const panelBg = `rgba(14,14,16,${opacity})`
  const panelPos: CSSProperties =
    effLayout === 'fullscreen'
      ? side === 'left'
        ? { top: 0, bottom: 0, left: RAIL_WIDTH, right: 0 }
        : { top: 0, bottom: 0, left: 0, right: RAIL_WIDTH }
      : effLayout === 'corner'
        ? {
            [side]: RAIL_WIDTH,
            bottom: 10,
            width: 'min(460px, 42vw)',
            maxHeight: 'min(62%, 480px)',
            borderTop: '1px solid #1e1e26',
            // Round the corner that faces the open stream.
            [side === 'left' ? 'borderTopRightRadius' : 'borderTopLeftRadius']: 8,
          }
        : { top: 0, bottom: 0, [side]: RAIL_WIDTH, width: 'min(460px, 42vw)' }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        // Click-through: only the rail and the open panel capture pointer events,
        // so the rest of the stream stays interactive.
        pointerEvents: 'none',
        fontSize: `${fontSize * fontScale}px`,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: '#efeff1',
      }}
    >
      {activeTab !== null && (
        <PanelOpacityProvider value={opacity}>
          <div
            style={{
              position: 'absolute',
              ...panelPos,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: panelBg,
              // Border on the edge that faces the open stream.
              [side === 'left' ? 'borderRight' : 'borderLeft']: '1px solid #1e1e26',
              pointerEvents: 'auto',
            }}
          >
            {/* Slim panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                padding: '10px 16px',
                borderBottom: '1px solid #1e1e26',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <img
                  src="./magicsentry.webp"
                  alt="Magic Sentry"
                  width={16}
                  height={16}
                  style={{ imageRendering: 'auto', flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: '.72em',
                    letterSpacing: '.1em',
                    color: '#c8a050',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                  }}
                >
                  {showSettings ? 'Settings' : isWiki ? 'Encyclopedia' : 'Magic Sentry'}
                </span>
              </div>

              {isGameTab && game && !isGraphView && (
                <>
                  <span style={{ color: '#2a2a3a' }}>·</span>
                  <span style={{ fontSize: '.78em', color: '#efeff1' }}>{game.map}</span>
                  <span style={{ fontSize: '.7em', color: '#6a6a6a', fontFamily: 'monospace' }}>
                    {formatDuration(game.duration_ms)}
                  </span>
                  <TeamsBar players={playerData} />
                </>
              )}

              {isGameTab && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {lastUpdated && !selectedHistoryId && (
                    <span style={{ fontSize: '.58em', color: '#555', fontFamily: 'monospace' }}>
                      updated {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  {!selectedHistoryId && (
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
                  <GameHistoryDropdown
                    channel={channel}
                    liveGame={effectiveConfig === config ? game : null}
                    history={history}
                    selectedHistoryId={selectedHistoryId}
                    onSelect={setSelectedHistoryId}
                  />
                </div>
              )}
            </div>

            {/* Panel body */}
            {showSettings && (
              <OverlaySettings
                opacity={opacity}
                layout={layout}
                side={side}
                fontScale={fontScale}
                onOpacity={setOpacity}
                onLayout={setLayout}
                onSide={setSide}
                onFontScale={setFontScale}
              />
            )}

            {isWiki && <EncyclopediaPanel iconSrc={twitchIconSrc} />}

            {isGameTab && !game && configReady && (
              <div style={{ padding: '20px 16px' }}>
                {!config.endpointUrl || !config.token ? (
                  <StatusDot ok={false} label="Incomplete setup — endpoint and token required" />
                ) : (
                  <NoGameScreen />
                )}
              </div>
            )}

            {isGameTab && game && (
              <IconSrcProvider value={twitchIconSrc}>
                <TabContent players={playerData} tab={activeTab} error={fetchError} />
              </IconSrcProvider>
            )}
          </div>
        </PanelOpacityProvider>
      )}

      <OverlayRail
        tabs={configured ? visibleTabs : []}
        activeKey={activeTab}
        onSelect={setActiveTab}
        open={railOpen}
        onToggleOpen={toggleRail}
        side={side}
        configured={configured}
      />
    </div>
  )
}
