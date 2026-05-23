import type { TwitchUser } from './types'

const TwitchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
)

export function PendingApprovalNotice() {
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

export function NavBar({
  user,
  logout,
  onSettings,
  onHome,
  onFaq,
  onEncyclopedia,
  showSettingsLink,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
  onSettings: () => void
  onHome: () => void
  onFaq: () => void
  onEncyclopedia: () => void
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

      <button className="btn btn-ghost btn-sm" onClick={onFaq}>
        FAQ
      </button>

      <button className="btn btn-ghost btn-sm" onClick={onEncyclopedia}>
        Encyclopedia
      </button>

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
