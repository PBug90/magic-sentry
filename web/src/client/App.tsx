import { useEffect, useState, useCallback } from 'react'
import { GameViewer } from './viewer/GameViewer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TwitchUser {
  id: string
  login: string
  display_name: string
  profile_image_url: string
}

interface CliToken {
  token: string
  label: string
  createdAt: string
}

interface GameSummary {
  game_id: string
  channel: string
  map: string
  game: string
  is_final: boolean
  latest_seq: number
  patch_count: number
  updated_at: string
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
// Shared nav bar
// ---------------------------------------------------------------------------

const TwitchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
)

function NavBar({
  user,
  logout,
  onSettings,
  onHome,
  showSettingsLink,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
  onSettings: () => void
  onHome: () => void
  showSettingsLink: boolean
}) {
  return (
    <div className="navbar">
      <button
        onClick={onHome}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 0,
        }}
      >
        <img
          src="/magicsentry.png"
          alt="Magic Sentry"
          width={24}
          height={24}
          style={{ imageRendering: 'auto' }}
        />
        <span className="navbar-brand">Magic Sentry</span>
      </button>

      <div style={{ flex: 1 }} />

      {showSettingsLink && user && (
        <button className="btn btn-ghost btn-sm" onClick={onSettings}>
          Settings
        </button>
      )}

      {user === undefined ? null : !user ? (
        <a
          href="/auth/twitch"
          className="btn btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}
        >
          <TwitchIcon />
          Sign in
        </a>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={user.profile_image_url}
            alt={user.display_name}
            width={26}
            height={26}
            style={{ borderRadius: '50%', border: '1px solid var(--border)' }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{user.display_name}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
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
            {`endpoint = "https://your-server/api/ingest"\nsecret   = "${newToken}"`}
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

function SettingsPage({
  user,
  logout,
  onHome,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
  onHome: () => void
}) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <NavBar
        user={user}
        logout={logout}
        onSettings={() => {}}
        onHome={onHome}
        showSettingsLink={false}
      />
      <div className="app" style={{ paddingTop: 48 }}>
        <h1 className="page-title">Settings</h1>
        {user ? (
          <>
            <PublicTokenSection user={user} />
            <TokenManager user={user} />
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
// Game list
// ---------------------------------------------------------------------------

function GameCard({ game, onView }: { game: GameSummary; onView: (channel: string) => void }) {
  const age = Math.floor((Date.now() - new Date(game.updated_at).getTime()) / 1000)
  const ageLabel =
    age < 60
      ? `${age}s ago`
      : age < 3600
        ? `${Math.floor(age / 60)}m ago`
        : `${Math.floor(age / 3600)}h ago`

  return (
    <div className="game-card">
      <div className="game-card-header">
        <span className="game-map">{game.map}</span>
        <span className={`badge ${game.is_final ? 'badge-done' : 'badge-live'}`}>
          {game.is_final ? 'Finished' : 'Live'}
        </span>
      </div>
      {game.game && <div className="game-name">{game.game}</div>}
      <div className="game-meta">
        {game.channel && <span>{game.channel}</span>}
        {game.channel && <span className="meta-sep">·</span>}
        <span>{ageLabel}</span>
      </div>
      <div className="game-actions">
        <button
          className="btn btn-sm"
          onClick={() => onView(game.channel)}
          disabled={!game.channel}
        >
          View
        </button>
        <a
          href={`/api/${game.channel}/live/full`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm btn-ghost"
        >
          JSON
        </a>
      </div>
    </div>
  )
}

function GameList({ onView }: { onView: (channel: string) => void }) {
  const [games, setGames] = useState<GameSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchGames() {
      try {
        const res = await fetch('/api/game')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) setGames(data)
      } catch (e) {
        if (!cancelled) setError(String(e))
      }
    }

    fetchGames()
    const id = setInterval(fetchGames, 5000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (error) return <p className="status-error">Could not reach server: {error}</p>
  if (games.length === 0) {
    return (
      <p className="status-empty">
        No live games right now. Start the Magic Sentry app to begin streaming.
      </p>
    )
  }

  return (
    <div className="game-grid">
      {games.map((g) => (
        <GameCard key={g.game_id} game={g} onView={onView} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------

function LandingPage({
  user,
  logout,
  onView,
  onSettings,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
  onView: (id: string) => void
  onSettings: () => void
}) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <NavBar
        user={user}
        logout={logout}
        onSettings={onSettings}
        onHome={() => {}}
        showSettingsLink={true}
      />
      <div className="app">
        <main className="main">
          {/* Hero */}
          <div className="hero">
            <p className="hero-eyebrow">Live Intelligence</p>
            <h1 className="hero-title">
              Every match detail.
              <br />
              Captured live.
            </h1>
            <p className="hero-subtitle">
              Real-time stats for WC3 streamers — heroes, resources, and army composition updating
              as the battle unfolds.
            </p>
            {user === undefined
              ? null
              : !user && (
                  <div className="hero-actions">
                    <a
                      href="/auth/twitch"
                      className="btn btn-lg btn-filled"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        textDecoration: 'none',
                      }}
                    >
                      <TwitchIcon />
                      Sign in with Twitch
                    </a>
                  </div>
                )}
          </div>

          {/* Features */}
          <section className="section">
            <div className="pillars">
              <div className="pillar">
                <div className="pillar-icon">⚔</div>
                <h3>Live Tracking</h3>
                <p>
                  Gold, lumber, APM, hero levels, and unit counts — captured continuously and
                  streamed in real time. Viewers can also scroll back through the full history of
                  the current match as it plays out.
                </p>
              </div>
              <div className="pillar pillar-featured">
                <div className="pillar-icon">📺</div>
                <h3>Twitch Extension</h3>
                <p>
                  A native Twitch extension lets viewers browse real-time match analytics directly
                  on your stream — heroes, resource curves, food, and army composition, all without
                  leaving the broadcast.
                </p>
              </div>
              <div className="pillar">
                <div className="pillar-icon">🖥</div>
                <h3>Local Analysis</h3>
                <p>
                  Run the Magic Sentry app locally to analyze your own games without streaming.
                  Browse hero builds, resource efficiency, and army composition from any match
                  played on your machine.
                </p>
              </div>
            </div>
          </section>

          {/* Games */}
          <section className="section" id="games">
            <div className="section-header">
              <h2 className="section-title">Live Games</h2>
              <span className="section-subtitle">updates every 5s</span>
            </div>
            <GameList onView={onView} />
          </section>
        </main>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

type Page = 'home' | 'settings'

export default function App() {
  const { user, logout } = useMe()
  const [page, setPage] = useState<Page>('home')
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  if (selectedChannel) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d14' }}>
        <NavBar
          user={user}
          logout={logout}
          onSettings={() => {
            setSelectedChannel(null)
            setPage('settings')
          }}
          onHome={() => setSelectedChannel(null)}
          showSettingsLink={true}
        />
        <GameViewer channel={selectedChannel} onBack={() => setSelectedChannel(null)} />
      </div>
    )
  }

  if (page === 'settings') {
    return <SettingsPage user={user} logout={logout} onHome={() => setPage('home')} />
  }

  return (
    <LandingPage
      user={user}
      logout={logout}
      onView={setSelectedChannel}
      onSettings={() => setPage('settings')}
    />
  )
}
