import type { AbilityInfo, HeroStats } from '@magic-sentry/wc3data'
import { ABILITY_BY_ID } from '@magic-sentry/wc3data'
import { AbilityTooltipBody } from './AbilityTooltipBody'
import { AbilityHeading } from './AbilityHeading'

/** Tooltip body for a hero: attribute line + base armor/damage, then its abilities. */
export function HeroTooltipBody({
  stats,
  abilities,
}: {
  stats?: HeroStats
  abilities: { id: string; info: AbilityInfo }[]
}) {
  const attrs: { label: string; val?: number; gain?: number }[] = [
    { label: 'Str', val: stats?.str, gain: stats?.strGain },
    { label: 'Agi', val: stats?.agi, gain: stats?.agiGain },
    { label: 'Int', val: stats?.int, gain: stats?.intGain },
  ].filter((a) => a.val !== undefined)
  const line2: string[] = []
  if (stats?.armor !== undefined) line2.push(`Armor ${stats.armor} (Hero)`)
  if (stats?.damageMin !== undefined)
    line2.push(`Damage ${stats.damageMin}–${stats.damageMax} (Hero)`)
  if (stats?.attackRange) line2.push(`Range ${stats.attackRange}`)
  return (
    <div style={{ marginTop: 3 }}>
      {attrs.length > 0 && (
        <div style={{ fontFamily: 'monospace', fontSize: '.92em', color: '#efeff1' }}>
          {attrs.map((a) => (
            <span key={a.label} style={{ marginRight: 8 }}>
              <span
                style={{ color: stats?.primaryAttribute?.startsWith(a.label) ? '#c8a050' : '#888' }}
              >
                {a.label}{' '}
              </span>
              {a.val}
              {a.gain !== undefined && <span style={{ color: '#888' }}> (+{a.gain})</span>}
            </span>
          ))}
        </div>
      )}
      {line2.length > 0 && (
        <div style={{ fontFamily: 'monospace', fontSize: '.92em', color: '#efeff1' }}>
          {line2.join(' · ')}
        </div>
      )}
      {abilities.length > 0 && (
        <div
          style={{
            marginTop: 6,
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
          <AbilityHeading id={id} name={ABILITY_BY_ID[id]?.name ?? info.name ?? id} />
          <AbilityTooltipBody info={info} />
        </div>
      ))}
    </div>
  )
}
