import { sql } from './db.js'

export type TrafficType = 'ingest' | 'fetch'

interface Bucket {
  ingestCount: number
  ingestBytesRaw: number
  ingestBytesWire: number
  fetchCount: number
  fetchBytesRaw: number
  fetchBytesWire: number
}

function today(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

class TrafficStore {
  private pending = new Map<string, Bucket>()

  record(token: string, type: TrafficType, rawBytes: number, wireBytes: number): void {
    const key = `${token}::${today()}`
    let bucket = this.pending.get(key)
    if (!bucket) {
      bucket = {
        ingestCount: 0,
        ingestBytesRaw: 0,
        ingestBytesWire: 0,
        fetchCount: 0,
        fetchBytesRaw: 0,
        fetchBytesWire: 0,
      }
      this.pending.set(key, bucket)
    }
    if (type === 'ingest') {
      bucket.ingestCount++
      bucket.ingestBytesRaw += rawBytes
      bucket.ingestBytesWire += wireBytes
    } else {
      bucket.fetchCount++
      bucket.fetchBytesRaw += rawBytes
      bucket.fetchBytesWire += wireBytes
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
          INSERT INTO traffic_stats (token, day, ingest_count, ingest_bytes_raw, ingest_bytes_wire, fetch_count, fetch_bytes_raw, fetch_bytes_wire)
          VALUES (${token}, ${day}::date, ${b.ingestCount}, ${b.ingestBytesRaw}, ${b.ingestBytesWire}, ${b.fetchCount}, ${b.fetchBytesRaw}, ${b.fetchBytesWire})
          ON CONFLICT (token, day) DO UPDATE SET
            ingest_count      = traffic_stats.ingest_count      + EXCLUDED.ingest_count,
            ingest_bytes_raw  = traffic_stats.ingest_bytes_raw  + EXCLUDED.ingest_bytes_raw,
            ingest_bytes_wire = traffic_stats.ingest_bytes_wire + EXCLUDED.ingest_bytes_wire,
            fetch_count       = traffic_stats.fetch_count       + EXCLUDED.fetch_count,
            fetch_bytes_raw   = traffic_stats.fetch_bytes_raw   + EXCLUDED.fetch_bytes_raw,
            fetch_bytes_wire  = traffic_stats.fetch_bytes_wire  + EXCLUDED.fetch_bytes_wire
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
