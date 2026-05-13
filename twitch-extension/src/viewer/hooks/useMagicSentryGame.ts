import { useState, useEffect, useRef, useCallback } from 'react'
import { buildGameRecord } from '@magic-sentry/shared'
import { GameRecord, GamePatch, ExtensionConfig } from '../../shared/types'

export function useMagicSentryGame(
  config: ExtensionConfig,
  configReady: boolean,
): {
  game: GameRecord | null
  fetchError: string | null
  lastUpdated: Date | null
  refresh: () => void
} {
  const [game, setGame] = useState<GameRecord | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const newGameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextUrlRef = useRef('')
  const currentGameIdRef = useRef<string | null>(null)
  const accumulatedPatchesRef = useRef(new Map<number, GamePatch>())

  // Checks the channel-level endpoint once for a new game. Resets nextUrlRef if
  // a different game_id is found so the next regular poll picks it up.
  const checkForNewGame = useCallback(async (baseUrl: string, token: string) => {
    if (!baseUrl || !currentGameIdRef.current) return
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    try {
      const res = await fetch(`${baseUrl}/after/-1`, { headers })
      if (!res.ok || res.status === 204) return
      const data = (await res.json()) as { patches: GamePatch[]; next: string }
      if (!data.patches.length) return
      if (data.patches[0].game_id !== currentGameIdRef.current) {
        nextUrlRef.current = `${baseUrl}/after/-1`
      }
    } catch {
      // ignore — next check will retry
    }
  }, [])

  // Returns true if a chunk was received (more may follow), false on 204 or error.
  const fetchDelta = useCallback(
    async (baseUrl: string, token: string): Promise<boolean> => {
      if (!baseUrl) return false
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      try {
        const res = await fetch(nextUrlRef.current, { headers })
        if (res.status === 204) {
          // Arm a one-shot check after 30s of silence so a new game is detected
          // even when the previous game ended without an is_final signal.
          if (currentGameIdRef.current && !newGameCheckTimeoutRef.current) {
            newGameCheckTimeoutRef.current = setTimeout(() => {
              newGameCheckTimeoutRef.current = null
              void checkForNewGame(baseUrl, token)
            }, 30_000)
          }
          return false
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { patches: GamePatch[]; next: string }

        let incoming = data.patches
        if (incoming.length === 0) return false

        // Patches are arriving — cancel any pending new-game check
        if (newGameCheckTimeoutRef.current) {
          clearTimeout(newGameCheckTimeoutRef.current)
          newGameCheckTimeoutRef.current = null
        }

        const origin = new URL(baseUrl).origin
        const incomingGameId = incoming[0].game_id

        if (incomingGameId !== currentGameIdRef.current) {
          // New game — discard accumulated state and re-fetch from the beginning
          accumulatedPatchesRef.current = new Map()
          currentGameIdRef.current = incomingGameId
          const startUrl = `${baseUrl}/after/-1`
          nextUrlRef.current = startUrl
          const res2 = await fetch(startUrl, { headers })
          if (res2.status === 204) return false
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`)
          const data2 = (await res2.json()) as { patches: GamePatch[]; next: string }
          incoming = data2.patches
          nextUrlRef.current = `${origin}${data2.next}`
        } else {
          nextUrlRef.current = `${origin}${data.next}`
        }

        for (const p of incoming) accumulatedPatchesRef.current.set(p.seq, p)

        const record = buildGameRecord(accumulatedPatchesRef.current)
        if (!record) return false

        setGame(record)
        setFetchError(null)
        setLastUpdated(new Date())
        return true
      } catch (e) {
        setFetchError(String(e))
        return false
      }
    },
    [checkForNewGame],
  )

  useEffect(() => {
    if (!configReady) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (newGameCheckTimeoutRef.current) {
      clearTimeout(newGameCheckTimeoutRef.current)
      newGameCheckTimeoutRef.current = null
    }

    // Reset chunk state whenever the endpoint or token changes
    nextUrlRef.current = config.endpointUrl ? `${config.endpointUrl}/after/-1` : ''
    currentGameIdRef.current = null
    accumulatedPatchesRef.current = new Map()

    if (!config.endpointUrl || !config.token) {
      setGame(null)
      setFetchError(null)
      return
    }

    async function catchUp() {
      while (await fetchDelta(config.endpointUrl, config.token)) {
        /* drain chain */
      }
    }

    void catchUp()
    intervalRef.current = setInterval(() => void catchUp(), config.pollIntervalSec * 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (newGameCheckTimeoutRef.current) clearTimeout(newGameCheckTimeoutRef.current)
    }
  }, [
    config.endpointUrl,
    config.pollIntervalSec,
    config.token,
    configReady,
    fetchDelta,
    refreshKey,
  ])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { game, fetchError, lastUpdated, refresh }
}
