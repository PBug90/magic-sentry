import { useEffect, useState } from 'react'
import type { GameSummary } from './types'

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

export function GameList({ onView }: { onView: (channel: string, gameId: string) => void }) {
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
    </div>
  )
}
