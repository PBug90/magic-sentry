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
  allowed: boolean
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
          src="/magicsentry.webp"
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

function PendingApprovalNotice() {
  return (
    <div
      style={{
        border: '1px solid rgba(200,160,80,0.35)',
        background: 'rgba(200,160,80,0.07)',
        padding: '18px 22px',
        marginBottom: 32,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 8,
        }}
      >
        Invite only
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)' }}>
        Magic Sentry is currently invite-only. Your account has not been approved yet and you cannot
        use the service until it is. If you believe you should have access, reach out to the team.
      </p>
    </div>
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
          user.allowed ? (
            <>
              <PublicTokenSection user={user} />
              <TokenManager user={user} />
              <DataUsageSection user={user} />
            </>
          ) : (
            <PendingApprovalNotice />
          )
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

function GameCard({
  game,
  onView,
}: {
  game: GameSummary
  onView: (channel: string, gameId: string) => void
}) {
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
          onClick={() => onView(game.channel, game.game_id)}
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

function GameList({ onView }: { onView: (channel: string, gameId: string) => void }) {
  const [games, setGames] = useState<GameSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingGame, setLoadingGame] = useState<string | null>(null)

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

  async function loadExample(game: string) {
    setLoadingGame(game)
    try {
      const res = await fetch(`/api/load-example?game=${game}`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { channel, game_id } = await res.json()
      onView(channel as string, game_id as string)
    } catch (e) {
      console.error('Failed to load example:', e)
    } finally {
      setLoadingGame(null)
    }
  }

  const examples = [
    { game: 'all', label: 'All races (2v2)' },
    { game: 'hu-orc', label: 'Human vs Orc' },
    { game: 'ne-ud', label: 'Night Elf vs Undead' },
  ]

  return (
    <div>
      {error ? (
        <p className="status-error">Could not reach server: {error}</p>
      ) : games.length === 0 ? (
        <p className="status-empty">
          No live games right now. Start the Magic Sentry app to begin streaming.
        </p>
      ) : (
        <div className="game-grid">
          {games.map((g) => (
            <GameCard key={g.game_id} game={g} onView={onView} />
          ))}
        </div>
      )}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {examples.map(({ game, label }) => (
          <button
            key={game}
            className="btn btn-sm btn-ghost"
            onClick={() => loadExample(game)}
            disabled={loadingGame !== null}
          >
            {loadingGame === game ? 'Loading…' : label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Showcase mocks
// ---------------------------------------------------------------------------

function CliMock() {
  const kv = (k: string, v: string) => (
    <div style={{ display: 'flex', gap: 6, marginBottom: 1 }}>
      <span style={{ color: 'var(--accent)', minWidth: 68, flexShrink: 0 }}>{k}</span>
      <span>{v}</span>
    </div>
  )
  const players: [string, string, string, string, string][] = [
    ['Back2War', 'Human', '2840', '62/80', '145'],
    ['Grubby', 'Orc', '1480', '58/80', '112'],
  ]
  return (
    <div
      style={{
        fontFamily: 'var(--font-data)',
        fontSize: '0.58rem',
        lineHeight: 1.7,
        padding: '12px 14px',
        color: '#7a8c7a',
        height: '100%',
      }}
    >
      {kv('Map', 'TwistedMeadows')}
      {kv('Game', 'IEM Qualifier #4')}
      {kv('Time', '23:47')}
      {kv('Output', '1703abc-….json')}
      {kv('Endpoint', 'magic-sentry.io · ok 1s ago')}
      <div style={{ borderTop: '1px solid rgba(200,160,80,0.1)', margin: '8px 0 6px' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '5.2rem 3.6rem 3rem 3.5rem 2.8rem',
          gap: '0 2px',
          color: '#4a4a4a',
          marginBottom: 4,
        }}
      >
        <span>Player</span>
        <span>Race</span>
        <span style={{ textAlign: 'right' }}>Gold</span>
        <span style={{ textAlign: 'right' }}>Food</span>
        <span style={{ textAlign: 'right' }}>APM</span>
      </div>
      {players.map(([name, race, gold, food, apm]) => (
        <div
          key={name}
          style={{
            display: 'grid',
            gridTemplateColumns: '5.2rem 3.6rem 3rem 3.5rem 2.8rem',
            gap: '0 2px',
            marginBottom: 1,
          }}
        >
          <span style={{ color: '#ddd8c8', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </span>
          <span>{race}</span>
          <span style={{ textAlign: 'right' }}>{gold}</span>
          <span style={{ textAlign: 'right' }}>{food}</span>
          <span style={{ textAlign: 'right', color: 'var(--accent)' }}>{apm}</span>
        </div>
      ))}
    </div>
  )
}

function HeroCardMock({
  name,
  level,
  hp,
  mp,
  kills,
  color,
}: {
  name: string
  level: number
  hp: number
  mp: number
  kills: number
  color: string
}) {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(200,160,80,0.1)',
        padding: '8px 10px',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
        <div
          style={{
            width: 22,
            height: 22,
            background: `${color}18`,
            border: `1px solid ${color}44`,
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.54rem',
              letterSpacing: '0.07em',
              color: '#ddd8c8',
            }}
          >
            {name}
          </div>
          <div
            style={{ fontFamily: 'var(--font-data)', fontSize: '0.5rem', color: 'var(--accent)' }}
          >
            Lv.{level}
          </div>
        </div>
      </div>
      {[
        { label: 'HP', pct: hp, c: '#6ecf89' },
        { label: 'MP', pct: mp, c: '#5ba8c4' },
      ].map(({ label, pct, c }) => (
        <div key={label} style={{ marginBottom: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-data)',
              fontSize: '0.48rem',
              color: '#665f52',
              marginBottom: 2,
            }}
          >
            <span>{label}</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
            <div
              style={{ position: 'absolute', inset: 0, right: `${100 - pct}%`, background: c }}
            />
          </div>
        </div>
      ))}
      <div
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '0.48rem',
          color: '#665f52',
          marginTop: 5,
        }}
      >
        {kills} kills
      </div>
    </div>
  )
}

function DashboardMock() {
  const tabs = ['Heroes', 'Gold', 'Lumber', 'Food', 'Army']
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(200,160,80,0.1)',
          padding: '0 10px',
          gap: 1,
          flexShrink: 0,
        }}
      >
        {tabs.map((t, i) => (
          <div
            key={t}
            style={{
              padding: '5px 8px',
              fontFamily: 'var(--font-data)',
              fontSize: '0.5rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: i === 0 ? 'var(--accent)' : '#4a4a4a',
              borderBottom: i === 0 ? '1px solid var(--accent)' : '1px solid transparent',
              marginBottom: -1,
              cursor: 'default',
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px', display: 'flex', gap: 8, flex: 1, minHeight: 0 }}>
        <HeroCardMock name="Archmage" level={5} hp={84} mp={52} kills={8} color="#58a6ff" />
        <HeroCardMock name="Blademaster" level={4} hp={100} mp={67} kills={5} color="#ff7b72" />
      </div>
    </div>
  )
}

function ExtensionMock() {
  const tabs = ['Heroes', 'Gold', 'Lumber', 'Food', 'Army']
  const heroes = [
    { name: 'Archmage', level: 5, color: '#58a6ff', kills: 8, hp: 84 },
    { name: 'Blademaster', level: 4, color: '#ff7b72', kills: 5, hp: 100 },
  ]
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontSize: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderBottom: '1px solid rgba(200,160,80,0.1)',
          flexShrink: 0,
        }}
      >
        <img
          src="/magicsentry.webp"
          width={9}
          height={9}
          style={{ imageRendering: 'auto', flexShrink: 0 }}
          alt=""
        />
        <span
          style={{
            fontFamily: 'var(--font-data)',
            color: 'var(--accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Magic Sentry
        </span>
        <span style={{ color: '#2a2a3a' }}>·</span>
        <span style={{ color: '#ddd8c8', fontFamily: 'var(--font-body)' }}>TwistedMeadows</span>
        <span style={{ color: '#665f52', fontFamily: 'var(--font-data)' }}>23:47</span>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '4px 10px',
          borderBottom: '1px solid rgba(200,160,80,0.07)',
          flexShrink: 0,
        }}
      >
        {[
          ['T1', '#58a6ff', 'Back2War'],
          ['T2', '#ff7b72', 'Grubby'],
        ].map(([team, color, name]) => (
          <div
            key={team}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: '#12121a',
              border: '1px solid #1e1e2a',
              padding: '2px 6px',
              fontFamily: 'var(--font-data)',
            }}
          >
            <span style={{ color: '#555' }}>{team}</span>
            <div
              style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }}
            />
            <span style={{ color: '#ddd8c8' }}>{name}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(200,160,80,0.1)',
          padding: '0 10px',
          flexShrink: 0,
        }}
      >
        {tabs.map((t, i) => (
          <div
            key={t}
            style={{
              padding: '4px 7px',
              fontFamily: 'var(--font-data)',
              color: i === 0 ? 'var(--accent)' : '#4a4a4a',
              borderBottom: i === 0 ? '1px solid var(--accent)' : '1px solid transparent',
              marginBottom: -1,
              cursor: 'default',
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div style={{ padding: '8px 10px', flex: 1 }}>
        {heroes.map((h) => (
          <div
            key={h.name}
            style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                background: `${h.color}18`,
                border: `1px solid ${h.color}44`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 3,
                  fontFamily: 'var(--font-data)',
                }}
              >
                <span
                  style={{ color: '#ddd8c8', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {h.name}
                </span>
                <span style={{ color: 'var(--accent)' }}>Lv.{h.level}</span>
              </div>
              <div
                style={{
                  height: 3,
                  background: 'rgba(255,255,255,0.06)',
                  position: 'relative',
                  marginBottom: 3,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    right: `${100 - h.hp}%`,
                    background: '#6ecf89',
                  }}
                />
              </div>
              <span style={{ color: '#665f52', fontFamily: 'var(--font-data)' }}>
                {h.kills} kills
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShowcaseFrame({
  chromeLabel,
  label,
  sublabel,
  action,
  children,
}: {
  chromeLabel: string
  label: string
  sublabel: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="showcase-item">
      <div className="showcase-frame">
        <div className="showcase-chrome">
          <span className="showcase-chrome-title">{chromeLabel}</span>
        </div>
        <div className="showcase-content">{children}</div>
      </div>
      <div className="showcase-caption">
        <span className="showcase-caption-label">{label}</span>
        <span className="showcase-caption-sub">{sublabel}</span>
        {action}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------
// Screenshot gallery with lightbox
// ---------------------------------------------------------------------------

const SCREENSHOTS = [
  { src: '/screenshots/1.png', label: 'Gold economy over time' },
  { src: '/screenshots/2.png', label: 'Hero builds and upgrades' },
  { src: '/screenshots/3.png', label: 'Army composition comparison' },
]

function ScreenshotGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <>
      <section className="section">
        <h2 className="section-title">In Action</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {SCREENSHOTS.map(({ src, label }) => (
            <div key={src}>
              <button
                onClick={() => setLightbox(src)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: 0,
                  background: 'none',
                  border: '1px solid var(--border)',
                  cursor: 'zoom-in',
                  lineHeight: 0,
                }}
              >
                <img src={src} alt={label} style={{ width: '100%', display: 'block' }} />
              </button>
              <div
                style={{
                  paddingTop: 8,
                  fontSize: '0.78rem',
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-data)',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
            padding: 24,
          }}
        >
          <img
            src={lightbox}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
              boxShadow: '0 0 60px rgba(0,0,0,0.8)',
            }}
          />
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------

function LandingPage({
  user,
  logout,
  onView,
  onSettings,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
  onView: (channel: string, gameId: string) => void
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
            <p className="hero-eyebrow">Streamer companion for historic real time match data</p>
            <h1 className="hero-title">
              Every match detail.
              <br />
              Captured live.
            </h1>
            <p className="hero-subtitle">
              Real-time stats for WC3 streamers — heroes, resources, and army composition updating
              as the battle unfolds.
            </p>
            {user === undefined ? null : !user ? (
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
            ) : !user.allowed ? (
              <div className="hero-actions">
                <PendingApprovalNotice />
              </div>
            ) : null}
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

          {/* Showcase */}
          <section className="section">
            <h2 className="section-title">What You Get</h2>
            <div className="showcase-grid">
              <ShowcaseFrame
                chromeLabel="magic-sentry.exe"
                label="Desktop Companion"
                sublabel="Lightweight tray app captures game data as you play"
              >
                <CliMock />
              </ShowcaseFrame>
              <ShowcaseFrame
                chromeLabel="magic-sentry.io · dashboard"
                label="Web Dashboard"
                sublabel="Browse hero builds, resource curves, and army composition"
              >
                <DashboardMock />
              </ShowcaseFrame>
              <ShowcaseFrame
                chromeLabel="Twitch Extension · Overlay"
                label="Twitch Extension"
                sublabel="Viewers explore live stats without leaving the stream"
                action={
                  import.meta.env.VITE_EXTENSION_URL ? (
                    <a
                      href={import.meta.env.VITE_EXTENSION_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm"
                      style={{ marginTop: 10, textDecoration: 'none', display: 'inline-block' }}
                    >
                      Set up extension
                    </a>
                  ) : (
                    <button className="btn btn-sm" onClick={onSettings} style={{ marginTop: 10 }}>
                      Set up extension
                    </button>
                  )
                }
              >
                <ExtensionMock />
              </ShowcaseFrame>
            </div>
          </section>

          {/* Screenshots */}
          <ScreenshotGallery />

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
// Hash-based routing
// ---------------------------------------------------------------------------

type Route =
  | { type: 'home' }
  | { type: 'settings' }
  | { type: 'game'; channel: string; gameId: string }

function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '')
  if (path === '/settings') return { type: 'settings' }
  const m = path.match(/^\/game\/([^/]+)\/(.+)$/)
  if (m)
    return { type: 'game', channel: decodeURIComponent(m[1]), gameId: decodeURIComponent(m[2]) }
  return { type: 'home' }
}

function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((r: Route) => {
    if (r.type === 'home') window.location.hash = '/'
    else if (r.type === 'settings') window.location.hash = '/settings'
    else
      window.location.hash = `/game/${encodeURIComponent(r.channel)}/${encodeURIComponent(r.gameId)}`
  }, [])

  return [route, navigate]
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export default function App() {
  const { user, logout } = useMe()
  const [route, navigate] = useRoute()

  if (route.type === 'game') {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d14' }}>
        <NavBar
          user={user}
          logout={logout}
          onSettings={() => navigate({ type: 'settings' })}
          onHome={() => navigate({ type: 'home' })}
          showSettingsLink={true}
        />
        <GameViewer
          channel={route.channel}
          gameId={route.gameId}
          onBack={() => navigate({ type: 'home' })}
        />
      </div>
    )
  }

  if (route.type === 'settings') {
    return <SettingsPage user={user} logout={logout} onHome={() => navigate({ type: 'home' })} />
  }

  return (
    <LandingPage
      user={user}
      logout={logout}
      onView={(channel, gameId) => navigate({ type: 'game', channel, gameId })}
      onSettings={() => navigate({ type: 'settings' })}
    />
  )
}
