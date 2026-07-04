import { ChartPlayer, type Sample } from '@magic-sentry/shared'
import { nearestSample, niceMax, timeTicks } from '@magic-sentry/shared'
import {
  CM,
  W,
  H,
  IW,
  IH,
  useChartHover,
  ChartTooltip,
  TooltipTime,
} from './shared'

export interface DiffMetric {
  label: string
  value: (s: Sample) => number
  color: string
  dash?: string
}

/** Small pill that flips a chart between per-player lines and the diff view. */
export function DiffToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      title="Difference view — one centred line showing the lead between the two players"
      style={{
        fontFamily: 'monospace',
        fontSize: '.5em',
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        padding: '3px 9px',
        cursor: 'pointer',
        background: on ? 'rgba(200,160,80,0.15)' : 'none',
        border: '1px solid ' + (on ? '#c8a050' : '#2a2a3a'),
        borderRadius: 3,
        color: on ? '#c8a050' : '#888',
        flexShrink: 0,
      }}
    >
      Difference
    </button>
  )
}

// p1 − p2 for `value`, sampled at every timestamp either player reported and
// aligned with nearestSample so differing poll cadences still line up.
function diffPoints(p1: ChartPlayer, p2: ChartPlayer, value: (s: Sample) => number) {
  const times = [...new Set([...p1.samples, ...p2.samples].map((s) => s.time_ms))].sort(
    (a, b) => a - b,
  )
  return times.map((ms) => {
    const t = ms / 1000
    const a = nearestSample(p1.samples, t)
    const b = nearestSample(p2.samples, t)
    return { t, d: (a ? value(a) : 0) - (b ? value(b) : 0) }
  })
}

// Splits the diff polyline into single-segment paths coloured by which side of
// the zero axis they sit on — above favours p1 (upColor), below favours p2
// (downColor) — interpolating the exact crossing point where the sign flips.
function coloredSegments(
  pts: { t: number; d: number }[],
  xOf: (t: number) => number,
  yOf: (d: number) => number,
  upColor: string,
  downColor: string,
): { d: string; color: string }[] {
  const L = (x1: number, y1: number, x2: number, y2: number) =>
    `M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}`
  const segs: { d: string; color: string }[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const ax = xOf(a.t)
    const ay = yOf(a.d)
    const bx = xOf(b.t)
    const by = yOf(b.d)
    const aUp = a.d >= 0
    const bUp = b.d >= 0
    if (aUp === bUp) {
      segs.push({ d: L(ax, ay, bx, by), color: aUp ? upColor : downColor })
    } else {
      const frac = a.d / (a.d - b.d) // point where the line meets d = 0
      const cx = ax + (bx - ax) * frac
      const cy = yOf(0)
      segs.push({ d: L(ax, ay, cx, cy), color: aUp ? upColor : downColor })
      segs.push({ d: L(cx, cy, bx, by), color: bUp ? upColor : downColor })
    }
  }
  return segs
}

// A "nice" tick step giving ~2 gridlines on each side of the zero axis.
function chooseStep(maxAbs: number): number {
  const target = maxAbs / 2 || 1
  const pow = Math.pow(10, Math.floor(Math.log10(target)))
  const candidates = [1, 2, 2.5, 5, 10].map((c) => c * pow)
  return candidates.find((c) => c >= target) ?? candidates[candidates.length - 1]
}

/**
 * Difference view shared by the line charts: for each metric, draws a single
 * line of (p1 − p2) against a zero axis in the vertical centre. Above the axis
 * favours p1, below favours p2 (halves are tinted in each player's colour).
 */
export function CenteredDiffPlot({
  p1,
  p2,
  metrics,
}: {
  p1: ChartPlayer
  p2: ChartPlayer
  metrics: DiffMetric[]
}) {
  const { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave } = useChartHover()

  const maxTime = Math.max(...[...p1.samples, ...p2.samples].map((s) => s.time_ms)) / 1000
  const series = metrics.map((m) => ({ m, pts: diffPoints(p1, p2, m.value) }))
  const maxAbs = Math.max(...series.flatMap(({ pts }) => pts.map(({ d }) => Math.abs(d))), 1)
  const step = chooseStep(maxAbs)
  const yMax = niceMax(maxAbs, step)

  const center = IH / 2
  const xOf = (t: number) => (t / maxTime) * IW
  const yOf = (d: number) => center - (d / yMax) * center

  const yTicks: number[] = []
  for (let v = step; v <= yMax; v += step) yTicks.push(v)

  const fmt = (v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v))
  const hoverSec = hover ? hover.fraction * maxTime : null

  return (
    <div
      ref={wrapRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={onSvgMouseMove}
        onMouseLeave={onSvgMouseLeave}
      >
        <g transform={`translate(${CM.left},${CM.top})`}>
          {/* Favour tint: top half leans p1, bottom half leans p2. */}
          <rect x={0} y={0} width={IW} height={center} fill={p1.color} opacity={0.05} />
          <rect x={0} y={center} width={IW} height={center} fill={p2.color} opacity={0.05} />
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={0} y1={yOf(v)} x2={IW} y2={yOf(v)} stroke="#1e1e26" strokeWidth={1} />
              <line x1={0} y1={yOf(-v)} x2={IW} y2={yOf(-v)} stroke="#1e1e26" strokeWidth={1} />
              <text
                x={-6}
                y={yOf(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#585863"
                fontFamily="monospace"
              >
                {fmt(v)}
              </text>
              <text
                x={-6}
                y={yOf(-v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#585863"
                fontFamily="monospace"
              >
                {fmt(v)}
              </text>
            </g>
          ))}
          <line
            x1={0}
            y1={center}
            x2={IW}
            y2={center}
            stroke="rgba(200,160,80,0.35)"
            strokeWidth={1}
          />
          <text
            x={4}
            y={6}
            fontSize={9}
            fill={p1.color}
            fontFamily="monospace"
            dominantBaseline="hanging"
          >
            {p1.name}
          </text>
          <text
            x={4}
            y={IH - 6}
            fontSize={9}
            fill={p2.color}
            fontFamily="monospace"
            dominantBaseline="auto"
          >
            {p2.name}
          </text>
          {timeTicks(maxTime).map((t) => (
            <text
              key={t}
              x={xOf(t)}
              y={IH + 16}
              textAnchor="middle"
              fontSize={9}
              fill="#585863"
              fontFamily="monospace"
            >
              {Math.floor(t / 60)}m
            </text>
          ))}
          {series.flatMap(({ m, pts }) =>
            coloredSegments(pts, xOf, yOf, p1.color, p2.color).map((seg, i) => (
              <path
                key={`${m.label}-${i}`}
                d={seg.d}
                fill="none"
                stroke={seg.color}
                strokeWidth={1.5}
                strokeDasharray={m.dash}
                strokeLinecap="round"
              />
            )),
          )}
          {hover && (
            <line
              x1={hover.fraction * IW}
              y1={0}
              x2={hover.fraction * IW}
              y2={IH}
              stroke="rgba(200,160,80,0.4)"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}
          <rect x={0} y={0} width={IW} height={IH} fill="transparent" />
        </g>
      </svg>

      {hover && hoverSec !== null && (
        <ChartTooltip hover={hover}>
          <TooltipTime sec={hoverSec} />
          {metrics.map((m) => {
            const a = nearestSample(p1.samples, hoverSec)
            const b = nearestSample(p2.samples, hoverSec)
            const d = (a ? m.value(a) : 0) - (b ? m.value(b) : 0)
            const leader = d > 0 ? p1 : d < 0 ? p2 : null
            return (
              <div
                key={m.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  fontFamily: 'monospace',
                  fontSize: '.8em',
                }}
              >
                <span style={{ color: '#7a7a88' }}>{m.label}</span>
                <span style={{ color: leader ? leader.color : '#efeff1' }}>
                  {leader ? `${leader.name} +${Math.abs(d).toLocaleString()}` : 'even'}
                </span>
              </div>
            )
          })}
        </ChartTooltip>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 16px' }}>
        {metrics.length > 1 &&
          metrics.map((m) => (
            <span
              key={m.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '.6em',
                color: '#888',
              }}
            >
              <svg width={16} height={2} style={{ flexShrink: 0 }}>
                <line x1={0} y1={1} x2={16} y2={1} stroke="#888" strokeWidth={2} strokeDasharray={m.dash} />
              </svg>
              {m.label}
            </span>
          ))}
        <span style={{ fontSize: '.6em', color: '#6a6a6a' }}>
          ↑ <span style={{ color: p1.color }}>{p1.name}</span> ahead · ↓{' '}
          <span style={{ color: p2.color }}>{p2.name}</span> ahead
        </span>
      </div>
    </div>
  )
}
