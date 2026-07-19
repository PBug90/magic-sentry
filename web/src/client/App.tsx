import { useEffect, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { GameViewer } from './viewer/GameViewer'
import { EncyclopediaPage } from './viewer/EncyclopediaPage'
import { LayoutChecker } from './LayoutChecker'
import { FAQPage } from './FAQ'
import type { TwitchUser } from './types'
import { NavBar, PendingApprovalNotice } from './NavBar'
import { LandingPage } from './LandingPage'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CliToken {
  token: string
  label: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// Auth hook
// ---------------------------------------------------------------------------

function useMe() {
  const [user, setUser] = useState<TwitchUser | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => setUser(null))
  }, [])

  const logout = useCallback(async () => {
    await fetch('/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  return { user, setUser, logout }
}

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------

function TokenManager({ user }: { user: TwitchUser }) {
  const [tokens, setTokens] = useState<CliToken[]>([])
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [label, setLabel] = useState('')

  useEffect(() => {
    fetch('/api/tokens')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTokens(data)
      })
  }, [user.id])

  async function generate() {
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: label.trim() || undefined }),
    })
    if (!res.ok) return
    const { token, label: returnedLabel } = await res.json()
    setTokens((prev) => [
      ...prev,
      { token, label: returnedLabel, createdAt: new Date().toISOString() },
    ])
    setNewToken(token)
    setLabel('')
    setCopied(false)
  }

  async function revoke(token: string) {
    const res = await fetch(`/api/tokens/${token}`, { method: 'DELETE' })
    if (!res.ok) return
    setTokens((prev) => prev.filter((t) => t.token !== token))
    if (newToken === token) setNewToken(null)
  }

  function copy(token: string) {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="section">
      <h2 className="section-title">Access Tokens</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, marginTop: -10 }}>
        Connect the Magic Sentry desktop app to your account by adding a token to your config file.
      </p>

      {newToken && (
        <div className="token-reveal">
          <div className="token-reveal-label">
            Token generated — copy it now, it will not be shown again.
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code
              style={{
                flex: 1,
                wordBreak: 'break-all',
                fontSize: '0.8rem',
                background: 'transparent',
                border: 'none',
                padding: 0,
              }}
            >
              {newToken}
            </code>
            <button className="btn btn-sm" onClick={() => copy(newToken)}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--muted)' }}>
            Add to your config file:
          </div>
          <pre className="code-block">
            {`endpoint = "https://magicsentry.pro/api/ingest"\nsecret   = "${newToken}"`}
          </pre>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') generate()
          }}
          className="token-input"
        />
        <button className="btn" onClick={generate}>
          Generate token
        </button>
      </div>

      {tokens.length > 0 && (
        <div className="token-table">
          {tokens.map((t) => (
            <div key={t.token} className="token-row">
              <span style={{ flex: 1, fontSize: '0.85rem' }}>{t.label}</span>
              <code style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                {t.token.slice(0, 6)}…{t.token.slice(-4)}
              </code>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-data)',
                  flexShrink: 0,
                }}
              >
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
              <button className="btn btn-sm btn-ghost" onClick={() => copy(t.token)}>
                Copy
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => revoke(t.token)}>
                Revoke
              </button>
            </div>
          ))}
        </div>
      )}

      {tokens.length === 0 && !newToken && <p className="status-empty">No tokens yet.</p>}
    </section>
  )
}

function PublicTokenSection({ user }: { user: TwitchUser }) {
  const [token, setToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/public-token')
      .then((r) => r.json())
      .then(({ token }) => {
        if (token) setToken(token)
      })
  }, [user.id])

  function copy() {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="section">
      <h2 className="section-title">Extension Token</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, marginTop: -10 }}>
        Add this to your Twitch extension settings to enable traffic tracking for your channel.
      </p>

      {token ? (
        <div className="token-reveal">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <code style={{ flex: 1, wordBreak: 'break-all', fontSize: '0.8rem' }}>{token}</code>
            <button className="btn btn-sm" onClick={copy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Open your extension's <strong style={{ color: 'var(--text)' }}>Configure</strong> page
            and paste this into the{' '}
            <strong style={{ color: 'var(--text)' }}>Magic Sentry Token</strong> field.
          </div>
        </div>
      ) : (
        <p className="status-empty">Loading…</p>
      )}
    </section>
  )
}

interface TrafficRow {
  day: string
  ingestCount: number
  ingestBytesRaw: number
  ingestBytesWire: number
  fetchCount: number
  fetchBytesRaw: number
  fetchBytesWire: number
}

function fmtBytes(n: number): string {
  if (n === 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function DataUsageSection({ user }: { user: TwitchUser }) {
  const [rows, setRows] = useState<TrafficRow[] | null>(null)

  useEffect(() => {
    fetch('/api/traffic')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data)
      })
      .catch(() => setRows([]))
  }, [user.id])

  const totalIngest = rows?.reduce((s, r) => s + r.ingestBytesWire, 0) ?? 0
  const totalFetch = rows?.reduce((s, r) => s + r.fetchBytesWire, 0) ?? 0

  return (
    <section className="section">
      <h2 className="section-title">Data Usage</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, marginTop: -10 }}>
        Network traffic across all your tokens for the past 30 days.
      </p>

      {rows === null ? (
        <p className="status-empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="status-empty">No traffic recorded yet.</p>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Uploaded (30d)', value: fmtBytes(totalIngest) },
              { label: 'Downloaded (30d)', value: fmtBytes(totalFetch) },
              { label: 'Active days', value: String(rows.length) },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  flex: '1 1 120px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: '14px 18px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: '1.1rem',
                    color: 'var(--accent)',
                    marginBottom: 4,
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="token-table">
            <div className="token-row" style={{ opacity: 0.45, fontSize: '0.75rem' }}>
              <span style={{ flex: '0 0 90px', fontFamily: 'var(--font-data)' }}>Date</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Uploads</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Downloads</span>
              <span style={{ flex: '0 0 60px', textAlign: 'right' }}>Requests</span>
            </div>
            {rows.map((r) => (
              <div key={r.day} className="token-row">
                <span
                  style={{
                    flex: '0 0 90px',
                    fontFamily: 'var(--font-data)',
                    fontSize: '0.8rem',
                    color: 'var(--muted)',
                  }}
                >
                  {r.day}
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: 'right',
                    fontFamily: 'var(--font-data)',
                    fontSize: '0.82rem',
                  }}
                >
                  {fmtBytes(r.ingestBytesWire)}
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: 'right',
                    fontFamily: 'var(--font-data)',
                    fontSize: '0.82rem',
                  }}
                >
                  {fmtBytes(r.fetchBytesWire)}
                </span>
                <span
                  style={{
                    flex: '0 0 60px',
                    textAlign: 'right',
                    fontFamily: 'var(--font-data)',
                    fontSize: '0.78rem',
                    color: 'var(--muted)',
                  }}
                >
                  {r.ingestCount + r.fetchCount}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

interface PatreonState {
  linked: boolean
  active: boolean
  tierId: string | null
  tierName: string | null
}

function PatreonSection() {
  const [status, setStatus] = useState<PatreonState | null>(null)
  const [flash] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('patreon')
    if (p) window.history.replaceState(null, '', window.location.pathname)
    return p
  })

  const load = useCallback(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) =>
        setStatus(d.patreon ?? { linked: false, active: false, tierId: null, tierName: null }),
      )
      .catch(() => setStatus({ linked: false, active: false, tierId: null, tierName: null }))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function disconnect() {
    await fetch('/auth/patreon/disconnect', { method: 'POST' })
    load()
  }

  const flashMsg =
    flash === 'connected'
      ? { ok: true, text: 'Patreon connected.' }
      : flash === 'already_linked'
        ? { ok: false, text: 'That Patreon account is already linked to another user.' }
        : flash === 'error'
          ? { ok: false, text: 'Could not connect Patreon. Please try again.' }
          : null

  return (
    <section className="section">
      <h2 className="section-title">Patreon</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 24, marginTop: -10 }}>
        Connect your Patreon to unlock access automatically while your membership is active.
      </p>

      {flashMsg && (
        <p style={{ color: flashMsg.ok ? 'var(--accent)' : '#e06c6c', marginBottom: 16 }}>
          {flashMsg.text}
        </p>
      )}

      {status === null ? (
        <p className="status-empty">Loading…</p>
      ) : status.linked ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem' }}>
            Linked ·{' '}
            <strong style={{ color: status.active ? 'var(--accent)' : 'var(--muted)' }}>
              {status.active ? 'active patron' : 'inactive'}
            </strong>
            {(status.tierName ?? status.tierId) ? (
              <span style={{ color: 'var(--muted)' }}> · {status.tierName ?? status.tierId}</span>
            ) : null}
          </span>
          <button className="btn btn-sm btn-danger" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <a className="btn" href="/auth/patreon">
          Connect Patreon
        </a>
      )}
    </section>
  )
}

function SettingsPage({
  user,
  logout,
  onHome,
  onFaq,
  onEncyclopedia,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
  onHome: () => void
  onFaq: () => void
  onEncyclopedia: () => void
}) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <NavBar
        user={user}
        logout={logout}
        onSettings={() => {}}
        onHome={onHome}
        onFaq={onFaq}
        onEncyclopedia={onEncyclopedia}
        showSettingsLink={false}
      />
      <div className="app" style={{ paddingTop: 48 }}>
        <h1 className="page-title">Settings</h1>
        {user ? (
          <>
            <PatreonSection />
            {user.allowed ? (
              <>
                <PublicTokenSection user={user} />
                <TokenManager user={user} />
                <DataUsageSection user={user} />
              </>
            ) : (
              <PendingApprovalNotice />
            )}
          </>
        ) : (
          <p className="status-empty">
            <a href="/auth/twitch">Sign in with Twitch</a> to manage your account.
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Route components
// ---------------------------------------------------------------------------

function GameViewerRoute({
  user,
  logout,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
}) {
  const { channel, gameId } = useParams<{ channel: string; gameId: string }>()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d14' }}>
      <NavBar
        user={user}
        logout={logout}
        onSettings={() => navigate('/settings')}
        onHome={() => navigate('/')}
        onFaq={() => navigate('/faq')}
        onEncyclopedia={() => navigate('/encyclopedia')}
        showSettingsLink={true}
      />
      <GameViewer
        channel={channel!}
        gameId={gameId!}
        onBack={() => navigate('/')}
        onLayoutCheck={() =>
          navigate(`/layout-check/${encodeURIComponent(channel!)}/${encodeURIComponent(gameId!)}`)
        }
      />
    </div>
  )
}

function LayoutCheckerRoute() {
  const { channel, gameId } = useParams<{ channel: string; gameId: string }>()
  const navigate = useNavigate()

  return (
    <LayoutChecker
      channel={channel!}
      gameId={gameId!}
      onBack={() =>
        navigate(`/game/${encodeURIComponent(channel!)}/${encodeURIComponent(gameId!)}`)
      }
    />
  )
}

function EncyclopediaRoute({
  user,
  logout,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
}) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d14' }}>
      <NavBar
        user={user}
        logout={logout}
        onSettings={() => navigate('/settings')}
        onHome={() => navigate('/')}
        onFaq={() => navigate('/faq')}
        onEncyclopedia={() => {}}
        showSettingsLink={true}
      />
      <EncyclopediaPage />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function AppRoutes() {
  const { user, logout } = useMe()
  const navigate = useNavigate()
  const [loginError] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'error') {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash)
      return true
    }
    return false
  })

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            user={user}
            logout={logout}
            loginError={loginError}
            onView={(channel, gameId) =>
              navigate(`/game/${encodeURIComponent(channel)}/${encodeURIComponent(gameId)}`)
            }
            onSettings={() => navigate('/settings')}
            onFaq={() => navigate('/faq')}
            onEncyclopedia={() => navigate('/encyclopedia')}
          />
        }
      />
      <Route
        path="/settings"
        element={
          <SettingsPage
            user={user}
            logout={logout}
            onHome={() => navigate('/')}
            onFaq={() => navigate('/faq')}
            onEncyclopedia={() => navigate('/encyclopedia')}
          />
        }
      />
      <Route path="/faq" element={<FAQPage onHome={() => navigate('/')} />} />
      <Route path="/encyclopedia" element={<EncyclopediaRoute user={user} logout={logout} />} />
      <Route
        path="/game/:channel/:gameId"
        element={<GameViewerRoute user={user} logout={logout} />}
      />
      <Route path="/layout-check/:channel/:gameId" element={<LayoutCheckerRoute />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
