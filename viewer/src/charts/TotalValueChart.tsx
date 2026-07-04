import { useState } from 'react'
import { ChartPlayer, type Sample } from '@magic-sentry/shared'
import { nearestSample, niceMax, timeTicks } from '@magic-sentry/shared'
import { UNIT_GOLD_BY_ID, UNIT_LUMBER_BY_ID } from '@magic-sentry/wc3data'
import { tavernReviveCost } from '../heroRevival'
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

// Gold / lumber tied up in a player's army at a sample: alive count × unit cost
// over s.units, plus each hero valued at its Tavern revive cost for its level (a
// level-scaled proxy for the investment in a hero). Structures are excluded.
// Kept split for the tooltip breakdown — the chart plots their sum.
function goldValue(s: Sample): number {
  const units = s.units.reduce((sum, u) => sum + u.alive * (UNIT_GOLD_BY_ID[u.id] ?? 0), 0)
  return s.heroes.reduce((sum, h) => sum + tavernReviveCost(h.level).gold, units)
}
function lumberValue(s: Sample): number {
  const units = s.units.reduce((sum, u) => sum + u.alive * (UNIT_LUMBER_BY_ID[u.id] ?? 0), 0)
  return s.heroes.reduce((sum, h) => sum + tavernReviveCost(h.level).lumber, units)
}
// Single combined data point: total unit value (gold + lumber) for a player.
function totalValue(s: Sample): number {
  return goldValue(s) + lumberValue(s)
}

/**
 * Per-player total unit value over time — one line each, where each point is the
 * sum of the player's unit gold and lumber. Mirrors the ResourceChart layout.
 */
export function TotalValueChart({ players }: { players: ChartPlayer[] }) {
  const { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave } = useChartHover()
  const [diff, setDiff] = useState(false)

  if (players.every((p) => p.samples.length === 0)) return null
  const maxTime = Math.max(...players.flatMap((p) => p.samples.map((s) => s.time_ms))) / 1000
  const rawMax = Math.max(...players.flatMap((p) => p.samples.map((s) => totalValue(s))), 1)
  const yStep = rawMax > 10000 ? 5000 : rawMax > 4000 ? 2000 : rawMax > 1500 ? 1000 : 500
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <SectionLabel>Total value — unit gold + lumber</SectionLabel>
        {players.length === 2 && <DiffToggle on={diff} onChange={setDiff} />}
      </div>
      {diff && players.length === 2 ? (
        <CenteredDiffPlot
          p1={players[0]}
          p2={players[1]}
          metrics={[{ label: 'value', value: totalValue, color: '#c8a050' }]}
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
                const tp = samples.map(
                  (s) => [xOf(s.time_ms / 1000), yOf(totalValue(s))] as [number, number],
                )
                return (
                  <path
                    key={color}
                    d={svgPath(tp)}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
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
                const gold = goldValue(s)
                const lumber = lumberValue(s)
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        fontFamily: 'monospace',
                        fontSize: '.8em',
                      }}
                    >
                      <span style={{ color: '#7a7a88' }}>value</span>
                      <span style={{ color: '#efeff1' }}>{(gold + lumber).toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        fontFamily: 'monospace',
                        fontSize: '.7em',
                        color: '#585863',
                      }}
                    >
                      <span>{gold.toLocaleString()}g</span>
                      <span>{lumber.toLocaleString()}w</span>
                    </div>
                  </div>
                )
              })}
            </ChartTooltip>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 24px' }}>
            {players.map(({ name, color }) => (
              <span
                key={name}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.6em', color: '#888' }}
              >
                <svg width={16} height={2} style={{ flexShrink: 0 }}>
                  <line x1={0} y1={1} x2={16} y2={1} stroke={color} strokeWidth={2} />
                </svg>
                {name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
