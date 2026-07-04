import { useState } from 'react'
import type { GameRecord, ChartPlayer } from '../shared/types'
import { PLAYER_COLORS, formatDuration } from '@magic-sentry/shared'
import { ViewerContent, TeamsBar, isGraphTab } from '@magic-sentry/viewer'
import type { TabKey } from '@magic-sentry/viewer'

function webIconSrc(path: string): string {
  return (window as any).__ICON_MAP__?.[path] ?? path
}

export function StandaloneViewer({ game }: { game: GameRecord }) {
  const players: ChartPlayer[] = game.players.map((p, i) => ({
    ...p,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
  }))
  const [tab, setTab] = useState<TabKey>('heroes')

  return (
    <div
      style={{
        fontSize: '22px',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* The chart tabs show players in their own legends, so the info header is
          hidden on them and kept for Heroes/Items/Timings/Fights. */}
      {!isGraphTab(tab) && (
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
      )}

      <ViewerContent players={players} iconSrc={webIconSrc} onTabChange={setTab} />
    </div>
  )
}
