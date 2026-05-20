import { type CSSProperties, useState, useEffect } from 'react'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import { ViewerContent, TeamsBar, StatusDot, GameHistoryDropdown } from '@magic-sentry/viewer'
import type { ChartPlayer } from '../shared/types'
import { useMagicSentryGame } from './hooks/useMagicSentryGame'
import { useChannelHistory } from './hooks/useChannelHistory'

function webIconSrc(path: string): string {
  return (window as any).__ICON_MAP__?.[path] ?? path
}

const btnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#777',
  fontSize: '.85em',
  padding: '2px 4px',
  lineHeight: 1,
}

interface GameViewerProps {
  channel: string
  gameId: string
  onBack: () => void
  onLayoutCheck?: () => void
}

export function GameViewer({ channel, gameId, onBack, onLayoutCheck }: GameViewerProps) {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const history = useChannelHistory(channel)

  // Reset to live view whenever the live game changes
  useEffect(() => {
    setSelectedHistoryId(null)
  }, [gameId])

  const effectiveGameId = selectedHistoryId ?? gameId
  const { game, fetchError, lastUpdated, refresh } = useMagicSentryGame(channel, effectiveGameId)

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
            fontSize: '.7em',
            fontFamily: 'monospace',
            padding: '4px 10px',
          }}
        >
          ← Back
        </button>
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
        {game && (
          <>
            <span style={{ color: '#2a2a3a' }}>·</span>
            <span style={{ fontSize: '.8em', color: '#efeff1' }}>{game.map}</span>
            <span style={{ fontSize: '.72em', color: '#888', fontFamily: 'monospace' }}>
              {formatDuration(game.duration_ms)}
            </span>
            <TeamsBar players={playerData} />
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {lastUpdated && !selectedHistoryId && (
            <span style={{ fontSize: '.6em', color: '#777', fontFamily: 'monospace' }}>
              updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {onLayoutCheck && (
            <button onClick={onLayoutCheck} title="Extension preview" style={btnStyle}>
              ⊞
            </button>
          )}
          {!selectedHistoryId && (
            <button onClick={refresh} title="Refresh" style={btnStyle}>
              ↺
            </button>
          )}
          <GameHistoryDropdown
            channel={channel}
            liveGame={effectiveGameId === gameId ? game : null}
            history={history}
            selectedHistoryId={selectedHistoryId}
            onSelect={setSelectedHistoryId}
          />
        </div>
      </div>

      {/* Error / loading */}
      {!game && (
        <div style={{ padding: '20px 24px' }}>
          {fetchError ? (
            <StatusDot ok={false} label={`Error: ${fetchError}`} />
          ) : (
            <StatusDot ok={true} label="Loading…" />
          )}
        </div>
      )}

      {game && <ViewerContent players={playerData} iconSrc={webIconSrc} error={fetchError} />}
    </div>
  )
}
