import { useIconSrc } from './context'

/**
 * The heading for one ability in a tooltip list: its icon followed by its name.
 * The icon makes it visually unambiguous which block of stats belongs to which
 * ability when a unit/hero has several. A missing icon collapses silently.
 */
export function AbilityHeading({ id, name }: { id: string; name: string }) {
  const iconSrc = useIconSrc()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <img
        src={iconSrc(`/abilities/${id}.webp`)}
        alt=""
        width={18}
        height={18}
        style={{
          display: 'block',
          flexShrink: 0,
          border: '1px solid #2a2a3a',
          imageRendering: 'pixelated',
        }}
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
        }}
      />
      <span style={{ color: '#efeff1' }}>{name}</span>
    </div>
  )
}
