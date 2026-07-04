import type { CSSProperties } from 'react'

// Warcraft III damage reduction from armor, as a signed percentage of incoming
// damage. Positive armor reduces damage by 0.06·armor / (1 + 0.06·armor).
// Negative armor instead *increases* damage by (0.94^|armor| − 1), shown here as
// a negative reduction (i.e. extra damage taken).
function reductionPct(armor: number): number {
  if (armor >= 0) return ((0.06 * armor) / (1 + 0.06 * armor)) * 100
  return -(1 - Math.pow(0.94, -armor)) * 100
}

// Armor -10…20 (skip 0), split into two even side-by-side columns so the table
// stays about as tall as the damage-type table it sits next to.
const NEG = Array.from({ length: 10 }, (_, i) => i - 10) // -10…-1
const POS = Array.from({ length: 20 }, (_, i) => i + 1) // 1…20
const ALL = [...NEG, ...POS]
const HALF = ALL.length / 2
const ROWS = Array.from({ length: HALF }, (_, i) => [ALL[i], ALL[i + HALF]] as const)

const headCell: CSSProperties = {
  border: '1px solid #2a2a3a',
  padding: '4px 7px',
  color: '#c8a050',
  fontWeight: 700,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  background: 'rgba(0,0,0,0.3)',
}
const bodyCell: CSSProperties = {
  border: '1px solid #2a2a3a',
  padding: '4px 7px',
  textAlign: 'center',
}

function color(v: number): string {
  return v > 0 ? '#7dbf7d' : v < 0 ? '#e06c6c' : '#888'
}
function fmt(v: number): string {
  const r = reductionPct(v)
  return `${r > 0 ? '+' : ''}${r.toFixed(1)}%`
}

/** WC3 armor → damage-reduction reference for the encyclopedia Combat tab. */
export function ArmorTable() {
  return (
    <div style={{ padding: '8px 4px', overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '.62em' }}>
        <thead>
          <tr>
            <th style={headCell}>Armor</th>
            <th style={headCell}>Reduction</th>
            <th style={headCell}>Armor</th>
            <th style={headCell}>Reduction</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([left, right]) => (
            <tr key={left}>
              <th style={headCell}>{left}</th>
              <td style={{ ...bodyCell, color: color(left) }}>{fmt(left)}</td>
              <th style={headCell}>{right}</th>
              <td style={{ ...bodyCell, color: color(right) }}>{fmt(right)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          fontSize: '.55em',
          color: '#6a6a6a',
          fontFamily: 'monospace',
          marginTop: 8,
          padding: '0 4px',
          maxWidth: 340,
        }}
      >
        Damage reduction at each armor value: 0.06·armor / (1 + 0.06·armor). Positive armor reduces
        damage (every point ≈ +6% effective HP); negative armor adds damage via ×(2 −
        0.94<sup>|armor|</sup>), shown as a negative reduction. (Warcraft III: The Frozen Throne)
      </div>
    </div>
  )
}
