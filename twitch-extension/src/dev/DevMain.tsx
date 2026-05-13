import { createRoot } from 'react-dom/client'
import { useState, useEffect, useRef } from 'react'
import { Overlay } from '../viewer/Overlay'

declare global {
  interface Window {
    __devGetConfig: () => { endpointUrl?: string; token?: string }
    __devUpdateConfig: (cfg: { endpointUrl: string; token: string }) => void
  }
}

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: '480p', w: 854, h: 480 },
  { label: '720p', w: 1280, h: 720 },
  { label: '1080p', w: 1920, h: 1080 },
]

const TOOLBAR_H = 36

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ color: '#555', fontSize: 10 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: 100 }}
      />
      <span style={{ color: '#c8a050', fontSize: 10, minWidth: 36 }}>{value}</span>
    </div>
  )
}

function DevApp() {
  const saved = window.__devGetConfig()
  const [endpointUrl, setEndpointUrl] = useState(saved.endpointUrl ?? '')
  const [token, setToken] = useState(saved.token ?? '')
  const [flash, setFlash] = useState(false)

  const [width, setWidth] = useState(854)
  const [height, setHeight] = useState(480)

  // drag-resize state
  const dragRef = useRef<{
    edge: 'right' | 'bottom' | 'corner'
    startX: number
    startY: number
    startW: number
    startH: number
  } | null>(null)

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 1200)
    return () => clearTimeout(t)
  }, [flash])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const d = dragRef.current
      if (!d) return
      if (d.edge === 'right' || d.edge === 'corner')
        setWidth(Math.max(320, d.startW + e.clientX - d.startX))
      if (d.edge === 'bottom' || d.edge === 'corner')
        setHeight(Math.max(180, d.startH + e.clientY - d.startY))
    }
    function onMouseUp() {
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  function startDrag(edge: 'right' | 'bottom' | 'corner', e: React.MouseEvent) {
    e.preventDefault()
    dragRef.current = { edge, startX: e.clientX, startY: e.clientY, startW: width, startH: height }
  }

  function applyConfig() {
    window.__devUpdateConfig({ endpointUrl, token })
    setFlash(true)
  }

  const handleStyle = {
    background: 'transparent',
    position: 'absolute' as const,
    zIndex: 10,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#07070f',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: TOOLBAR_H,
          flexShrink: 0,
          borderBottom: '1px solid #1e1e26',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 12px',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#777',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            color: '#c8a050',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            fontSize: 10,
            flexShrink: 0,
          }}
        >
          Dev Preview
        </span>

        {/* Config */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 200 }}>
          <span style={{ flexShrink: 0 }}>endpoint</span>
          <input
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyConfig()}
            placeholder="http://localhost:3000/api/channel/live/gameId"
            style={{
              flex: 1,
              background: '#12121a',
              border: '1px solid #2a2a3a',
              borderRadius: 3,
              color: '#efeff1',
              fontFamily: 'monospace',
              fontSize: 11,
              padding: '2px 6px',
            }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span>token</span>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyConfig()}
            placeholder="optional"
            style={{
              width: 100,
              background: '#12121a',
              border: '1px solid #2a2a3a',
              borderRadius: 3,
              color: '#efeff1',
              fontFamily: 'monospace',
              fontSize: 11,
              padding: '2px 6px',
            }}
          />
        </label>
        <button
          onClick={applyConfig}
          style={{
            background: flash ? '#1a3a1a' : '#12121a',
            border: `1px solid ${flash ? '#3fb950' : '#2a2a3a'}`,
            borderRadius: 3,
            color: flash ? '#3fb950' : '#888',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: 11,
            padding: '2px 8px',
            transition: 'all .15s',
            flexShrink: 0,
          }}
        >
          {flash ? 'applied ✓' : 'apply'}
        </button>

        <div style={{ width: 1, height: 18, background: '#1e1e26', flexShrink: 0 }} />

        {/* Size sliders */}
        <Slider label="W" value={width} min={320} max={1920} onChange={setWidth} />
        <Slider label="H" value={height} min={180} max={1080} onChange={setHeight} />

        {/* Presets */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setWidth(p.w)
                setHeight(p.h)
              }}
              style={{
                background: width === p.w && height === p.h ? '#1a1a30' : '#12121a',
                border: `1px solid ${width === p.w && height === p.h ? '#444' : '#2a2a3a'}`,
                borderRadius: 3,
                color: width === p.w && height === p.h ? '#c8a050' : '#555',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 10,
                padding: '2px 7px',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {/* Extension frame with drag handles */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div
            style={{
              width,
              height,
              overflow: 'hidden',
              border: '1px solid #2a2a3a',
              boxShadow: '0 0 0 1px #1e1e26',
              position: 'relative',
              background: '#0e0e10',
            }}
          >
            <Overlay />
          </div>

          {/* Right drag handle */}
          <div
            onMouseDown={(e) => startDrag('right', e)}
            style={{ ...handleStyle, right: -5, top: 0, bottom: 8, width: 10, cursor: 'ew-resize' }}
          />
          {/* Bottom drag handle */}
          <div
            onMouseDown={(e) => startDrag('bottom', e)}
            style={{
              ...handleStyle,
              bottom: -5,
              left: 0,
              right: 8,
              height: 10,
              cursor: 'ns-resize',
            }}
          />
          {/* Corner drag handle */}
          <div
            onMouseDown={(e) => startDrag('corner', e)}
            style={{
              ...handleStyle,
              right: -5,
              bottom: -5,
              width: 14,
              height: 14,
              cursor: 'nwse-resize',
              background: '#2a2a3a',
              borderRadius: 2,
            }}
          />
        </div>

        {/* Size readout */}
        <div
          style={{
            marginTop: 6,
            fontFamily: 'monospace',
            fontSize: 10,
            color: '#333',
            display: 'flex',
            gap: 12,
          }}
        >
          <span>
            {width} × {height}px
          </span>
          <span>{(width / height).toFixed(2)} ratio</span>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<DevApp />)
