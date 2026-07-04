import type { CSSProperties } from 'react'
import { HERO_REVIVAL } from './heroRevival'

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
const gold: CSSProperties = { ...bodyCell, color: '#c8a050' }
const lumber: CSSProperties = { ...bodyCell, color: '#7dbf7d' }

/** WC3 hero revival cost/time per level, Altar vs Tavern, for the Combat tab. */
export function ReviveTable() {
  return (
    <div style={{ padding: '8px 4px', overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '.62em' }}>
        <thead>
          <tr>
            <th style={{ ...headCell, textAlign: 'left' }} rowSpan={2}>
              Hero Lv
            </th>
            <th style={headCell} colSpan={2}>
              Altar
            </th>
            <th style={headCell} colSpan={2}>
              Tavern
            </th>
          </tr>
          <tr>
            <th style={headCell}>Time</th>
            <th style={headCell}>Gold</th>
            <th style={headCell}>Gold</th>
            <th style={headCell}>Lumber</th>
          </tr>
        </thead>
        <tbody>
          {HERO_REVIVAL.map((r) => (
            <tr key={r.level}>
              <th style={{ ...headCell, textAlign: 'left' }}>{r.level}</th>
              <td style={bodyCell}>{r.altarTime}s</td>
              <td style={gold}>{r.altarGold}</td>
              <td style={gold}>{r.tavernGold}</td>
              <td style={lumber}>{r.tavernLumber}</td>
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
          maxWidth: 320,
        }}
      >
        Hero revival by level. Altar revival costs gold and takes time; Tavern (neutral) heroes
        revive instantly for gold + lumber. (Warcraft III: The Frozen Throne)
      </div>
    </div>
  )
}
