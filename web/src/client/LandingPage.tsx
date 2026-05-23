import type { TwitchUser } from './types'
import { NavBar, PendingApprovalNotice } from './NavBar'
import { GameList } from './GameList'

export function LandingPage({
  user,
  logout,
  loginError,
  onView,
  onSettings,
  onFaq,
  onEncyclopedia,
}: {
  user: TwitchUser | null | undefined
  logout: () => void
  loginError: boolean
  onView: (channel: string, gameId: string) => void
  onSettings: () => void
  onFaq: () => void
  onEncyclopedia: () => void
}) {
  const downloadUrl =
    import.meta.env.VITE_DOWNLOAD_URL ?? 'https://github.com/PBug90/magic-sentry/releases'

  return (
    <div style={{ minHeight: '100vh' }}>
      <NavBar
        user={user}
        logout={logout}
        onSettings={onSettings}
        onHome={() => {}}
        onFaq={onFaq}
        onEncyclopedia={onEncyclopedia}
        showSettingsLink={true}
      />

      {/* Hero */}
      <section className="lp-hero">
        <h1 className="lp-h1">
          You commentate, <em>your viewers analyze</em>.
        </h1>
        <p className="lp-hero-sub">
          Magic Sentry reads WC3 shared memory — heroes, gold, army, APM — and streams it live to a
          Twitch panel your viewers can explore themselves. Let users explore secondary statistics
          like extensive item stats, crucial timings and more!
        </p>
        <div className="lp-hero-ctas">
          <a
            href={downloadUrl}
            className="btn btn-lg btn-filled"
            style={{ textDecoration: 'none' }}
          >
            ⬇ Download magic-sentry.exe
          </a>
          {user === undefined ? null : !user ? (
            <a
              href="/auth/twitch"
              className="btn btn-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
            >
              Sign in with Twitch
            </a>
          ) : !user.allowed ? (
            <PendingApprovalNotice />
          ) : null}
        </div>
        {loginError && (
          <p style={{ marginTop: 12, color: 'var(--danger)', fontSize: '0.85rem' }}>
            Sign-in failed. Please try again.
          </p>
        )}
        <p className="lp-platform-note">Windows · Free · No account required for local reports</p>
        <div className="lp-scroll">Scroll</div>
      </section>

      {/* Section: CLI */}
      <section className="lp-chapter">
        <div>
          <h2 className="lp-chapter-title">CLI</h2>
          <p className="lp-chapter-desc">
            Run magic-sentry.exe alongside WC3. It reads from shared memory and tracks the game as
            it progresses — no mods, no replay parsing.
          </p>
          <ul className="lp-features">
            <li>Heroes, gold, lumber, food, army, APM — captured every few seconds</li>
            <li>Works for observed games and replays</li>
            <li>Sends live updates to magicsentry.pro if you've set it up</li>
            <li>1v1 and 2v2 support</li>
          </ul>
          <div className="lp-chapter-ctas">
            <a
              href={downloadUrl}
              className="btn btn-lg btn-filled"
              style={{ textDecoration: 'none' }}
            >
              ⬇ Download magic-sentry.exe
            </a>
          </div>
        </div>
        <div>
          <TerminalMockup />
        </div>
      </section>

      <hr className="lp-divider" />

      {/* Section: Game Reports */}
      <section className="lp-chapter lp-reverse">
        <div>
          <h2 className="lp-chapter-title">Game Reports</h2>
          <p className="lp-chapter-desc">
            Every game gets saved as a standalone HTML file — no server, no account. Open it in a
            browser, send it to someone, done.
          </p>
          <ul className="lp-features">
            <li>Hero builds and ability progression per player</li>
            <li>Gold, lumber, food and army charts for the whole match</li>
            <li>Fight detection with a timeline of key engagements</li>
            <li>
              Press <code>p</code> mid-game to save, or it saves automatically when you close the
              CLI
            </li>
          </ul>
          <div className="lp-chapter-ctas">
            <a
              href="/reports/1779309471-InsoliTe(Undead)-Trof(Human)-Scrimmage.html"
              className="btn btn-lg"
              style={{ textDecoration: 'none' }}
              target="_blank"
              rel="noreferrer"
            >
              Open full report →
            </a>
          </div>
        </div>
        <div>
          <ReportWindowMockup />
        </div>
      </section>

      <hr className="lp-divider" />

      {/* Section: Twitch Extension */}
      <section className="lp-chapter">
        <div>
          <h2 className="lp-chapter-title">Twitch Extension</h2>
          <p className="lp-chapter-desc">
            Your viewers get a live stats panel in the extension overlay. They pick which tab to
            follow — you don't have to do anything once a game starts.
          </p>
          <ul className="lp-features">
            <li>Each viewer independently picks their tab: Heroes, Gold, Lumber, Food, Army</li>
            <li>Updates every 5 seconds — no interaction needed from the streamer</li>
            <li>Sign in once, paste a token in the CLI — setup is done</li>
            <li>Past games stay available between streams via the server's match history</li>
            <li>Collapsible panel with interactive crosshair and tooltips</li>
          </ul>
          <div className="lp-chapter-ctas">
            {import.meta.env.VITE_EXTENSION_URL ? (
              <a
                href={import.meta.env.VITE_EXTENSION_URL}
                className="btn btn-lg btn-filled"
                style={{ textDecoration: 'none' }}
                target="_blank"
                rel="noreferrer"
              >
                Install on Twitch →
              </a>
            ) : null}
            {user === null && (
              <a href="/auth/twitch" className="btn btn-lg" style={{ textDecoration: 'none' }}>
                Sign in with Twitch
              </a>
            )}
          </div>
        </div>
        <div>
          <ExtensionPanelsMockup />
        </div>
      </section>

      {/* Open Source */}
      <hr className="lp-divider" />
      <section
        className="lp-chapter"
        style={{ gridTemplateColumns: '1fr', maxWidth: 640, textAlign: 'center' }}
      >
        <div>
          <h2 className="lp-chapter-title">Open Source</h2>
          <p className="lp-chapter-desc">
            Magic Sentry is open source. Browse the code, report issues, or contribute on GitHub.
          </p>
          <div className="lp-chapter-ctas" style={{ justifyContent: 'center' }}>
            <a
              href="https://github.com/PBug90/magic-sentry"
              className="btn btn-lg"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
              }}
              target="_blank"
              rel="noreferrer"
            >
              <GitHubIcon />
              PBug90/magic-sentry
            </a>
          </div>
        </div>
      </section>

      {/* Live Games */}
      <hr className="lp-divider" />
      <div className="lp-live-section">
        <div className="lp-live-header">
          <div className="lp-live-eyebrow">Live Now</div>
          <h2 className="lp-live-title">
            <span className="lp-live-dot" />
            Games in Progress
          </h2>
        </div>
        <GameList onView={onView} />
      </div>
    </div>
  )
}

function TerminalMockup() {
  return (
    <div className="lp-terminal">
      <div className="lp-terminal-bar">
        <div className="lp-terminal-dot" style={{ background: '#ff5f57' }} />
        <div className="lp-terminal-dot" style={{ background: '#febc2e' }} />
        <div className="lp-terminal-dot" style={{ background: '#28c840' }} />
        <div className="lp-terminal-title">magic-sentry.exe</div>
      </div>
      <div className="lp-terminal-body">
        <span className="lp-t-label">Map </span>
        <span className="lp-t-val"> TwistedMeadows</span>
        <br />
        <span className="lp-t-label">Time </span>
        <span className="lp-t-val"> 23:47</span>
        <br />
        <span className="lp-t-label">Output </span>
        <span className="lp-t-val"> 1703abc-….html</span>
        <br />
        <span className="lp-t-green">Server </span>
        <span className="lp-t-green"> magicsentry.pro · ok</span>
        <br />
        <br />
        <span className="lp-t-dim">{'────────────────────────────────'}</span>
        <br />
        <div className="lp-t-row">
          <span className="lp-t-col lp-t-accent">Player</span>
          <span className="lp-t-col2 lp-t-accent">Race</span>
          <span className="lp-t-col2 lp-t-accent">Gold</span>
          <span className="lp-t-col2 lp-t-accent">APM</span>
        </div>
        <span className="lp-t-dim">{'────────────────────────────────'}</span>
        <br />
        <div className="lp-t-row">
          <span className="lp-t-col lp-t-val">Grubby</span>
          <span className="lp-t-col2 lp-t-muted">Orc</span>
          <span className="lp-t-col2 lp-t-val">2840</span>
          <span className="lp-t-col2 lp-t-val">145</span>
        </div>
        <div className="lp-t-row">
          <span className="lp-t-col lp-t-val">Back2Warcraft</span>
          <span className="lp-t-col2 lp-t-muted">Human</span>
          <span className="lp-t-col2 lp-t-val">1480</span>
          <span className="lp-t-col2 lp-t-val">112</span>
        </div>
        <br />
        <span className="lp-t-muted">Press p to save · Ctrl+C to exit</span>
      </div>
    </div>
  )
}

function ReportWindowMockup() {
  return (
    <div className="lp-report-window">
      <div className="lp-report-titlebar">
        <div className="lp-report-titlebar-dots">
          <div className="lp-report-titlebar-dot" style={{ background: '#ff5f57' }} />
          <div className="lp-report-titlebar-dot" style={{ background: '#febc2e' }} />
          <div className="lp-report-titlebar-dot" style={{ background: '#28c840' }} />
        </div>
        <div className="lp-report-titlebar-label">
          1703abc-Grubby(Orc)-Back2Warcraft(Human)-TwistedMeadows.html
        </div>
      </div>
      <div className="lp-report-header">
        <div className="lp-report-logo">Magic Sentry</div>
        <div className="lp-report-game-info">
          <div className="lp-report-map">TwistedMeadows</div>
          <div className="lp-report-duration">23:47 · 2 players</div>
        </div>
      </div>
      <div className="lp-report-tabs">
        <div className="lp-report-tab active">Heroes</div>
        <div className="lp-report-tab">Gold</div>
        <div className="lp-report-tab">Army</div>
        <div className="lp-report-tab">Fights</div>
      </div>
      <div className="lp-report-body">
        <div className="lp-hero-cards">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.56rem',
                letterSpacing: '0.1em',
                color: 'rgba(200,160,80,0.35)',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Grubby · Orc
            </div>
            <div className="lp-hero-card">
              <div className="lp-hero-card-top">
                <div className="lp-hero-portrait">⚔</div>
                <div>
                  <div className="lp-hero-name">Far Seer</div>
                  <div className="lp-hero-level">Lv 10</div>
                </div>
              </div>
              <div className="lp-hero-stats">
                <span className="lp-hstat">
                  K <span>12</span>
                </span>
                <span className="lp-hstat">
                  D <span>3</span>
                </span>
                <span className="lp-hstat">
                  XP <span>8420</span>
                </span>
              </div>
              <div className="lp-ability-row">
                <div className="lp-ability-pip filled">⚡</div>
                <div className="lp-ability-pip filled">🌊</div>
                <div className="lp-ability-pip filled">👁</div>
                <div className="lp-ability-pip filled">🌀</div>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.56rem',
                letterSpacing: '0.1em',
                color: 'rgba(80,144,200,0.35)',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Back2Warcraft · Human
            </div>
            <div className="lp-hero-card">
              <div className="lp-hero-card-top">
                <div className="lp-hero-portrait">🛡</div>
                <div>
                  <div className="lp-hero-name">Archmage</div>
                  <div className="lp-hero-level">Lv 8</div>
                </div>
              </div>
              <div className="lp-hero-stats">
                <span className="lp-hstat">
                  K <span>7</span>
                </span>
                <span className="lp-hstat">
                  D <span>5</span>
                </span>
                <span className="lp-hstat">
                  XP <span>5890</span>
                </span>
              </div>
              <div className="lp-ability-row">
                <div className="lp-ability-pip filled">❄</div>
                <div className="lp-ability-pip filled">🔥</div>
                <div className="lp-ability-pip filled">🌟</div>
                <div className="lp-ability-pip">·</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="lp-chart-label">Gold mined over time</div>
          <div className="lp-mini-chart">
            <svg viewBox="0 0 300 50" preserveAspectRatio="none">
              <polyline
                points="0,48 40,40 80,30 120,20 160,12 200,8 240,6 280,4 300,3"
                fill="none"
                stroke="rgba(200,160,80,0.6)"
                strokeWidth="1.5"
              />
              <polyline
                points="0,49 40,46 80,40 120,32 160,26 200,20 240,16 280,14 300,12"
                fill="none"
                stroke="rgba(80,144,200,0.5)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExtensionPanelsMockup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div className="lp-ext-panels">
        {/* Viewer 1 - Heroes tab (secondary/background) */}
        <div className="lp-ext-panel secondary">
          <div className="lp-ext-header">
            <div className="lp-ext-dot" />
            <div className="lp-ext-logo">Magic Sentry</div>
            <div className="lp-ext-map">viewer 1</div>
          </div>
          <div className="lp-ext-tabs">
            <div className="lp-ext-tab active">Heroes</div>
            <div className="lp-ext-tab">Gold</div>
            <div className="lp-ext-tab">Lumber</div>
            <div className="lp-ext-tab">Food</div>
            <div className="lp-ext-tab">Army</div>
          </div>
          <div className="lp-ext-body">
            <div className="lp-ext-legend" style={{ gap: 6 }}>
              <div
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '0.56rem',
                  color: '#6a5a40',
                  marginBottom: 3,
                }}
              >
                Grubby · Orc
              </div>
              <div className="lp-ext-legend-row">
                <div className="lp-ext-legend-dot" style={{ background: '#c8a050' }} />
                <div className="lp-ext-legend-name">Far Seer</div>
                <div className="lp-ext-legend-val">Lv 10</div>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '0.56rem',
                  color: '#4a6a90',
                  marginTop: 5,
                  marginBottom: 3,
                }}
              >
                Back2Warcraft · Human
              </div>
              <div className="lp-ext-legend-row">
                <div className="lp-ext-legend-dot" style={{ background: '#5090d0' }} />
                <div className="lp-ext-legend-name">Archmage</div>
                <div className="lp-ext-legend-val">Lv 8</div>
              </div>
            </div>
          </div>
        </div>

        {/* Viewer 2 - Gold tab (primary/foreground) */}
        <div className="lp-ext-panel">
          <div className="lp-ext-header">
            <div className="lp-ext-dot" />
            <div className="lp-ext-logo">Magic Sentry</div>
            <div className="lp-ext-map">viewer 2</div>
          </div>
          <div className="lp-ext-tabs">
            <div className="lp-ext-tab">Heroes</div>
            <div className="lp-ext-tab active">Gold</div>
            <div className="lp-ext-tab">Lumber</div>
            <div className="lp-ext-tab">Food</div>
            <div className="lp-ext-tab">Army</div>
          </div>
          <div className="lp-ext-body">
            <div className="lp-ext-chart">
              <svg viewBox="0 0 210 55" preserveAspectRatio="none">
                <polyline
                  points="0,52 30,45 60,36 90,24 120,16 150,10 180,12 210,6"
                  fill="none"
                  stroke="rgba(200,160,80,0.7)"
                  strokeWidth="1.5"
                />
                <polyline
                  points="0,54 30,51 60,47 90,41 120,35 150,30 180,27 210,24"
                  fill="none"
                  stroke="rgba(80,144,200,0.6)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div className="lp-ext-legend">
              <div className="lp-ext-legend-row">
                <div className="lp-ext-legend-dot" style={{ background: '#c8a050' }} />
                <div className="lp-ext-legend-name">Grubby</div>
                <div className="lp-ext-legend-val">2,840</div>
              </div>
              <div className="lp-ext-legend-row">
                <div className="lp-ext-legend-dot" style={{ background: '#5090d0' }} />
                <div className="lp-ext-legend-name">Back2Warcraft</div>
                <div className="lp-ext-legend-val">1,480</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-ext-caption">Each viewer chooses their own view</div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.562 21.8 24 17.302 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
