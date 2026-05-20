import { ITEM_BY_ID, UNIT_NAME_BY_ID } from '@magic-sentry/shared'
import type { Fight } from '@magic-sentry/shared'
import { useIconSrc } from './context'

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`
}

const SEVERITY_COLOR: Record<Fight['severity'], string> = {
  major: '#f85149',
  medium: '#388bfd',
  minor: '#444455',
}

const SEVERITY_LABEL: Record<Fight['severity'], string> = {
  major: 'MAJOR',
  medium: 'MED',
  minor: 'MINOR',
}

function QuickTags({ fight }: { fight: Fight }) {
  const tags: string[] = []
  for (const p of fight.players) {
    for (const h of p.killedHeroes) {
      tags.push(`${p.name} ${UNIT_NAME_BY_ID[h.id] ?? h.id} lv${h.level} died`)
    }
  }
  const totalUnitsLost = fight.players.reduce(
    (sum, p) => sum + p.unitsLost.reduce((s, u) => s + u.count, 0),
    0,
  )
  if (totalUnitsLost > 0) tags.push(`−${totalUnitsLost} units`)
  const totalItemsUsed = fight.players.reduce((sum, p) => sum + p.itemsUsed.length, 0)
  if (totalItemsUsed > 0) tags.push('items used')

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
      {tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          style={{
            fontSize: '.6em',
            fontFamily: 'monospace',
            background: '#1a1a28',
            border: '1px solid #2a2a3a',
            borderRadius: 2,
            padding: '1px 5px',
            color: '#aaa',
            whiteSpace: 'nowrap',
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function Sparkline({ fight }: { fight: Fight }) {
  const W = 220
  const H = 36
  const playerColors = ['#388bfd', '#f85149']

  const allValues = fight.players.flatMap((p) => p.damageCurve)
  const maxVal = Math.max(...allValues, 1)

  const toPoints = (curve: number[]) => {
    if (curve.length < 2) return ''
    return curve
      .map((v, i) => {
        const x = (i / (curve.length - 1)) * W
        const y = H - (v / maxVal) * H
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: '.58em', fontFamily: 'monospace', letterSpacing: '.1em', color: '#555', textTransform: 'uppercase' }}>
          Damage activity
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {fight.players.map((p, i) => (
            <span key={p.name} style={{ fontSize: '.6em', fontFamily: 'monospace', color: playerColors[i] ?? '#888' }}>
              — {p.name}
            </span>
          ))}
        </div>
      </div>
      <svg
        width={W}
        height={H}
        style={{ display: 'block' }}
        viewBox={`0 0 ${W} ${H}`}
      >
        {fight.players.map((p, i) => {
          const pts = toPoints(p.damageCurve)
          if (!pts) return null
          return (
            <polyline
              key={p.name}
              points={pts}
              fill="none"
              stroke={playerColors[i] ?? '#888'}
              strokeWidth={1.5}
              strokeLinejoin="round"
              opacity={0.85}
            />
          )
        })}
      </svg>
    </div>
  )
}

export function ExpandedPanel({ fight }: { fight: Fight }) {
  const iconSrc = useIconSrc()
  const playerColors = ['#388bfd', '#f85149']

  return (
    <div
      style={{
        marginTop: 8,
        padding: '14px 16px',
        background: '#0f0f1a',
        border: '1px solid #2a2a3a',
        borderRadius: 4,
      }}
    >
      <Sparkline fight={fight} />
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: '.58em', fontFamily: 'monospace', letterSpacing: '.1em', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}>
          Heroes
        </div>
        {fight.players.map((p, i) => (
          <div key={p.name} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: '.65em', color: playerColors[i] ?? '#888', marginBottom: 2 }}>{p.name}</div>
            {p.heroStats.map((h) => (
              <div key={h.id} style={{ display: 'flex', gap: 10, fontSize: '.62em', paddingLeft: 8, alignItems: 'center' }}>
                <span style={{ color: '#ccc', minWidth: 100 }}>{UNIT_NAME_BY_ID[h.id] ?? h.id} lv{h.level}</span>
                <span style={{ color: '#f85149' }}>{h.damageDone.toLocaleString()} dmg</span>
                {h.healingDone > 0 && <span style={{ color: '#3fb950' }}>{h.healingDone.toLocaleString()} heal</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Losses column */}
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: '.58em', fontFamily: 'monospace', letterSpacing: '.1em', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}
          >
            Losses
          </div>
          {fight.players.map((p, i) => (
            <div key={p.name} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '.68em', color: playerColors[i] ?? '#888', marginBottom: 3 }}>
                {p.name}
                {p.killedHeroes.map((h) => (
                  <span key={h.id} style={{ color: '#f85149', marginLeft: 6, fontFamily: 'monospace' }}>
                    {UNIT_NAME_BY_ID[h.id] ?? h.id} lv{h.level} died
                  </span>
                ))}
              </div>
              {p.unitsLost.length === 0 ? (
                <div style={{ fontSize: '.62em', color: '#444' }}>none</div>
              ) : (
                p.unitsLost.map((u) => (
                  <div key={u.id} style={{ fontSize: '.62em', color: '#ccc', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <img
                      src={iconSrc(`/units/${u.id}.webp`)}
                      width={14}
                      height={14}
                      alt={u.id}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span style={{ color: '#f85149' }}>−{u.count}</span>
                    <span style={{ color: '#888' }}>{UNIT_NAME_BY_ID[u.id] ?? u.id}</span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Before / After column */}
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: '.58em', fontFamily: 'monospace', letterSpacing: '.1em', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}
          >
            Before / After
          </div>
          {fight.players.map((p, i) => (
            <div key={p.name} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '.68em', color: playerColors[i] ?? '#888', marginBottom: 3 }}>{p.name}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <div>
                  {p.armyBefore.map((u) => (
                    <div key={u.id} style={{ fontSize: '.62em', color: '#888', marginBottom: 1 }}>
                      {u.alive}× {UNIT_NAME_BY_ID[u.id] ?? u.id}
                    </div>
                  ))}
                </div>
                <div style={{ color: '#444', fontSize: '.7em', alignSelf: 'center' }}>→</div>
                <div>
                  {p.armyAfter.map((u) => (
                    <div key={u.id} style={{ fontSize: '.62em', color: '#ccc', marginBottom: 1 }}>
                      {u.alive}× {UNIT_NAME_BY_ID[u.id] ?? u.id}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Items Used column */}
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: '.58em', fontFamily: 'monospace', letterSpacing: '.1em', color: '#555', marginBottom: 6, textTransform: 'uppercase' }}
          >
            Items Used
          </div>
          {fight.players.map((p, i) => (
            <div key={p.name} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: '.68em', color: playerColors[i] ?? '#888', marginBottom: 3 }}>{p.name}</div>
              {p.itemsUsed.length === 0 ? (
                <div style={{ fontSize: '.62em', color: '#444' }}>none</div>
              ) : (
                p.itemsUsed.map((item) => {
                  const data = ITEM_BY_ID[item.id]
                  return (
                    <div key={item.id} style={{ fontSize: '.62em', color: '#d29922', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <img
                        src={iconSrc(`/items/${item.id}.webp`)}
                        width={14}
                        height={14}
                        alt={item.id}
                        style={{ imageRendering: 'pixelated' }}
                      />
                      {item.count > 1 && <span>×{item.count}</span>}
                      <span>{data?.name ?? item.id}</span>
                    </div>
                  )
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FightCard({
  fight,
  isExpanded,
  onToggle,
}: {
  fight: Fight
  isExpanded: boolean
  onToggle: () => void
}) {
  const color = SEVERITY_COLOR[fight.severity]

  return (
    <div style={{ minWidth: 140 }}>
      <div
        onClick={onToggle}
        style={{
          cursor: 'pointer',
          border: `1px solid ${color}`,
          borderRadius: 4,
          padding: '10px 12px',
          background: isExpanded ? '#12121e' : '#0d0d18',
          transition: 'background .1s',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: '.72em', fontFamily: 'monospace', color: '#efeff1' }}>
            {formatTime(fight.startMs)}
          </span>
          <span style={{ fontSize: '.6em', fontFamily: 'monospace', color: '#555' }}>
            {formatDuration(fight.endMs - fight.startMs)}
          </span>
          <span
            style={{
              fontSize: '.52em',
              fontFamily: 'monospace',
              letterSpacing: '.1em',
              color,
              border: `1px solid ${color}`,
              borderRadius: 2,
              padding: '1px 4px',
            }}
          >
            {SEVERITY_LABEL[fight.severity]}
          </span>
        </div>
        <QuickTags fight={fight} />
      </div>
    </div>
  )
}
