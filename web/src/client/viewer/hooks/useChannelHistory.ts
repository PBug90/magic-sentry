import { useState, useEffect } from 'react'
export type { HistorySummary } from '@magic-sentry/viewer'
import type { HistorySummary } from '@magic-sentry/viewer'

export function useChannelHistory(channel: string): HistorySummary[] {
  const [history, setHistory] = useState<HistorySummary[]>([])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchHistory() {
      try {
        const res = await fetch(`/api/${channel}/history`, { signal: controller.signal })
        if (!res.ok) return
        const data: unknown = await res.json()
        if (Array.isArray(data)) setHistory(data as HistorySummary[])
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        // other errors: stale history is fine
      }
    }

    void fetchHistory()
    const id = setInterval(() => void fetchHistory(), 60_000)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [channel])

  return history
}
