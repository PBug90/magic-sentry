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

const EXAMPLES: { key: string; label: string }[] = [
  { key: 'all', label: 'All units' },
  { key: 'hu-orc', label: 'HU · Orc' },
  { key: 'ne-ud', label: 'NE · UD' },
]

// Colorful gradient backdrops standing in for a live stream, so overlay
// legibility/transparency can be judged against varied, vibrant colors.
const SCENES: { key: string; label: string; css: string }[] = [
  {
    key: 'vibrant',
    label: 'Vibrant',
    css:
      'radial-gradient(circle at 18% 28%, #ff4d6d 0%, transparent 45%),' +
      'radial-gradient(circle at 82% 18%, #4d79ff 0%, transparent 45%),' +
      'radial-gradient(circle at 60% 82%, #2dd4bf 0%, transparent 48%),' +
      'linear-gradient(135deg, #2a1a4a, #0e1020)',
  },
  {
    key: 'sunset',
    label: 'Sunset',
    css:
      'radial-gradient(circle at 72% 32%, #ffb347 0%, transparent 52%),' +
      'radial-gradient(circle at 22% 78%, #ff5e7e 0%, transparent 52%),' +
      'linear-gradient(180deg, #2b1055 0%, #7597de 100%)',
  },
  {
    key: 'aurora',
    label: 'Aurora',
    css:
      'radial-gradient(ellipse at 28% 22%, #00e5ff 0%, transparent 50%),' +
      'radial-gradient(ellipse at 72% 58%, #7c4dff 0%, transparent 50%),' +
      'radial-gradient(ellipse at 50% 92%, #1de9b6 0%, transparent 50%),' +
      'linear-gradient(160deg, #0d1b2a, #1b263b)',
  },
  {
    key: 'forest',
    label: 'Forest',
    css:
      'radial-gradient(ellipse at 30% 70%, #1f7a1f 0%, transparent 52%),' +
      'radial-gradient(ellipse at 72% 38%, #3a6a1a 0%, transparent 52%),' +
      'linear-gradient(180deg, #1a3a5a 0%, #0e1a0e 45%, #1a4010 100%)',
  },
  {
    key: 'inferno',
    label: 'Inferno',
    css:
      'radial-gradient(circle at 50% 102%, #ff6b00 0%, transparent 55%),' +
      'radial-gradient(circle at 28% 42%, #ff1744 0%, transparent 45%),' +
      'linear-gradient(180deg, #1a0505, #3a0a0a)',
  },
]

// Default live API host (overridable with ?base=). The public live endpoints are
// CORS-open to https://localhost:8080, so the playground can poll real data.
const DEFAULT_API_BASE = 'https://magicsentry.pro'

/** Builds the channel-live endpoint, e.g. https://host/api/<channel>/live */
function liveEndpoint(channel: string, base?: string | null): string {
  const b = (base || DEFAULT_API_BASE).replace(/\/+$/, '')
  return `${b}/api/${channel}/live`
}

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
        style={{ width: 90 }}
      />
      <span style={{ color: '#c8a050', fontSize: 10, minWidth: 32 }}>{value}</span>
    </div>
  )
}

const fieldStyle = {
  background: '#12121a',
  border: '1px solid #2a2a3a',
  borderRadius: 3,
  color: '#efeff1',
  fontFamily: 'monospace',
  fontSize: 11,
  padding: '2px 6px',
} as const

const btnStyle = (active: boolean) =>
  ({
    background: active ? '#1a1a30' : '#12121a',
    border: `1px solid ${active ? '#444' : '#2a2a3a'}`,
    borderRadius: 3,
    color: active ? '#c8a050' : '#888',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 10,
    padding: '2px 8px',
  }) as const

function DevApp() {
  const saved = window.__devGetConfig()
  const [endpointUrl, setEndpointUrl] = useState(saved.endpointUrl ?? '')
  const [token, setToken] = useState(saved.token ?? '')
  const [flash, setFlash] = useState(false)
  const [channel, setChannel] = useState(
    () => new URLSearchParams(location.search).get('channel') ?? '',
  )

  const [width, setWidth] = useState(854)
  const [height, setHeight] = useState(480)

  // Simulated stream backdrop behind the (transparent) overlay.
  const [scene, setScene] = useState(SCENES[0].key)
  const [customBg, setCustomBg] = useState('')
  const [brightness, setBrightness] = useState(100)
  // A custom image URL (if given) wins; otherwise use the selected gradient.
  const bgImage = customBg.trim()
    ? `url("${customBg.trim()}")`
    : scene === 'none'
      ? undefined
      : SCENES.find((s) => s.key === scene)?.css

  const dragRef = useRef<{
    edge: 'right' | 'bottom' | 'corner'
    startX: number
    startY: number
    startW: number
    startH: number
  } | null>(null)

  function apply(ep: string, tok = 'dev') {
    setEndpointUrl(ep)
    setToken(tok)
    window.__devUpdateConfig({ endpointUrl: ep, token: tok })
    setFlash(true)
  }

  function loadExample(key: string) {
    apply(`${location.origin}/dev-api/${key}/live`)
  }

  function loadChannel(name: string) {
    if (!name) return
    const params = new URLSearchParams(location.search)
    apply(liveEndpoint(name, params.get('base') ?? params.get('api')), params.get('token') ?? 'dev')
    // Reflect the channel in the URL so the view is bookmarkable/shareable.
    params.set('channel', name)
    history.replaceState(null, '', `${location.pathname}?${params}`)
  }

  // On load: ?channel=<name> pulls live data for that channel (no Twitch needed);
  // otherwise fall back to a bundled example so the playground is never empty.
  useEffect(() => {
    const initialChannel = new URLSearchParams(location.search).get('channel')
    if (initialChannel) loadChannel(initialChannel)
    else if (!saved.endpointUrl) loadExample('all')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const handleStyle = { background: 'transparent', position: 'absolute' as const, zIndex: 10 }

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
          minHeight: TOOLBAR_H,
          flexShrink: 0,
          borderBottom: '1px solid #1e1e26',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '5px 12px',
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
          Overlay Playground
        </span>

        {/* Example loader */}
        <span style={{ color: '#555' }}>game</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.key}
            onClick={() => loadExample(ex.key)}
            style={btnStyle(endpointUrl.endsWith(`/dev-api/${ex.key}/live`))}
          >
            {ex.label}
          </button>
        ))}

        {/* Live channel loader */}
        <span style={{ color: '#555' }}>live</span>
        <input
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadChannel(channel.trim())}
          placeholder="channel"
          style={{ ...fieldStyle, width: 110 }}
        />
        <button onClick={() => loadChannel(channel.trim())} style={btnStyle(false)}>
          view
        </button>

        <div style={{ width: 1, height: 18, background: '#1e1e26', flexShrink: 0 }} />

        {/* Backdrop */}
        <span style={{ color: '#555' }}>scene</span>
        <select value={scene} onChange={(e) => setScene(e.target.value)} style={fieldStyle}>
          {SCENES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
          <option value="none">none</option>
        </select>
        <input
          value={customBg}
          onChange={(e) => setCustomBg(e.target.value)}
          placeholder="custom bg url"
          style={{ ...fieldStyle, width: 120 }}
        />
        <Slider label="bright" value={brightness} min={20} max={150} onChange={setBrightness} />

        <div style={{ width: 1, height: 18, background: '#1e1e26', flexShrink: 0 }} />

        {/* Size */}
        <Slider label="W" value={width} min={320} max={1920} onChange={setWidth} />
        <Slider label="H" value={height} min={180} max={1080} onChange={setHeight} />
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setWidth(p.w)
                setHeight(p.h)
              }}
              style={btnStyle(width === p.w && height === p.h)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 18, background: '#1e1e26', flexShrink: 0 }} />

        {/* Manual endpoint override */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 160 }}>
          <span style={{ flexShrink: 0, color: '#555' }}>endpoint</span>
          <input
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyConfig()}
            placeholder="auto (example)"
            style={{ ...fieldStyle, flex: 1 }}
          />
        </label>
        <button
          onClick={applyConfig}
          style={{
            ...btnStyle(false),
            background: flash ? '#1a3a1a' : '#12121a',
            border: `1px solid ${flash ? '#3fb950' : '#2a2a3a'}`,
            color: flash ? '#3fb950' : '#888',
          }}
        >
          {flash ? 'applied ✓' : 'apply'}
        </button>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
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
            {/* Simulated stream */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#0e0e10',
                backgroundImage: bgImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: `brightness(${brightness}%)`,
              }}
            />
            <Overlay />
          </div>

          {/* drag handles */}
          <div
            onMouseDown={(e) => startDrag('right', e)}
            style={{ ...handleStyle, right: -5, top: 0, bottom: 8, width: 10, cursor: 'ew-resize' }}
          />
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
          <span>click the rail icons · gear opens Settings</span>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<DevApp />)
