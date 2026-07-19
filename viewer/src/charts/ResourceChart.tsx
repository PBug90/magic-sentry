import { useState } from 'react'
import { ChartPlayer, type Sample } from '@magic-sentry/shared'
import { useSurfaceBg } from '../context'
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
import { CenteredDiffPlot, DiffToggle } from './CenteredDiffPlot'

interface ResourceSeries {
  mined: (s: Sample) => number
  upkeep: (s: Sample) => number
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
  diffLabel,
}: {
  players: ChartPlayer[]
  title: string
  series: ResourceSeries
  yStep: number
  singleLine?: boolean
  diffLabel?: string
}) {
  const { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave } = useChartHover()
  const [diff, setDiff] = useState(false)

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
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
      >
        <SectionLabel>{title}</SectionLabel>
        {players.length === 2 && <DiffToggle on={diff} onChange={setDiff} />}
      </div>
      {diff && players.length === 2 ? (
        <CenteredDiffPlot
          p1={players[0]}
          p2={players[1]}
          metrics={[{ label: diffLabel ?? title, value: series.mined, color: '#c8a050' }]}
        />
      ) : (
        <>
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
                    fill="#7a7a88"
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
                  fill="#7a7a88"
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
                      style={{
                        fontSize: '.85em',
                        color: p.color,
                        display: 'block',
                        marginBottom: 2,
                      }}
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
                          fontSize: '.8em',
                        }}
                      >
                        <span style={{ color: '#7a7a88' }}>{label}</span>
                        <span style={{ color: '#efeff1' }}>{val.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </ChartTooltip>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 24px' }}>
            {players.map(({ name, color }) => (
              <span key={name} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '.65em', color: '#888', fontFamily: 'sans-serif' }}>
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
                      fontSize: '.6em',
                      color: '#888',
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
        </>
      )}
    </div>
  )
}

export function EconomyChart({ players }: { players: ChartPlayer[] }) {
  const surfaceBg = useSurfaceBg()
  const rawMax = Math.max(...players.flatMap((p) => p.samples.map((s) => s.gold_mined)), 1)
  const step = rawMax > 10000 ? 5000 : rawMax > 4000 ? 2000 : 1000

  const summaries = players
    .map((p) => {
      const s = p.samples[p.samples.length - 1]
      if (!s) return null
      const net = s.gold_mined - s.gold_upkeep_lost
      return { player: p, mined: s.gold_mined, upkeep: s.gold_upkeep_lost, net }
    })
    .filter(Boolean) as { player: ChartPlayer; mined: number; upkeep: number; net: number }[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {summaries.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {summaries.map(({ player, mined, upkeep, net }) => (
            <div
              key={player.name}
              style={{
                flex: 1,
                minWidth: 160,
                padding: '10px 14px',
                background: surfaceBg('#12121a'),
                border: '1px solid #2a2a3a',
                borderTop: `3px solid ${player.color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: '.62em',
                  color: player.color,
                  fontFamily: 'monospace',
                  letterSpacing: '.06em',
                }}
              >
                {player.name}
              </span>
              {(
                [
                  ['Gold mined', mined],
                  ['Upkeep lost', upkeep],
                  ['Net mined', net],
                ] as [string, number][]
              ).map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: '.58em', color: '#7a7a88', fontFamily: 'monospace' }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: '.66em',
                      color: label === 'Upkeep lost' ? '#ff7b72' : '#efeff1',
                      fontFamily: 'monospace',
                    }}
                  >
                    {val.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <ResourceChart
        players={players}
        title="Economy — Gold"
        yStep={step}
        diffLabel="gold"
        series={{
          mined: (s) => s.gold_mined,
          upkeep: (s) => s.gold_upkeep_lost,
          minedLabel: 'mined',
          upkeepLabel: 'upkeep',
          netLabel: 'net gold',
        }}
      />
    </div>
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
      diffLabel="lumber"
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

export function ApmChart({ players }: { players: ChartPlayer[] }) {
  const rawMax = Math.max(...players.flatMap((p) => p.samples.map((s) => s.apm)), 1)
  const step = rawMax > 200 ? 100 : rawMax > 100 ? 50 : 25
  return (
    <ResourceChart
      players={players}
      title="Actions per Minute"
      yStep={step}
      diffLabel="apm"
      singleLine
      series={{
        mined: (s) => s.apm,
        upkeep: () => 0,
        minedLabel: 'apm',
        upkeepLabel: '',
        netLabel: '',
      }}
    />
  )
}
