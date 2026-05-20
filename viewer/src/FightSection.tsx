import { useState } from 'react'
import type { Fight } from '@magic-sentry/shared'
import { FightCard, ExpandedPanel } from './FightCard'

export function FightSection({ fights }: { fights: Fight[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  if (fights.length === 0) return null

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
        ⚔ {fights.length} {fights.length === 1 ? 'Fight' : 'Fights'}
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {fights.map((fight, i) => (
          <FightCard
            key={fight.startMs}
            fight={fight}
            isExpanded={expanded === i}
            onToggle={() => setExpanded(expanded === i ? null : i)}
          />
        ))}
      </div>
      {expanded !== null && <ExpandedPanel fight={fights[expanded]} />}
    </div>
  )
}
