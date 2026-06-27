import type { UnitStats } from '@magic-sentry/wc3data'

/** One-to-two compact lines of unit combat stats for a hover tooltip. */
export function UnitStatsLine({ stats }: { stats: UnitStats }) {
  const top: string[] = []
  if (stats.hp !== undefined) top.push(`HP ${stats.hp}`)
  if (stats.armor !== undefined)
    top.push(`Armor ${stats.armor}${stats.armorType ? ` (${stats.armorType})` : ''}`)
  const dmg =
    stats.damageMin !== undefined
      ? `Damage ${stats.damageMin}–${stats.damageMax}${stats.damageType ? ` (${stats.damageType})` : ''}`
      : ''
  if (top.length === 0 && !dmg) return null
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '.92em', color: '#efeff1' }}>
      {top.length > 0 && <div>{top.join(' · ')}</div>}
      {dmg && <div>{dmg}</div>}
    </div>
  )
}
