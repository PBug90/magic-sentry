import { sql } from './db.js'

export type TrafficType = 'ingest' | 'fetch'

interface Bucket {
  ingestCount: number
  ingestBytes: number
  fetchCount: number
  fetchBytes: number
}

function today(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

class TrafficStore {
  private pending = new Map<string, Bucket>()

  record(token: string, type: TrafficType, bytes: number): void {
    const key = `${token}::${today()}`
    let bucket = this.pending.get(key)
    if (!bucket) {
      bucket = { ingestCount: 0, ingestBytes: 0, fetchCount: 0, fetchBytes: 0 }
      this.pending.set(key, bucket)
    }
    if (type === 'ingest') {
      bucket.ingestCount++
      bucket.ingestBytes += bytes
    } else {
      bucket.fetchCount++
      bucket.fetchBytes += bytes
    }
  }

  async flush(): Promise<void> {
    if (this.pending.size === 0) return

    const entries = [...this.pending.entries()]
    this.pending.clear()

    await sql.begin((tx) =>
      entries.map(([key, b]) => {
        const sep = key.lastIndexOf('::')
        const token = key.slice(0, sep)
        const day = key.slice(sep + 2)
        return tx`
          INSERT INTO traffic_stats (token, day, ingest_count, ingest_bytes, fetch_count, fetch_bytes)
          VALUES (${token}, ${day}::date, ${b.ingestCount}, ${b.ingestBytes}, ${b.fetchCount}, ${b.fetchBytes})
          ON CONFLICT (token, day) DO UPDATE SET
            ingest_count = traffic_stats.ingest_count + EXCLUDED.ingest_count,
            ingest_bytes = traffic_stats.ingest_bytes + EXCLUDED.ingest_bytes,
            fetch_count  = traffic_stats.fetch_count  + EXCLUDED.fetch_count,
            fetch_bytes  = traffic_stats.fetch_bytes  + EXCLUDED.fetch_bytes
        `
      }),
    )
  }

  startFlushLoop(intervalMs = 10_000): void {
    setInterval(() => {
      this.flush().catch((err) => console.error('[traffic] flush error:', err))
    }, intervalMs)
  }
}

export const trafficStore = new TrafficStore()
