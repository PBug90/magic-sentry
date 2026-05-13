import { useState, useEffect, useRef, useCallback } from 'react'
import { buildGameRecord } from '@magic-sentry/shared'
import type { GameRecord, GamePatch } from '../../shared/types'

export function useMagicSentryGame(channel: string, gameId: string) {
  const [game, setGame] = useState<GameRecord | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextUrlRef = useRef('')
  const accumulatedPatchesRef = useRef(new Map<number, GamePatch>())

  const fetchDelta = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(nextUrlRef.current)
      if (res.status === 204) return false
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { patches: GamePatch[]; next: string }
      const incoming = data.patches
      if (incoming.length === 0) return false
      for (const p of incoming) accumulatedPatchesRef.current.set(p.seq, p)
      nextUrlRef.current = data.next

      const record = buildGameRecord(accumulatedPatchesRef.current)
      if (record) setGame(record)
      setFetchError(null)
      setLastUpdated(new Date())
      return true
    } catch (e) {
      setFetchError(String(e))
      return false
    }
  }, [])

  useEffect(() => {
    nextUrlRef.current = `/api/${channel}/live/${gameId}/after/-1`
    accumulatedPatchesRef.current = new Map()

    async function catchUp() {
      while (await fetchDelta()) {
        /* drain */
      }
    }

    void catchUp()
    intervalRef.current = setInterval(() => void catchUp(), 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [channel, gameId, fetchDelta, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { game, fetchError, lastUpdated, refresh }
}
