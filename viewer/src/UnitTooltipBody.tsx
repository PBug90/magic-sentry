import type { AbilityInfo, UnitStats } from '@magic-sentry/wc3data'
import { AbilityTooltipBody } from './AbilityTooltipBody'
import { AbilityHeading } from './AbilityHeading'
import { UnitStatsLine } from './UnitStatsLine'

/**
 * Tooltip body for a unit: combat stats, its lore blurb, then each of its
 * abilities (name + structured numbers). Used by the encyclopedia.
 */
export function UnitTooltipBody({
  stats,
  effect,
  abilities,
}: {
  stats?: UnitStats
  effect?: string
  abilities: { id: string; info: AbilityInfo }[]
}) {
  return (
    <div style={{ marginTop: 3 }}>
      {stats && <UnitStatsLine stats={stats} />}
      {effect && <div style={{ color: '#888', whiteSpace: 'normal', maxWidth: 240 }}>{effect}</div>}
      {abilities.length > 0 && (
        <div
          style={{
            marginTop: effect ? 6 : 0,
            paddingTop: 4,
            borderTop: '1px solid #2a2a3a',
            color: '#6a6a6a',
            fontFamily: 'monospace',
            fontSize: '.7em',
            letterSpacing: '.05em',
          }}
        >
          Abilities
        </div>
      )}
      {abilities.map(({ id, info }, i) => (
        <div
          key={id}
          style={
            i === 0
              ? { marginTop: 4 }
              : { marginTop: 7, paddingTop: 7, borderTop: '1px solid #2a2a3a' }
          }
        >
          <AbilityHeading id={id} name={info.name ?? id} />
          <AbilityTooltipBody info={info} />
        </div>
      ))}
    </div>
  )
}
