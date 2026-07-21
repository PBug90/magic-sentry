import type { UpgradeEntry } from '@magic-sentry/wc3data'

/**
 * Tooltip body for an upgrade: description prose then its per-level numeric
 * effects (values joined as "lvl1 / lvl2 / lvl3"). Mirrors ItemTooltipBody but
 * upgrades carry no category/level/cooldown fields. The caller renders the
 * name + gold/lumber cost; this fills in the body. Returns null when there's
 * nothing extra to show (so un-enriched upgrades keep their plain tooltip).
 */
export function UpgradeTooltipBody({ info }: { info: UpgradeEntry }) {
  if (!info.description && !info.stats?.length) return null
  return (
    <div style={{ marginTop: 3, whiteSpace: 'normal', maxWidth: 240 }}>
      {info.description && (
        <div style={{ color: '#888', marginBottom: info.stats?.length ? 5 : 0 }}>
          {info.description}
        </div>
      )}
      {info.stats?.map((s) => (
        <div key={s.label} style={{ fontFamily: 'monospace', fontSize: '.92em' }}>
          <span style={{ color: '#888' }}>{s.label} </span>
          <span style={{ color: '#efeff1' }}>{s.values.join(' / ')}</span>
        </div>
      ))}
    </div>
  )
}
