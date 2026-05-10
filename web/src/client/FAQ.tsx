import { useState } from 'react'

interface QA {
  q: string
  a: React.ReactNode
}

function Section({ title, items }: { title: string; items: QA[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ marginBottom: 48 }}>
      <p className="section-title">{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              background: open === i ? 'var(--surface-2)' : 'var(--surface)',
              border: '1px solid var(--border)',
              borderColor: open === i ? 'var(--border-strong)' : 'var(--border)',
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '14px 18px',
                textAlign: 'left',
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                gap: 12,
              }}
            >
              <span style={{ fontWeight: 500 }}>{item.q}</span>
              <span
                style={{
                  flexShrink: 0,
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-data)',
                  fontSize: '0.75rem',
                  transition: 'transform 0.15s',
                  transform: open === i ? 'rotate(180deg)' : 'none',
                }}
              >
                ▾
              </span>
            </button>
            {open === i && (
              <div
                style={{
                  padding: '0 18px 16px',
                  color: 'var(--muted)',
                  fontSize: '0.97rem',
                  lineHeight: 1.75,
                  borderTop: '1px solid var(--border)',
                }}
              >
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const SECTIONS: { title: string; items: QA[] }[] = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'What is Magic Sentry?',
        a: (
          <p>
            Magic Sentry is a stat-tracking tool for Warcraft III. It reads live game data from WC3
            running on your machine and lets you review hero builds, resource curves, item stats,
            and army composition after each match. You can share games publicly, stream live data to
            a Twitch extension, or just generate a local HTML report for your own use.
          </p>
        ),
      },
      {
        q: 'What do I need to run it?',
        a: (
          <p>
            You need the Magic Sentry CLI app running on the same Windows PC as Warcraft III. No
            game files are modified — it reads data from WC3's shared memory. For streaming and the
            Twitch extension you also need an account here and a configured{' '}
            <code>magic-sentry.toml</code> file next to the CLI executable.
          </p>
        ),
      },
      {
        q: 'Which game modes are supported?',
        a: (
          <p>
            1v1 (two players) and 2v2 (four players) are fully supported. The CLI will detect the
            player count automatically and skip any game it cannot handle, showing a message like{' '}
            <code>3 players detected · Only 1v1 and 2v2 are supported</code>.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Local Reports',
    items: [
      {
        q: 'How do I get a local report?',
        a: (
          <p>
            Just run the Magic Sentry CLI while playing. When the game ends it automatically writes
            a <code>.html</code> file next to the CLI executable named after the players and map.
            You can also press <code>p</code> at any time to save a report and exit early. The
            terminal shows the filename under <strong>Report</strong> while the game is in progress.
          </p>
        ),
      },
      {
        q: 'The report is saved — how do I view it?',
        a: (
          <p>
            Open the <code>.html</code> file in any modern browser (Chrome, Firefox, Edge). No
            internet connection or web server is needed — all assets including icons are embedded
            directly in the file.
          </p>
        ),
      },
      {
        q: 'What does the report include?',
        a: (
          <ul style={{ margin: '10px 0', paddingLeft: 20 }}>
            <li>Hero builds with abilities, items, kills, and damage</li>
            <li>Per-player item purchase and collection stats</li>
            <li>Gold and lumber income curves over the match</li>
            <li>Food and supply usage over time</li>
            <li>Army composition snapshots</li>
            <li>APM history</li>
          </ul>
        ),
      },
      {
        q: 'The report opens but icons are missing',
        a: (
          <p>
            Make sure you are using the latest official CLI release. Icons are embedded in the
            executable at build time, so an incomplete or outdated build may be missing them.
            Downloading the current release from the project page should resolve it.
          </p>
        ),
      },
      {
        q: 'The report file is very large — is that normal?',
        a: (
          <p>
            Yes. Each report embeds ~460 icon images as base64 data alongside the full game JSON and
            the viewer JavaScript bundle. A typical report is 3–4 MB. This is intentional so the
            file is fully self-contained and works offline.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Streaming & Live Tracking',
    items: [
      {
        q: 'How does live streaming work?',
        a: (
          <p>
            The CLI pushes a compressed snapshot of the current game state to this server every 10
            seconds. Viewers can watch the game live from this site or through the Twitch extension.
            To enable streaming, sign in here, copy your CLI token from <strong>Settings</strong>,
            and paste it into a <code>magic-sentry.toml</code> file next to the CLI executable along
            with the server endpoint.
          </p>
        ),
      },
      {
        q: 'What should my magic-sentry.toml look like?',
        a: (
          <pre
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '0.82rem',
              background: 'rgba(200,160,80,0.06)',
              border: '1px solid var(--border)',
              padding: '12px 16px',
              margin: '10px 0 0',
              overflowX: 'auto',
            }}
          >{`endpoint = "https://magicsentry.gg"
secret   = "your-cli-token-from-settings"`}</pre>
        ),
      },
      {
        q: 'What does the Twitch extension show?',
        a: (
          <p>
            The panel extension lets your viewers browse the current game's heroes, resource curves,
            food usage, army composition, and APM in real time — directly on your Twitch channel
            page without leaving the stream. It refreshes automatically as new data arrives.
          </p>
        ),
      },
      {
        q: 'Can I stream without showing data publicly?',
        a: (
          <p>
            Not currently. All pushed games appear on your public channel page. If you only want
            local reports, simply omit the <code>magic-sentry.toml</code> file or leave the{' '}
            <code>endpoint</code> and <code>secret</code> fields empty — the CLI will still track
            and generate reports without sending anything.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Common Issues',
    items: [
      {
        q: 'WC3 is running but the CLI says "Waiting for Warcraft III"',
        a: (
          <p>
            The CLI reads WC3's shared memory, which W3Champions sometimes locks. If W3Champions is
            open, press <strong>F5</strong> inside W3Champions to reload it. The CLI should detect
            WC3 within a few seconds after that. Make sure you are running the CLI as the same
            Windows user as WC3.
          </p>
        ),
      },
      {
        q: 'The game was detected but the CLI says "waiting for hero/unit data"',
        a: (
          <p>
            This is normal at the very start of a match. WC3 populates hero and unit data a few
            seconds after the game clock starts running. The CLI will begin recording automatically
            once data appears — usually within the first 10–20 seconds.
          </p>
        ),
      },
      {
        q: 'The game appears stalled',
        a: (
          <p>
            The CLI detects a stall when the game clock stops advancing for several consecutive
            ticks. This can happen if WC3 is paused, if there is a lag or disconnect, or if the game
            has ended but the "game over" flag wasn't written cleanly. Press <code>p</code> to save
            the report with the data collected so far and exit.
          </p>
        ),
      },
      {
        q: 'Authorization failed on startup',
        a: (
          <p>
            Double-check that the <code>secret</code> in your <code>magic-sentry.toml</code> matches
            the CLI token shown in <strong>Settings</strong> — tokens are case-sensitive. Also
            verify the <code>endpoint</code> URL has no trailing slash and matches exactly what is
            shown on the settings page. Regenerating a new token in Settings will invalidate the old
            one.
          </p>
        ),
      },
      {
        q: 'My account shows "pending approval"',
        a: (
          <p>
            Access to push data to the server is gated by an allowlist. Sign in with Twitch and your
            account will be reviewed. Local reports work without an account — only streaming and the
            Twitch extension require approval.
          </p>
        ),
      },
    ],
  },
  {
    title: 'Account & Settings',
    items: [
      {
        q: 'What is the difference between a public token and a CLI token?',
        a: (
          <p>
            Your <strong>public token</strong> is used to construct the URL to your channel page and
            in the Twitch extension config — it is safe to share. Your <strong>CLI token</strong>{' '}
            (also called the secret) authenticates the CLI to push game data to the server — keep it
            private and treat it like a password.
          </p>
        ),
      },
      {
        q: 'How do I rotate my CLI token?',
        a: (
          <p>
            Go to <strong>Settings</strong> and click <em>Regenerate</em> next to your CLI token.
            The old token stops working immediately. Update <code>magic-sentry.toml</code> with the
            new value before starting the CLI again.
          </p>
        ),
      },
      {
        q: 'Does Magic Sentry read or modify my game files?',
        a: (
          <p>
            No. It only reads from WC3's shared memory region, which WC3 exposes specifically for
            observer tools. No game files, replays, or network traffic are touched.
          </p>
        ),
      },
    ],
  },
]

export function FAQPage({ onHome }: { onHome: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="app" style={{ maxWidth: 740 }}>
        <div style={{ paddingTop: 56, paddingBottom: 24 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onHome}
            style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            ← Back
          </button>
          <p className="hero-eyebrow">Help</p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: 'var(--text)',
              margin: '0 0 12px',
            }}
          >
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', margin: '0 0 52px' }}>
            Setup, features, and common issues.
          </p>
        </div>

        {SECTIONS.map((s) => (
          <Section key={s.title} title={s.title} items={s.items} />
        ))}
      </div>
    </div>
  )
}
