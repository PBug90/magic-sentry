import { useState, useEffect, useRef, type CSSProperties } from 'react'
import { formatDuration } from '@magic-sentry/shared'
import type { GameRecord } from '@magic-sentry/shared'

export interface HistorySummary {
  public_id: string
  map: string
  is_final: boolean
  duration_ms: number
  players: { name: string; race: string; team: number; result: string }[]
}

interface GameHistoryDropdownProps {
  channel: string
  liveGame: GameRecord | null
  history: HistorySummary[]
  selectedHistoryId: string | null
  onSelect: (id: string | null) => void
}

function resultLabel(players: HistorySummary['players'], channel: string): { text: string; color: string } {
  const streamer = players.find((p) => p.name.toLowerCase() === channel.toLowerCase())
  if (!streamer || !streamer.result) return { text: 'abandoned', color: '#555' }
  if (streamer.result === 'Victory') {
    return { text: `${streamer.name} won`, color: '#3fb950' }
  }
  const winner = players.find((p) => p.result === 'Victory')
  return { text: winner ? `${winner.name} won` : 'defeat', color: '#ff7b72' }
}

function matchupLabel(players: { name: string; race: string }[]): string {
  return players.map((p) => `${p.name} (${p.race})`).join(' vs ')
}

export function GameHistoryDropdown({
  channel,
  liveGame,
  history,
  selectedHistoryId,
  onSelect,
}: GameHistoryDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (history.length === 0) return null

  const totalGames = 1 + history.length
  const foundIndex = selectedHistoryId
    ? history.findIndex((h) => h.public_id === selectedHistoryId)
    : -1
  const label = foundIndex >= 0 ? `Game ${foundIndex + 2} / ${totalGames}` : 'Live'

  const btnStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 9px 3px 11px',
    background: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: 2,
    fontFamily: 'monospace',
    fontSize: '.62em',
    color: selectedHistoryId ? '#c8a050' : '#888',
    cursor: 'pointer',
    letterSpacing: '.04em',
    userSelect: 'none',
  }

  const menuStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    top: '100%',
    width: 320,
    background: '#12121a',
    border: '1px solid #2a2a3a',
    borderRadius: '0 0 3px 3px',
    zIndex: 100,
    boxShadow: '0 8px 24px rgba(0,0,0,.5)',
  }

  const rowStyle = (selected: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderBottom: '1px solid #1a1a24',
    cursor: 'pointer',
    background: selected ? '#1a1508' : 'transparent',
  })

  const badgeStyle = (live: boolean): CSSProperties => ({
    fontSize: '.5em',
    letterSpacing: '.1em',
    padding: '2px 6px',
    borderRadius: 2,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    flexShrink: 0,
    width: 36,
    textAlign: 'center',
    ...(live
      ? { background: '#1e3a1e', border: '1px solid #3a6a3a', color: '#3fb950' }
      : { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#555' }),
  })

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={btnStyle} onClick={() => setOpen((o) => !o)}>
        {label} <span style={{ color: '#555', fontSize: '.9em' }}>▾</span>
      </div>

      {open && (
        <div style={menuStyle}>
          {/* Live game row */}
          <div
            style={{ ...rowStyle(!selectedHistoryId), borderBottom: '1px solid #1a1a24' }}
            onClick={() => { onSelect(null); setOpen(false) }}
          >
            <span style={badgeStyle(true)}>live</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: '.7em', color: '#ccc', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {liveGame ? matchupLabel(liveGame.players) : 'Loading…'}
              </span>
              <span style={{ fontSize: '.6em', color: '#555', fontFamily: 'monospace' }}>
                {liveGame?.map ?? ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: '.62em', color: '#555', fontFamily: 'monospace' }}>
                {liveGame ? formatDuration(liveGame.duration_ms) : ''}
              </span>
              <span style={{ fontSize: '.58em', color: '#555', fontFamily: 'monospace' }}>in progress</span>
            </div>
          </div>

          {/* History rows */}
          {history.map((item) => {
            const res = resultLabel(item.players, channel)
            const isSelected = item.public_id === selectedHistoryId
            return (
              <div
                key={item.public_id}
                style={rowStyle(isSelected)}
                onClick={() => { onSelect(item.public_id); setOpen(false) }}
              >
                <span style={badgeStyle(false)}>done</span>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: '.7em', color: '#ccc', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {matchupLabel(item.players)}
                  </span>
                  <span style={{ fontSize: '.6em', color: '#555', fontFamily: 'monospace' }}>
                    {item.map}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: '.62em', color: '#555', fontFamily: 'monospace' }}>
                    {formatDuration(item.duration_ms)}
                  </span>
                  <span style={{ fontSize: '.58em', color: res.color, fontFamily: 'monospace' }}>
                    {res.text}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
