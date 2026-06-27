import type { CSSProperties } from 'react'

const ARMOR_TYPES = [
  'Unarmored',
  'Light',
  'Medium',
  'Heavy',
  'Fortified',
  'Hero',
  'Divine',
] as const
const DAMAGE_TYPES = ['Normal', 'Pierce', 'Siege', 'Magic', 'Chaos', 'Hero', 'Spells'] as const
type ArmorType = (typeof ARMOR_TYPES)[number]
type DamageType = (typeof DAMAGE_TYPES)[number]

// Damage dealt as a fraction of base (1 = 100%). Warcraft III: The Frozen Throne.
// Typed as exhaustive Records, so tsc errors if any damage row or armor column is missing.
const DAMAGE_MULTIPLIERS: Record<DamageType, Record<ArmorType, number>> = {
  Normal: {
    Unarmored: 1.0,
    Light: 1.0,
    Medium: 1.5,
    Heavy: 1.0,
    Fortified: 0.7,
    Hero: 1.0,
    Divine: 0.05,
  },
  Pierce: {
    Unarmored: 1.5,
    Light: 2.0,
    Medium: 0.75,
    Heavy: 1.0,
    Fortified: 0.35,
    Hero: 0.5,
    Divine: 0.05,
  },
  Siege: {
    Unarmored: 1.5,
    Light: 1.0,
    Medium: 0.5,
    Heavy: 1.0,
    Fortified: 1.5,
    Hero: 0.5,
    Divine: 0.05,
  },
  Magic: {
    Unarmored: 1.0,
    Light: 1.25,
    Medium: 0.75,
    Heavy: 2.0,
    Fortified: 0.35,
    Hero: 0.5,
    Divine: 0.05,
  },
  Chaos: {
    Unarmored: 1.0,
    Light: 1.0,
    Medium: 1.0,
    Heavy: 1.0,
    Fortified: 1.0,
    Hero: 1.0,
    Divine: 1.0,
  },
  Hero: {
    Unarmored: 1.0,
    Light: 1.0,
    Medium: 1.0,
    Heavy: 1.0,
    Fortified: 0.5,
    Hero: 1.0,
    Divine: 0.05,
  },
  Spells: {
    Unarmored: 1.0,
    Light: 1.0,
    Medium: 1.0,
    Heavy: 1.0,
    Fortified: 1.0,
    Hero: 0.7,
    Divine: 0.05,
  },
}

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

function cellColor(m: number): string {
  if (m > 1) return '#3fb950'
  if (m < 1) return '#e06c6c'
  return '#888'
}

/** Static WC3 damage-type × armor-type effectiveness matrix for the encyclopedia. */
export function DamageTable() {
  return (
    <div style={{ padding: '8px 4px', overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '.62em' }}>
        <thead>
          <tr>
            <th style={{ ...headCell, textAlign: 'left' }}>Damage \ Armor</th>
            {ARMOR_TYPES.map((a) => (
              <th key={a} style={headCell}>
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAMAGE_TYPES.map((d) => (
            <tr key={d}>
              <th style={{ ...headCell, textAlign: 'left' }}>{d}</th>
              {ARMOR_TYPES.map((a) => {
                const m = DAMAGE_MULTIPLIERS[d][a]
                return (
                  <td key={a} style={{ ...bodyCell, color: cellColor(m) }}>
                    {Math.round(m * 100)}%
                  </td>
                )
              })}
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
          maxWidth: 460,
        }}
      >
        Damage dealt as a percentage of base. Green = bonus, red = reduced. (Warcraft III: The
        Frozen Throne)
      </div>
    </div>
  )
}
