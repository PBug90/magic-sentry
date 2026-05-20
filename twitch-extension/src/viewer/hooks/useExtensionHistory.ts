import { useState, useEffect } from 'react'
import type { HistorySummary } from '@magic-sentry/viewer'

export function useExtensionHistory(endpointUrl: string): HistorySummary[] {
  const [history, setHistory] = useState<HistorySummary[]>([])

  useEffect(() => {
    setHistory([])
    if (!endpointUrl) return
    const controller = new AbortController()

    // endpointUrl is like https://host/api/:channel/live
    // history endpoint is https://host/api/:channel/history
    const historyUrl = endpointUrl.replace(/\/live(\/.*)?$/, '/history')

    async function fetchHistory() {
      try {
        const res = await fetch(historyUrl, { signal: controller.signal })
        if (!res.ok) return
        const data: unknown = await res.json()
        if (
          Array.isArray(data) &&
          (data.length === 0 || typeof (data[0] as any).public_id === 'string')
        ) {
          setHistory(data as HistorySummary[])
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }

    void fetchHistory()
    const id = setInterval(() => void fetchHistory(), 60_000)
    return () => {
      controller.abort()
      clearInterval(id)
    }
  }, [endpointUrl])

  return history
}
