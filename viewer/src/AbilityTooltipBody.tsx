import type { AbilityInfo } from '@magic-sentry/wc3data'
import { ManaIcon, CooldownIcon, RangeIcon } from './StatIcons'

function perLevel(arr: number[], level?: number): string {
  if (level && arr.length > 1) return String(arr[Math.min(level, arr.length) - 1])
  return arr.join('/')
}

function perLevelStr(arr: string[], level?: number): string {
  if (level && arr.length > 1) return arr[Math.min(level, arr.length) - 1]
  return arr.join('/')
}

/**
 * Renders an ability's description + numeric stats inside a HoverTooltip.
 * When `level` is given (live hero panel), per-level arrays show that level's
 * value; otherwise (encyclopedia) they show all levels slashed.
 */
export function AbilityTooltipBody({ info, level }: { info: AbilityInfo; level?: number }) {
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

  return (
    <div style={{ marginTop: 3, whiteSpace: 'normal', maxWidth: 240 }}>
      {info.description && <div style={{ color: '#888', marginBottom: 5 }}>{info.description}</div>}
      {(info.manaCost !== undefined || info.cooldown !== undefined || info.range !== undefined) && (
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
          {info.manaCost !== undefined && chip(<ManaIcon />, String(info.manaCost))}
          {info.cooldown !== undefined && chip(<CooldownIcon />, `${info.cooldown}s`)}
          {info.range !== undefined && chip(<RangeIcon />, String(info.range))}
        </div>
      )}
      {info.damage && statLine('Damage', perLevel(info.damage, level))}
      {info.aoe && statLine('AoE', perLevel(info.aoe, level))}
      {info.duration !== undefined && statLine('Duration', `${info.duration}s`)}
      {info.stats?.map((s) => (
        <div key={s.label} style={{ fontFamily: 'monospace', fontSize: '.92em' }}>
          <span style={{ color: '#888' }}>{s.label} </span>
          <span style={{ color: '#efeff1' }}>{perLevelStr(s.values, level)}</span>
        </div>
      ))}
    </div>
  )
}
