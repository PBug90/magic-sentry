import type { CSSProperties } from 'react'
import { UNIT_NAME_BY_ID, UPGRADE_NAME_BY_ID } from '@magic-sentry/wc3data'
import type { TimelineEvent } from '@magic-sentry/shared'

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Pill (rather than plain grey text) so the research level reads against the
// dark row background.
const levelPill: CSSProperties = {
  marginLeft: 6,
  padding: '0 5px',
  borderRadius: 3,
  fontSize: '.85em',
  color: '#c8a050',
  background: 'rgba(200,160,80,0.14)',
  border: '1px solid rgba(200,160,80,0.35)',
  whiteSpace: 'nowrap',
}

/** Construction outcome for structure events; time_ms is the start of construction. */
function StatusBadge({ event }: { event: TimelineEvent }) {
  if (!event.status) return null
  if (event.status === 'completed') {
    return (
      <span style={{ color: '#3fb950' }}>
        ✓ {event.resolved_ms !== undefined ? formatTime(event.resolved_ms) : ''}
      </span>
    )
  }
  if (event.status === 'canceled') {
    return (
      <span style={{ color: '#f85149' }}>
        ✗ canceled {event.resolved_ms !== undefined ? formatTime(event.resolved_ms) : ''}
      </span>
    )
  }
  return <span style={{ color: '#888' }}>… building</span>
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
              <span style={{ color: '#d29922' }}>
                Expansion — {UNIT_NAME_BY_ID[e.id] ?? e.id} <StatusBadge event={e} />
              </span>
            ) : e.type === 'tier_upgrade' ? (
              <span style={{ color: '#7ca3d0' }}>
                {UNIT_NAME_BY_ID[e.id] ?? e.id} <StatusBadge event={e} />
              </span>
            ) : (
              <span style={{ color: '#ccc' }}>
                {UPGRADE_NAME_BY_ID[e.id] ?? e.id}
                <span style={levelPill}>Level {e.level}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
