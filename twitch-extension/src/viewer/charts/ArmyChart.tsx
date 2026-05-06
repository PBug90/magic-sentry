import { ChartPlayer } from '../../shared/types'
import {
  buildLayers,
  buildByTime,
  buildAreas,
  heroSupply,
  niceMax,
  timeTicks,
  nearestSampleIdx,
  UNIT_COLORS,
} from '@magic-sentry/shared'
import {
  CM,
  W,
  CH,
  IW,
  CIH,
  useChartHover,
  ChartTooltip,
  TooltipTime,
  SectionLabel,
  UnitIcon,
  UnitIconRow,
} from './shared'

function ArmySnapshotPanel({
  player,
  layers,
  lastByTime,
  colorOf,
}: {
  player: ChartPlayer
  layers: string[]
  lastByTime: Record<string, number>
  colorOf: (name: string) => string
}) {
  const units = layers
    .map((name) => ({ name, fill: colorOf(name), count: lastByTime[name] ?? 0 }))
    .filter((u) => u.count > 0)
    .reverse()

  const totalFood = units.reduce((s, { name, count }) => s + count * heroSupply(name), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
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
      {units.length === 0 ? (
        <span style={{ fontSize: '.58em', color: '#46464f', fontFamily: 'monospace' }}>
          no units
        </span>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {units.map(({ name, fill, count }) => (
              <div
                key={name}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
              >
                <UnitIcon name={name} fill={fill} size={26} />
                <span style={{ fontSize: '.5em', color: '#8b8b99', fontFamily: 'monospace' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {units.map(({ name, fill, count }) => (
              <UnitIconRow key={name} fill={fill} name={name} count={count} />
            ))}
          </div>
          <span
            style={{
              fontSize: '.58em',
              color: '#555',
              fontFamily: 'monospace',
              paddingTop: 2,
              borderTop: '1px solid #1e1e26',
            }}
          >
            {totalFood} food
          </span>
        </>
      )}
    </div>
  )
}

export function ArmyChart({ players }: { players: ChartPlayer[] }) {
  const { hover, wrapRef, onSvgMouseMove, onSvgMouseLeave } = useChartHover()

  if (players.length < 2) return null
  const p1 = players[0]
  const p2 = players[1]
  const allSamples = [...p1.samples, ...p2.samples]
  if (allSamples.length === 0) return null

  const maxTime = Math.max(...allSamples.map((s) => s.time_ms)) / 1000
  const center = CIH / 2

  const layers1 = buildLayers(p1.samples)
  const layers2 = buildLayers(p2.samples)
  const byTime1 = buildByTime(p1.samples)
  const byTime2 = buildByTime(p2.samples)

  const supply = heroSupply

  const maxStack1 = Math.max(
    ...p1.samples.map((_, si) =>
      layers1.reduce((sum, n) => sum + (byTime1[si][n] ?? 0) * supply(n), 0),
    ),
    1,
  )
  const maxStack2 = Math.max(
    ...p2.samples.map((_, si) =>
      layers2.reduce((sum, n) => sum + (byTime2[si][n] ?? 0) * supply(n), 0),
    ),
    1,
  )
  const maxStack = Math.max(maxStack1, maxStack2)

  const yStep = maxStack > 60 ? 20 : maxStack > 30 ? 10 : 5
  const yMax = niceMax(maxStack, yStep)

  const xOf = (t: number) => (t / maxTime) * IW
  const yOf_up = (v: number) => center - (v / yMax) * center
  const yOf_dn = (v: number) => center + (v / yMax) * center

  const allUnitNames = [...new Set([...layers1, ...layers2])]
  const sharedColorMap = Object.fromEntries(
    allUnitNames.map((name, i) => [name, UNIT_COLORS[i % UNIT_COLORS.length]]),
  )
  const colorOf = (name: string) => sharedColorMap[name] ?? UNIT_COLORS[0]

  const areas1 = buildAreas(p1.samples, layers1, byTime1, xOf, yOf_up, supply, colorOf)
  const areas2 = buildAreas(p2.samples, layers2, byTime2, xOf, yOf_dn, supply, colorOf)

  const yTicks: number[] = []
  for (let v = yStep; v <= yMax; v += yStep) yTicks.push(v)

  const hoverSec = hover ? hover.fraction * maxTime : null
  const hi1 = hoverSec !== null && p1.samples.length ? nearestSampleIdx(p1.samples, hoverSec) : null
  const hi2 = hoverSec !== null && p2.samples.length ? nearestSampleIdx(p2.samples, hoverSec) : null

  return (
    <div
      ref={wrapRef}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}
    >
      <SectionLabel>Army Comparison</SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: '10px 12px',
          background: '#12121a',
          border: '1px solid #2a2a3a',
          marginBottom: 4,
        }}
      >
        <ArmySnapshotPanel
          player={p1}
          layers={layers1}
          lastByTime={byTime1.length ? byTime1[byTime1.length - 1] : {}}
          colorOf={colorOf}
        />
        <div style={{ width: 1, background: '#2a2a3a', flexShrink: 0 }} />
        <ArmySnapshotPanel
          player={p2}
          layers={layers2}
          lastByTime={byTime2.length ? byTime2[byTime2.length - 1] : {}}
          colorOf={colorOf}
        />
      </div>
      <svg
        viewBox={`0 0 ${W} ${CH}`}
        width="100%"
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={onSvgMouseMove}
        onMouseLeave={onSvgMouseLeave}
      >
        <g transform={`translate(${CM.left},${CM.top})`}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={0} y1={yOf_up(v)} x2={IW} y2={yOf_up(v)} stroke="#1e1e26" strokeWidth={1} />
              <line x1={0} y1={yOf_dn(v)} x2={IW} y2={yOf_dn(v)} stroke="#1e1e26" strokeWidth={1} />
              <text
                x={-6}
                y={yOf_up(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#46464f"
                fontFamily="monospace"
              >
                {v}
              </text>
              <text
                x={-6}
                y={yOf_dn(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={9}
                fill="#46464f"
                fontFamily="monospace"
              >
                {v}
              </text>
            </g>
          ))}
          <line
            x1={0}
            y1={center}
            x2={IW}
            y2={center}
            stroke="rgba(200,160,80,0.25)"
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
            y={CIH - 6}
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
              y={CIH + 16}
              textAnchor="middle"
              fontSize={9}
              fill="#46464f"
              fontFamily="monospace"
            >
              {Math.floor(t / 60)}m
            </text>
          ))}
          {areas1.map(({ name, d, fill }) => (
            <path
              key={`a-${name}`}
              d={d}
              fill={fill}
              opacity={0.75}
              stroke={fill}
              strokeWidth={0.5}
            />
          ))}
          {areas2.map(({ name, d, fill }) => (
            <path
              key={`b-${name}`}
              d={d}
              fill={fill}
              opacity={0.75}
              stroke={fill}
              strokeWidth={0.5}
            />
          ))}
          {hover && (
            <line
              x1={hover.fraction * IW}
              y1={0}
              x2={hover.fraction * IW}
              y2={CIH}
              stroke="rgba(200,160,80,0.5)"
              strokeWidth={1}
              pointerEvents="none"
            />
          )}
          <rect x={0} y={0} width={IW} height={CIH} fill="transparent" />
        </g>
      </svg>

      {hover && hoverSec !== null && (
        <ChartTooltip hover={hover} minWidth={190}>
          <TooltipTime sec={hoverSec} />
          {hi1 !== null &&
            (() => {
              const units = areas1
                .map(({ name, fill }) => ({ name, fill, count: byTime1[hi1][name] ?? 0 }))
                .filter((u) => u.count > 0)
                .reverse()
              if (units.length === 0) return null
              return (
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: '.62em',
                      color: p1.color,
                      display: 'block',
                      marginBottom: 5,
                    }}
                  >
                    {p1.name}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                    {units.map(({ name, fill, count }) => (
                      <div
                        key={name}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <UnitIcon name={name} fill={fill} size={22} />
                        <span
                          style={{ fontSize: '.5em', color: '#8b8b99', fontFamily: 'monospace' }}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                  {units.map(({ name, fill, count }) => (
                    <UnitIconRow key={name} fill={fill} name={name} count={count} />
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'monospace',
                      fontSize: '.6em',
                      marginTop: 4,
                      paddingTop: 4,
                      borderTop: '1px solid #2a2a3a',
                    }}
                  >
                    <span style={{ color: '#46464f' }}>total food</span>
                    <span style={{ color: '#efeff1' }}>
                      {units.reduce((s, { name, count }) => s + count * heroSupply(name), 0)}
                    </span>
                  </div>
                </div>
              )
            })()}
          {hi1 !== null && hi2 !== null && (
            <div style={{ borderTop: '1px solid #2a2a3a', marginBottom: 8 }} />
          )}
          {hi2 !== null &&
            (() => {
              const units = areas2
                .map(({ name, fill }) => ({ name, fill, count: byTime2[hi2][name] ?? 0 }))
                .filter((u) => u.count > 0)
                .reverse()
              if (units.length === 0) return null
              return (
                <div>
                  <span
                    style={{
                      fontSize: '.62em',
                      color: p2.color,
                      display: 'block',
                      marginBottom: 5,
                    }}
                  >
                    {p2.name}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                    {units.map(({ name, fill, count }) => (
                      <div
                        key={name}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <UnitIcon name={name} fill={fill} size={22} />
                        <span
                          style={{ fontSize: '.5em', color: '#8b8b99', fontFamily: 'monospace' }}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                  {units.map(({ name, fill, count }) => (
                    <UnitIconRow key={name} fill={fill} name={name} count={count} />
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: 'monospace',
                      fontSize: '.6em',
                      marginTop: 4,
                      paddingTop: 4,
                      borderTop: '1px solid #2a2a3a',
                    }}
                  >
                    <span style={{ color: '#46464f' }}>total food</span>
                    <span style={{ color: '#efeff1' }}>
                      {units.reduce((s, { name, count }) => s + count * heroSupply(name), 0)}
                    </span>
                  </div>
                </div>
              )
            })()}
        </ChartTooltip>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { player: p1, areas: areas1 },
          { player: p2, areas: areas2 },
        ].map(({ player, areas }) => (
          <div key={player.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '.65em', color: player.color }}>{player.name}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
              {[...areas].reverse().map(({ name, fill }) => (
                <span
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '.6em',
                    color: '#8b8b99',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: fill,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
