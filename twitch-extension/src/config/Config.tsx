import { useState, useEffect } from 'react'
import { ExtensionConfig, DEFAULT_CONFIG } from '../shared/types'

const CONFIG_VERSION = '1'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '.72rem',
        letterSpacing: '.08em',
        color: '#888',
        marginBottom: 6,
        fontFamily: 'monospace',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </label>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 10px',
        background: '#0e0e10',
        border: '1px solid #2a2a3a',
        borderRadius: 4,
        color: '#efeff1',
        fontFamily: 'monospace',
        fontSize: '.82rem',
        outline: 'none',
      }}
    />
  )
}

export function Config() {
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [cfg, setCfg] = useState<ExtensionConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const ext = window.Twitch?.ext

    function loadFromTwitch() {
      const seg = ext!.configuration.broadcaster
      if (seg?.content) {
        try {
          const parsed = JSON.parse(seg.content) as ExtensionConfig
          setCfg(parsed)
        } catch {
          // ignore malformed config
        }
      }
    }

    if (ext) {
      ext.onAuthorized(() => {
        loadFromTwitch()
      })
      ext.configuration.onChanged(() => {
        loadFromTwitch()
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    const ext = window.Twitch?.ext
    if (!ext) return
    const payload = JSON.stringify(cfg)
    ext.configuration.set('broadcaster', CONFIG_VERSION, payload)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function testConnection() {
    if (!cfg.endpointUrl) {
      setTestResult({ ok: false, msg: 'Enter a URL first.' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(`${cfg.endpointUrl}/after/-1`)
      if (res.status === 204) {
        setTestResult({ ok: true, msg: 'OK — connected (no game in progress)' })
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const data = await res.json()
      if (!Array.isArray(data.patches) || typeof data.next !== 'string') {
        throw new Error('Response is not a valid Magic Sentry chunk response')
      }
      setTestResult({
        ok: true,
        msg: `OK — ${data.patches.length} patch(es) available`,
      })
    } catch (e) {
      setTestResult({ ok: false, msg: String(e) })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title */}
      <div>
        <h1
          style={{
            fontSize: '1rem',
            letterSpacing: '.08em',
            color: '#c8a050',
            fontFamily: 'monospace',
            marginBottom: 4,
          }}
        >
          Magic Sentry — Configuration
        </h1>
        <p style={{ fontSize: '.72rem', color: '#555', lineHeight: 1.5 }}>
          Enter the URL of your Magic Sentry endpoint. The extension will poll it every few seconds
          and display the game charts as a video overlay.
        </p>
      </div>

      {/* Endpoint URL */}
      <div>
        <Label>Magic Sentry Endpoint URL</Label>
        <Input
          value={cfg.endpointUrl}
          onChange={(v) => setCfg((c) => ({ ...c, endpointUrl: v }))}
          placeholder="https://yourserver.com/api/yourchannel/live"
        />
        <p style={{ fontSize: '.65rem', color: '#555', marginTop: 6, lineHeight: 1.5 }}>
          Base URL of your Magic Sentry channel endpoint, e.g.{' '}
          <code style={{ color: '#aaa' }}>https://yourserver.com/api/yourchannel/live</code>. The
          extension appends <code style={{ color: '#aaa' }}>/delta</code> to fetch incremental
          updates.
        </p>
      </div>

      {/* Poll interval */}
      <div>
        <Label>Poll interval (seconds)</Label>
        <Input
          type="number"
          value={String(cfg.pollIntervalSec)}
          onChange={(v) =>
            setCfg((c) => ({ ...c, pollIntervalSec: Math.max(1, parseInt(v) || 5) }))
          }
        />
        <p style={{ fontSize: '.65rem', color: '#555', marginTop: 6 }}>
          How often the extension fetches fresh data. 5 seconds is a good default.
        </p>
      </div>

      {/* Magic Sentry Token */}
      <div>
        <Label>Magic Sentry Token</Label>
        <Input
          value={cfg.token}
          onChange={(v) => setCfg((c) => ({ ...c, token: v }))}
          placeholder="Paste your token from the Magic Sentry Settings page"
        />
        <p style={{ fontSize: '.65rem', color: '#555', marginTop: 6, lineHeight: 1.5 }}>
          Log in at your Magic Sentry server, go to <strong>Settings</strong>, and copy the{' '}
          <strong>Twitch Extension Token</strong>. This lets the server attribute traffic to your
          account.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={testConnection}
          disabled={testing}
          style={{
            padding: '8px 16px',
            fontSize: '.72rem',
            fontFamily: 'monospace',
            background: '#12121a',
            border: '1px solid #2a2a3a',
            borderRadius: 4,
            color: '#888',
            cursor: testing ? 'wait' : 'pointer',
            letterSpacing: '.06em',
          }}
        >
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
        <button
          onClick={save}
          style={{
            padding: '8px 20px',
            fontSize: '.72rem',
            fontFamily: 'monospace',
            background: saved ? 'rgba(63,185,80,0.15)' : 'rgba(200,160,80,0.12)',
            border: saved ? '1px solid rgba(63,185,80,0.4)' : '1px solid rgba(200,160,80,0.4)',
            borderRadius: 4,
            color: saved ? '#3fb950' : '#c8a050',
            cursor: 'pointer',
            letterSpacing: '.06em',
            transition: 'all .15s',
          }}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            fontSize: '.68rem',
            fontFamily: 'monospace',
            background: testResult.ok ? 'rgba(63,185,80,0.08)' : 'rgba(255,0,0,0.08)',
            border: testResult.ok ? '1px solid rgba(63,185,80,0.3)' : '1px solid rgba(255,0,0,0.3)',
            color: testResult.ok ? '#3fb950' : '#ff7b72',
          }}
        >
          {testResult.msg}
        </div>
      )}

      {/* How-to */}
      <div
        style={{
          borderTop: '1px solid #1e1e26',
          paddingTop: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <p
          style={{
            fontSize: '.72rem',
            color: '#555',
            letterSpacing: '.06em',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          How it works
        </p>
        {[
          [
            '1',
            'Run Magic Sentry alongside your Warcraft III game to expose live observer data over HTTP.',
          ],
          [
            '2',
            "Enter the URL above (must be accessible from viewers' browsers or via a public tunnel like ngrok).",
          ],
          [
            '3',
            'Viewers will see a collapsible side panel with Gold, Lumber, Food, and Army charts updated in real-time.',
          ],
        ].map(([n, text]) => (
          <div key={n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: '.65rem',
                color: '#c8a050',
                fontFamily: 'monospace',
                width: 16,
                flexShrink: 0,
                paddingTop: 1,
              }}
            >
              {n}.
            </span>
            <span style={{ fontSize: '.68rem', color: '#666', lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
