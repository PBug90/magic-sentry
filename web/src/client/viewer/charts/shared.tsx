import { useState, useRef } from 'react'
import { HERO_OBSERVER, UNIT_ICON_ID } from '../../shared/wc3data'
import { heroSupply, fmtTime, UNIT_COLORS } from '../../shared/chartUtils'

export const CM = { top: 16, right: 16, bottom: 28, left: 52 }
export const W = 640
export const H = 200
export const IW = W - CM.left - CM.right
export const IH = H - CM.top - CM.bottom
export const CH = 280
export const CIH = CH - CM.top - CM.bottom

export interface HoverState {
  fraction: number
  sx: number
  sy: number
  wrapW: number
}

export function useChartHover() {
  const [hover, setHover] = useState<HoverState | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  function onSvgMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svgRect = e.currentTarget.getBoundingClientRect()
    const wrapRect = wrapRef.current!.getBoundingClientRect()
    const svgX = (e.clientX - svgRect.left) * (W / svgRect.width)
    const innerX = svgX - CM.left
    const fraction = Math.max(0, Math.min(1, innerX / IW))
    setHover({
      fraction,
      sx: e.clientX - wrapRect.left,
      sy: e.clientY - wrapRect.top,
      wrapW: wrapRect.width,
    })
  }

  return { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave: () => setHover(null) }
}

export function ChartTooltip({
  hover,
  minWidth = 130,
  children,
}: {
  hover: HoverState
  minWidth?: number
  children: React.ReactNode
}) {
  const toLeft = hover.sx > hover.wrapW * 0.58
  return (
    <div
      style={{
        position: 'absolute',
        left: toLeft ? hover.sx - 8 : hover.sx + 12,
        top: hover.sy,
        transform: toLeft ? 'translate(-100%, -50%)' : 'translateY(-50%)',
        background: '#1a1a23',
        border: '1px solid #3a3a4a',
        padding: '7px 10px',
        pointerEvents: 'none',
        zIndex: 10,
        minWidth,
        maxWidth: 260,
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  )
}

export function TooltipTime({ sec }: { sec: number }) {
  return (
    <div
      style={{
        fontSize: '.58rem',
        marginBottom: 5,
        letterSpacing: '.05em',
        color: '#555',
        fontFamily: 'monospace',
      }}
    >
      {fmtTime(sec)}
    </div>
  )
}

export function UnitIcon({ name, fill, size = 22 }: { name: string; fill: string; size?: number }) {
  const hero = HERO_OBSERVER[name]
  const unitId = UNIT_ICON_ID[name]
  const src = hero ? `/heroes/${hero.icon}.png` : unitId ? `/units/${unitId}.png` : null
  return (
    <div
      title={hero?.display ?? name}
      style={{
        width: size,
        height: size,
        background: fill,
        opacity: 0.9,
        flexShrink: 0,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
      }}
    >
      {src && (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      )}
    </div>
  )
}

export function UnitIconRow({ fill, name, count }: { fill: string; name: string; count: number }) {
  const sup = heroSupply(name)
  const displayName = HERO_OBSERVER[name]?.display ?? name
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
      <UnitIcon name={name} fill={fill} size={14} />
      <span style={{ fontSize: '.6rem', color: '#8b8b99', fontFamily: 'sans-serif', flex: 1 }}>
        {displayName}
      </span>
      <span style={{ fontSize: '.6rem', fontFamily: 'monospace', color: '#efeff1' }}>×{count}</span>
      <span style={{ fontSize: '.55rem', fontFamily: 'monospace', color: '#555' }}>
        {count * sup}f
      </span>
    </div>
  )
}

export function buildSharedColorMap(names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((name, i) => [name, UNIT_COLORS[i % UNIT_COLORS.length]]))
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: '.62rem',
        letterSpacing: '.12em',
        color: '#555',
        fontFamily: 'monospace',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  )
}

export const svgPath = (pts: Array<[number, number]>) =>
  pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
