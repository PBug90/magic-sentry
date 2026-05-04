import { ChartPlayer } from '../../shared/types'
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
  SectionLabel,
  svgPath,
} from './shared'

interface ResourceSeries {
  mined: (s: import('../../shared/types').Sample) => number
  upkeep: (s: import('../../shared/types').Sample) => number
  netLabel: string
  minedLabel: string
  upkeepLabel: string
}

function ResourceChart({
  players,
  title,
  series,
  yStep,
  singleLine = false,
}: {
  players: ChartPlayer[]
  title: string
  series: ResourceSeries
  yStep: number
  singleLine?: boolean
}) {
  const { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave } = useChartHover()

  if (players.every((p) => p.samples.length === 0)) return null
  const maxTime = Math.max(...players.flatMap((p) => p.samples.map((s) => s.time_ms))) / 1000
  const rawMax = Math.max(...players.flatMap((p) => p.samples.map((s) => series.mined(s))), 1)
  const yMax = niceMax(rawMax, yStep)

  const xOf = (t: number) => (t / maxTime) * IW
  const yOf = (v: number) => IH - (v / yMax) * IH

  const yTicks: number[] = []
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v)

  const hoverSec = hover ? hover.fraction * maxTime : null

  return (
    <div
      ref={wrapRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}
    >
      <SectionLabel>{title}</SectionLabel>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={onSvgMouseMove}
        onMouseLeave={onSvgMouseLeave}
      >
        <g transform={`translate(${CM.left},${CM.top})`}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={0} y1={yOf(v)} x2={IW} y2={yOf(v)} stroke="#1e1e26" strokeWidth={1} />
              <text
                x={-6}
                y={yOf(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#46464f"
                fontFamily="monospace"
              >
                {v >= 1000 ? `${v / 1000}k` : v}
              </text>
            </g>
          ))}
          {timeTicks(maxTime).map((t) => (
            <text
              key={t}
              x={xOf(t)}
              y={IH + 16}
              textAnchor="middle"
              fontSize={9}
              fill="#46464f"
              fontFamily="monospace"
            >
              {Math.floor(t / 60)}m
            </text>
          ))}
          {players.map(({ color, samples }) => {
            const mp = samples.map(
              (s) => [xOf(s.time_ms / 1000), yOf(series.mined(s))] as [number, number],
            )
            const up = singleLine
              ? null
              : samples.map(
                  (s) => [xOf(s.time_ms / 1000), yOf(series.upkeep(s))] as [number, number],
                )
            const np = singleLine
              ? null
              : samples.map(
                  (s) =>
                    [
                      xOf(s.time_ms / 1000),
                      yOf(Math.max(0, series.mined(s) - series.upkeep(s))),
                    ] as [number, number],
                )
            return (
              <g key={color}>
                <path
                  d={svgPath(mp)}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                {up && (
                  <path
                    d={svgPath(up)}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    strokeDasharray="6 3"
                    strokeLinejoin="round"
                    opacity={0.7}
                  />
                )}
                {np && (
                  <path
                    d={svgPath(np)}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    strokeLinejoin="round"
                    opacity={0.85}
                  />
                )}
              </g>
            )
          })}
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
          {players.map((p) => {
            const s = nearestSample(p.samples, hoverSec)
            if (!s) return null
            const mined = series.mined(s)
            const upkeep = series.upkeep(s)
            return (
              <div key={p.name} style={{ marginBottom: 6 }}>
                <span
                  style={{ fontSize: '.62rem', color: p.color, display: 'block', marginBottom: 2 }}
                >
                  {p.name}
                </span>
                {(singleLine
                  ? ([[series.minedLabel, mined]] as [string, number][])
                  : ([
                      [series.minedLabel, mined],
                      [series.upkeepLabel, upkeep],
                      [series.netLabel, mined - upkeep],
                    ] as [string, number][])
                ).map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontFamily: 'monospace',
                      fontSize: '.58rem',
                    }}
                  >
                    <span style={{ color: '#46464f' }}>{label}</span>
                    <span style={{ color: '#efeff1' }}>{val.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </ChartTooltip>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 24px' }}>
        {players.map(({ name, color }) => (
          <span key={name} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: '.65rem', color: '#888', fontFamily: 'sans-serif' }}>
              {name}
            </span>
            {(singleLine
              ? [{ label: series.minedLabel, dash: undefined }]
              : [
                  { label: series.minedLabel, dash: undefined },
                  { label: series.upkeepLabel, dash: '6 3' },
                  { label: series.netLabel, dash: '2 2' },
                ]
            ).map(({ label, dash }) => (
              <span
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '.6rem',
                  color: '#555',
                }}
              >
                <svg width={16} height={2} style={{ flexShrink: 0 }}>
                  <line
                    x1={0}
                    y1={1}
                    x2={16}
                    y2={1}
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray={dash}
                  />
                </svg>
                {label}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}

export function EconomyChart({ players }: { players: ChartPlayer[] }) {
  const rawMax = Math.max(...players.flatMap((p) => p.samples.map((s) => s.gold_mined)), 1)
  const step = rawMax > 10000 ? 5000 : rawMax > 4000 ? 2000 : 1000
  return (
    <ResourceChart
      players={players}
      title="Economy — Gold"
      yStep={step}
      series={{
        mined: (s) => s.gold_mined,
        upkeep: (s) => s.gold_upkeep_lost,
        minedLabel: 'mined',
        upkeepLabel: 'upkeep',
        netLabel: 'net gold',
      }}
    />
  )
}

export function LumberChart({ players }: { players: ChartPlayer[] }) {
  const rawMax = Math.max(...players.flatMap((p) => p.samples.map((s) => s.lumber_mined)), 1)
  const step = rawMax > 5000 ? 2000 : rawMax > 2000 ? 1000 : 500
  return (
    <ResourceChart
      players={players}
      title="Economy — Lumber"
      yStep={step}
      singleLine
      series={{
        mined: (s) => s.lumber_mined,
        upkeep: () => 0,
        minedLabel: 'mined',
        upkeepLabel: '',
        netLabel: '',
      }}
    />
  )
}
