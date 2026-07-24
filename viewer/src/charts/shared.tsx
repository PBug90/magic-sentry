import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HERO_OBSERVER_IDS } from '@magic-sentry/wc3data'
import {
  UNIT_NAME_BY_ID,
  UNIT_EFFECT_BY_ID,
  UNIT_GOLD_BY_ID,
  UNIT_LUMBER_BY_ID,
  UNIT_ICON_BY_ID,
  UNIT_STATS_BY_ID,
  UNIT_ABILITY_BY_ID,
  HERO_STATS_BY_ID,
  ABILITY_BY_ID,
} from '@magic-sentry/wc3data'
import { heroSupply, fmtTime, UNIT_COLORS } from '@magic-sentry/shared'
import { HoverTooltip } from '../HoverTooltip'
import { UnitTooltipBody } from '../UnitTooltipBody'
import { HeroTooltipBody } from '../HeroTooltipBody'
import { useIconSrc } from '../context'

// Resolve a unit/hero's ability ids to the records the tooltip bodies expect,
// mirroring EncyclopediaPanel.unitAbilities.
function unitAbilities(id: string) {
  return (UNIT_ABILITY_BY_ID[id] ?? []).flatMap((aid) => {
    const info = ABILITY_BY_ID[aid]
    return info ? [{ id: aid, info }] : []
  })
}

export const CM = { top: 16, right: 16, bottom: 28, left: 52 }
export const W = 640
export const H = 200
export const IW = W - CM.left - CM.right
export const IH = H - CM.top - CM.bottom
export const CH = 200
export const CIH = CH - CM.top - CM.bottom

export interface HoverState {
  fraction: number
  sx: number
  sy: number
  vx: number
  vy: number
  wrapW: number
  baseFontSize: number
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
      vx: e.clientX,
      vy: e.clientY,
      wrapW: wrapRect.width,
      baseFontSize: parseFloat(getComputedStyle(wrapRef.current!).fontSize),
    })
  }

  return { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave: () => setHover(null) }
}

const TIP_MAX_W = 260

export function ChartTooltip({
  hover,
  minWidth = 130,
  children,
}: {
  hover: HoverState
  minWidth?: number
  children: React.ReactNode
}) {
  // Show right of the cursor unless the tooltip could clip the viewport's
  // right edge; then flip left. Viewport-based (not chart-based) so it works
  // wherever the panel is docked and in the full-width web viewer.
  const toLeft = hover.vx + 12 + TIP_MAX_W > window.innerWidth
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: toLeft ? hover.vx - 8 : hover.vx + 12,
        top: hover.vy,
        transform: toLeft ? 'translate(-100%, -50%)' : 'translateY(-50%)',
        background: '#1a1a23',
        border: '1px solid #3a3a4a',
        padding: '.32em .45em',
        pointerEvents: 'none',
        zIndex: 9999,
        minWidth,
        maxWidth: TIP_MAX_W,
        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
        borderRadius: 4,
        fontSize: `${hover.baseFontSize}px`,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {children}
    </div>,
    document.body,
  )
}

export function TooltipTime({ sec }: { sec: number }) {
  return (
    <div
      style={{
        fontSize: '.82em',
        marginBottom: 5,
        letterSpacing: '.05em',
        color: '#888',
        fontFamily: 'monospace',
      }}
    >
      {fmtTime(sec)}
    </div>
  )
}

export function UnitIcon({ name, fill, size = 1 }: { name: string; fill: string; size?: number }) {
  const [hovered, setHovered] = useState(false)
  const iconSrc = useIconSrc()
  const isHero = HERO_OBSERVER_IDS.has(name)
  const iconId = UNIT_ICON_BY_ID[name] ?? name
  const src = isHero ? iconSrc(`/heroes/${iconId}.webp`) : iconSrc(`/units/${iconId}.webp`)
  const displayName = UNIT_NAME_BY_ID[name] ?? name
  const gold = !isHero ? UNIT_GOLD_BY_ID[name] : undefined
  const lumber = !isHero ? UNIT_LUMBER_BY_ID[name] : undefined
  const effect = UNIT_EFFECT_BY_ID[name]
  return (
    <div
      style={{
        width: `${size}em`,
        height: `${size}em`,
        background: fill,
        opacity: 0.9,
        flexShrink: 0,
        borderRadius: 3,
        overflow: 'visible',
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: 3, overflow: 'hidden' }}>
        {src && (
          <img
            src={src}
            alt={name}
            style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
      </div>
      {hovered && (
        <HoverTooltip>
          <div style={{ color: '#efeff1' }}>{displayName}</div>
          {isHero ? (
            <HeroTooltipBody stats={HERO_STATS_BY_ID[name]} abilities={unitAbilities(name)} />
          ) : (
            <>
              {gold || lumber ? (
                <div style={{ display: 'flex', gap: 10, fontFamily: 'monospace' }}>
                  {gold ? <span style={{ color: '#c8a050' }}>{gold}g</span> : null}
                  {lumber ? <span style={{ color: '#7dbf7d' }}>{lumber}w</span> : null}
                </div>
              ) : null}
              <UnitTooltipBody
                stats={UNIT_STATS_BY_ID[name]}
                effect={effect}
                abilities={unitAbilities(name)}
              />
            </>
          )}
        </HoverTooltip>
      )}
    </div>
  )
}

export function UnitIconRow({ fill, name, count }: { fill: string; name: string; count: number }) {
  const sup = heroSupply(name)
  const displayName = UNIT_NAME_BY_ID[name] ?? name
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
      <UnitIcon name={name} fill={fill} size={0.85} />
      <span style={{ fontSize: '.75em', color: '#8b8b99', fontFamily: 'sans-serif', flex: 1 }}>
        {displayName}
      </span>
      <span style={{ fontSize: '.75em', fontFamily: 'monospace', color: '#efeff1' }}>×{count}</span>
      <span style={{ fontSize: '.68em', fontFamily: 'monospace', color: '#6a6a6a' }}>
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
        fontSize: '.62em',
        letterSpacing: '.12em',
        color: '#888',
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
