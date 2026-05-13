import { useState } from 'react'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import { ViewerContent, TeamsBar } from '@magic-sentry/viewer'
import type { ChartPlayer } from './shared/types'
import { useMagicSentryGame } from './viewer/hooks/useMagicSentryGame'

function webIconSrc(path: string): string {
  return (window as any).__ICON_MAP__?.[path] ?? path
}

const MIN_W = 300
const MAX_W = 1000
const DEFAULT_W = 640
const DEFAULT_H = 560

function extFontSize(width: number): number {
  return Math.max(10, Math.min(22, 8800 / width))
}

interface Props {
  channel: string
  gameId: string
  onBack: () => void
}

export function LayoutChecker({ channel, gameId, onBack }: Props) {
  const { game, fetchError, lastUpdated, refresh } = useMagicSentryGame(channel, gameId)
  const [width, setWidth] = useState(DEFAULT_W)
  const [height, setHeight] = useState(DEFAULT_H)

  const playerData: ChartPlayer[] = (game?.players ?? []).map((p, i) => ({
    ...p,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }))

  const fontSize = extFontSize(width)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07070f',
        padding: 24,
        fontFamily: 'monospace',
        color: '#efeff1',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid #2a2a3a',
            borderRadius: 3,
            color: '#888',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            padding: '4px 10px',
          }}
        >
          ← Back
        </button>

        <span
          style={{
            fontSize: '0.7rem',
            color: '#555',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
          }}
        >
          Extension Preview
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.7rem', color: '#777' }}>W</label>
          <input
            type="range"
            min={MIN_W}
            max={MAX_W}
            value={width}
            onChange={(e) => setWidth(+e.target.value)}
            style={{ width: 160 }}
          />
          <span style={{ fontSize: '0.7rem', color: '#c8a050', minWidth: 48 }}>{width}px</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.7rem', color: '#777' }}>H</label>
          <input
            type="range"
            min={300}
            max={900}
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
            style={{ width: 120 }}
          />
          <span style={{ fontSize: '0.7rem', color: '#c8a050', minWidth: 48 }}>{height}px</span>
        </div>

        <span style={{ fontSize: '0.7rem', color: '#555' }}>
          font <span style={{ color: '#c8a050' }}>{fontSize.toFixed(1)}px</span>
        </span>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.65rem', color: '#444' }}>
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
              fontSize: '1rem',
            }}
          >
            ↺
          </button>
        </div>
      </div>

      {/* Extension frame */}
      <div
        style={{
          width,
          height,
          border: '1px solid #2a2a3a',
          background: '#0e0e10',
          color: '#efeff1',
          display: 'flex',
          flexDirection: 'column',
          fontSize: `${fontSize}px`,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          overflow: 'hidden',
          boxShadow: '0 0 0 1px #1e1e26',
        }}
      >
        {/* Extension top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            padding: '12px 24px',
            borderBottom: '1px solid #1e1e26',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <img
              src="/magicsentry.webp"
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
          {!game && (
            <span style={{ fontSize: '.65em', color: '#555', fontFamily: 'monospace' }}>
              {fetchError ? `Error: ${fetchError}` : 'Loading…'}
            </span>
          )}
        </div>

        {/* Viewer content — scrollable, fills remaining height */}
        {game && <ViewerContent players={playerData} iconSrc={webIconSrc} error={null} />}
      </div>

      {/* Width ruler */}
      <div
        style={{
          width,
          marginTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.6rem',
          color: '#333',
          fontFamily: 'monospace',
        }}
      >
        <span>0</span>
        <span>{Math.round(width / 2)}</span>
        <span>{width}px</span>
      </div>
    </div>
  )
}
