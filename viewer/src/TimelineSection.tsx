import { UNIT_NAME_BY_ID, UPGRADE_NAME_BY_ID } from '@magic-sentry/shared'
import type { TimelineEvent } from '@magic-sentry/shared'

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function TimelineSection({
  events,
  playerColors,
}: {
  events: TimelineEvent[]
  playerColors: Record<string, string>
}) {
  if (events.length === 0) return null

  return (
    <div>
      <div
        style={{
          fontSize: '.62em',
          fontFamily: 'monospace',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: '#666',
          marginBottom: 12,
        }}
      >
        Timeline
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {events.map((e, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'baseline',
              fontSize: '.7em',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: '#555', minWidth: 38 }}>{formatTime(e.time_ms)}</span>
            <span style={{ color: playerColors[e.player] ?? '#888', minWidth: 80 }}>
              {e.player}
            </span>
            {e.type === 'expansion' ? (
              <span style={{ color: '#d29922' }}>Expansion — {UNIT_NAME_BY_ID[e.id] ?? e.id}</span>
            ) : e.type === 'tier_upgrade' ? (
              <span style={{ color: '#7ca3d0' }}>{UNIT_NAME_BY_ID[e.id] ?? e.id}</span>
            ) : (
              <span style={{ color: '#ccc' }}>
                {UPGRADE_NAME_BY_ID[e.id] ?? e.id}
                <span style={{ color: '#555', marginLeft: 6 }}>level {e.level}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
