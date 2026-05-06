import { ChartPlayer } from '../../shared/types'
import { nearestSample, niceMax, timeTicks } from '@magic-sentry/shared'
import { CM, W, H, IW, IH, useChartHover, ChartTooltip, TooltipTime, SectionLabel } from './shared'

export function FoodChart({ players }: { players: ChartPlayer[] }) {
  const { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave } = useChartHover()

  if (players.every((p) => p.samples.length === 0)) return null
  const maxTime = Math.max(...players.flatMap((p) => p.samples.map((s) => s.time_ms))) / 1000
  const rawMax = Math.max(...players.flatMap((p) => p.samples.map((s) => s.food_cap)), 1)
  const yMax = niceMax(rawMax, 20)

  const xOf = (t: number) => (t / maxTime) * IW
  const yOf = (v: number) => IH - (v / yMax) * IH

  const yTicks: number[] = []
  for (let v = 0; v <= yMax; v += 20) yTicks.push(v)

  const hoverSec = hover ? hover.fraction * maxTime : null

  return (
    <div
      ref={wrapRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}
    >
      <SectionLabel>Food</SectionLabel>
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
                {v}
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
          {players.map(({ color, samples }) => (
            <g key={color}>
              <path
                d={samples
                  .map(
                    (s, i) =>
                      `${i === 0 ? 'M' : 'L'}${xOf(s.time_ms / 1000).toFixed(1)},${yOf(s.food_used).toFixed(1)}`,
                  )
                  .join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <path
                d={samples
                  .map(
                    (s, i) =>
                      `${i === 0 ? 'M' : 'L'}${xOf(s.time_ms / 1000).toFixed(1)},${yOf(s.food_cap).toFixed(1)}`,
                  )
                  .join(' ')}
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeDasharray="4 2"
                strokeLinejoin="round"
                opacity={0.45}
              />
            </g>
          ))}
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
            return (
              <div key={p.name} style={{ marginBottom: 4 }}>
                <span
                  style={{ fontSize: '.62rem', color: p.color, display: 'block', marginBottom: 1 }}
                >
                  {p.name}
                </span>
                {(
                  [
                    ['used', s.food_used],
                    ['cap', s.food_cap],
                  ] as [string, number][]
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
                    <span style={{ color: '#7a7a88' }}>{label}</span>
                    <span style={{ color: '#efeff1' }}>{val}</span>
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
            <span style={{ fontSize: '.65rem', color: '#888' }}>{name}</span>
            {(
              [
                { label: 'used', dash: undefined },
                { label: 'cap', dash: '4 2' },
              ] as { label: string; dash?: string }[]
            ).map(({ label, dash }) => (
              <span
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '.6rem',
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
    </div>
  )
}
