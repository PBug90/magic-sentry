import type { CSSProperties } from 'react'

export type OverlayLayout = 'docked' | 'fullscreen' | 'corner'

const label: CSSProperties = {
  fontSize: '.62em',
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  fontFamily: 'monospace',
  color: '#9a9aa2',
  marginBottom: 8,
}

const help: CSSProperties = {
  fontSize: '.62em',
  color: '#6a6a6a',
  marginTop: 7,
  lineHeight: 1.5,
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { key: OverlayLayout; label: string }[]
  value: OverlayLayout
  onChange: (v: OverlayLayout) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid #2a2a3a',
        borderRadius: 5,
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: '.72em',
        width: 'fit-content',
      }}
    >
      {options.map((o) => {
        const active = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            style={{
              background: active ? '#c8a050' : 'none',
              color: active ? '#1a1a1a' : '#888',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 16px',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function OverlaySettings({
  opacity,
  layout,
  onOpacity,
  onLayout,
}: {
  opacity: number
  layout: OverlayLayout
  onOpacity: (v: number) => void
  onLayout: (v: OverlayLayout) => void
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
      }}
    >
      <div>
        <div style={label}>Background opacity</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            min={30}
            max={100}
            step={1}
            value={Math.round(opacity * 100)}
            onChange={(e) => onOpacity(Number(e.target.value) / 100)}
            style={{ flex: 1, accentColor: '#c8a050', cursor: 'pointer' }}
          />
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '.72em',
              color: '#c8a050',
              minWidth: 38,
              textAlign: 'right',
            }}
          >
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <div style={help}>
          How see-through the panel background is, so the stream shows through.
        </div>
      </div>

      <div>
        <div style={label}>Graph layout</div>
        <Toggle
          options={[
            { key: 'docked', label: 'Docked' },
            { key: 'fullscreen', label: 'Fullscreen' },
            { key: 'corner', label: 'Corner' },
          ]}
          value={layout}
          onChange={onLayout}
        />
        <div style={help}>
          Docked keeps a full-height panel on the right; Fullscreen fills the stream area beside the
          rail; Corner shows a compact card in the bottom-right.
        </div>
      </div>
    </div>
  )
}
