import type { ItemEntry } from '@magic-sentry/wc3data'
import { CooldownIcon, RangeIcon } from './StatIcons'

/**
 * Renders an item's description + numeric detail inside a HoverTooltip, mirroring
 * AbilityTooltipBody. The caller renders the name + gold cost; this fills in the
 * tooltip body (category/level, description, cooldown/charges/range chips, then
 * duration/aoe and the stats list).
 */
export function ItemTooltipBody({ info }: { info: ItemEntry }) {
  const statLine = (label: string, value: string) => (
    <div style={{ fontFamily: 'monospace', fontSize: '.92em' }}>
      <span style={{ color: '#888' }}>{label} </span>
      <span style={{ color: '#efeff1' }}>{value}</span>
    </div>
  )

  const chip = (icon: React.ReactNode, value: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {icon}
      {value}
    </span>
  )

  const hasChips =
    info.cooldown !== undefined || info.charges !== undefined || info.range !== undefined

  return (
    <div style={{ marginTop: 3, whiteSpace: 'normal', maxWidth: 240 }}>
      {(info.category || info.level !== undefined) && (
        <div
          style={{
            color: '#6a6a6a',
            fontFamily: 'monospace',
            fontSize: '.82em',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            marginBottom: 4,
          }}
        >
          {[info.category, info.level !== undefined ? `Level ${info.level}` : null]
            .filter(Boolean)
            .join(' · ')}
        </div>
      )}
      {info.description && <div style={{ color: '#888', marginBottom: 5 }}>{info.description}</div>}
      {hasChips && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#efeff1',
            fontFamily: 'monospace',
            fontSize: '.92em',
          }}
        >
          {info.cooldown !== undefined && chip(<CooldownIcon />, `${info.cooldown}s`)}
          {info.charges !== undefined &&
            chip(null, `${info.charges} charge${info.charges === 1 ? '' : 's'}`)}
          {info.range !== undefined && chip(<RangeIcon />, String(info.range))}
        </div>
      )}
      {info.aoe && statLine('AoE', info.aoe.join('/'))}
      {info.duration !== undefined && statLine('Duration', `${info.duration}s`)}
      {info.stats?.map((s) => (
        <div key={s.label} style={{ fontFamily: 'monospace', fontSize: '.92em' }}>
          <span style={{ color: '#888' }}>{s.label} </span>
          <span style={{ color: '#efeff1' }}>{s.values.join(' / ')}</span>
        </div>
      ))}
    </div>
  )
}
