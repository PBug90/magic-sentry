# Caching Design

Live game data needs to reach potentially thousands of concurrent viewers with minimal server load. This document describes the chunk stream protocol and the CDN caching strategy that makes it work.

---

## Problem

The original endpoints (`/live/full`, `/live/delta?since=N`) used short-lived cache headers:

```
Cache-Control: public, max-age=4, stale-while-revalidate=2
```

### Cloudflare free plan incompatibility

Cloudflare's free plan enforces a **2-hour minimum Edge Cache TTL**. Any response with `max-age` below 7200 seconds is silently treated as uncacheable regardless of Cache Rules configuration, resulting in `CF-Cache-Status: DYNAMIC` on every request. The server absorbs every viewer poll directly.

**Note on `Vary: Origin`:** Hono's CORS middleware unconditionally adds `Vary: Origin` to all `/api/*` responses. This was initially suspected as the cause of `DYNAMIC` status, but Cloudflare's documentation confirms that `Vary: Origin` does not affect their caching decisions. The 2-hour TTL floor was the real problem.

### Scale

At 2000 concurrent viewers polling every 5 seconds that is 400 requests/second to the origin. With a working CDN and a 4-second chunk window roughly 1600 requests share a single cached response — approximately 99.9% cache hit rate. Without CDN caching, all 400 req/s hit the server.

---

## Solution: Sealed Immutable Chunk Stream

Rather than short-lived mutable responses, the server produces a **linked list of immutable chunks**. Each chunk is sealed the first time it is requested (first-write-wins), making it permanently cacheable.

### Key properties

- Every sealed chunk URL returns the same bytes forever → `Cache-Control: public, max-age=86400, immutable`
- 86400 seconds (24 hours) is well above Cloudflare's 2-hour floor, so chunks are actually cached at edge
- When no new data exists the server returns `204 no-store` — Cloudflare never caches 204 responses
- The server embeds the `next` URL in every response, so clients never need to construct URLs themselves

### URL structure

```
GET /api/:channel/live/after/:from          — entry point (no-store, game-agnostic)
GET /api/:channel/live/:gameId/after/:from  — sealed immutable chunk (CDN-cached)
```

#### Entry point (`after/:from`)

Used for first connection and Twitch extension game-change resets. Not cached by CDN:

- Resolves the channel's current game, applies a first-write-wins seal, returns patches and a **game-specific** `next` URL
- `Cache-Control: no-store` — the current game for a channel can change between games
- After the first response the client is on the game-specific chain and never calls this again mid-game

#### Game-specific sealed chunks (`/:gameId/after/:from`)

All subsequent requests after bootstrapping:

- `:gameId` is a server-generated UUID (see below) — URL-safe and stable
- `:from` is the exclusive lower bound (seq > from); the server seals the upper bound at `latestSeq` on first request
- Immutable once sealed: further ingests for the same game do not change the response
- ETag: `"chunk-{from}-{toSeq}"` with 304 support for conditional requests

#### Cross-game cache isolation

Chunks from different games with the same sequence numbers must never collide in the CDN cache. Including `:gameId` in the URL guarantees isolation — game A's `after/0` and game B's `after/0` live at different paths. The server-side `chunkSeals` map is also keyed by `publicId:fromSeq` for the same reason.

### Public game IDs (UUIDs)

WC3 game IDs come from Magic Sentry and may contain characters that are not URL-safe. The server generates a `crypto.randomUUID()` on first ingest of each new game and uses that UUID as the public identifier in all URLs. The internal WC3 game ID is used only for in-memory deduplication.

### Late joiners

A viewer who joins mid-game starts at `/:gameId/after/-1` and walks the sealed linked list forward:

```
after/-1  →  after/5  →  after/12  →  after/19  →  204 (frontier)
```

Every hop except the frontier is a CDN cache hit — no server load regardless of how many requests a late joiner makes.

### Client catch-up loop

Clients drain the sealed chain as fast as possible via sequential HTTP requests (all CDN cache hits, no server load). Only when the chain reaches the frontier (204) does the client switch to periodic polling:

```typescript
async function catchUp() {
  while (await fetchDelta()) {
    /* each true = cached chunk received; loop until 204 frontier */
  }
}
// Drain immediately on mount, then re-poll every N seconds
void catchUp()
intervalRef.current = setInterval(() => void catchUp(), pollIntervalSec * 1000)
```

`fetchDelta` returns `true` when a chunk was received (more may follow) and `false` on 204 or error. A late joiner traverses the entire history without touching the origin. Once caught up, the poll interval takes over for live updates.

---

## Request flow

```
Viewer                     CDN edge              Origin (VPS)
  |                           |                       |
  |-- GET /:gameId/after/-1 ->|                       |
  |                           |-- cache miss -------->|
  |                           |<-- 200 immutable -----|
  |<-- 200 immutable ---------|                       |
  |                           |  (caches response)    |
  |                           |                       |
  |-- GET /:gameId/after/5 -->|                       |
  |<-- 200 (cache hit) -------|                       |  ← no origin hit
  |                           |                       |
  |-- GET /:gameId/after/12 ->|                       |
  |<-- 204 no-store ----------|                       |  ← frontier, not cached
  |  (retry after 5s)         |                       |
```

---

## CDN requirements and alternatives

The protocol requires a CDN that **respects `Cache-Control: max-age` with no minimum TTL floor**.

| CDN             | Min TTL      | Notes                                                          |
| --------------- | ------------ | -------------------------------------------------------------- |
| Cloudflare Free | 2 hours      | Incompatible with short `max-age`; use paid plan or switch CDN |
| Cloudflare Pro+ | Configurable | Can override TTL floor                                         |
| BunnyCDN        | 0 s          | $0.01/GB, no monthly minimum                                   |
| AWS CloudFront  | 0 s          | 1 TB/month free tier                                           |

With the immutable chunk protocol the CDN TTL minimum is no longer a concern — 24-hour TTL is always honoured. Switching CDN is still an option if Cloudflare is dropped, but it is no longer required to fix the caching problem.

---

## Server-side sealing

```typescript
// chunkSeals: Map<`${publicId}:${fromSeq}`, toSeq>
sealChunk(publicId: string, fromSeq: number, toSeq: number): number {
  const key = `${publicId}:${fromSeq}`
  if (!this.chunkSeals.has(key)) this.chunkSeals.set(key, toSeq)
  return this.chunkSeals.get(key)!
}
```

First call locks `toSeq`; subsequent calls with a higher `toSeq` (from new ingests) are ignored. Seals are cleared when the game store resets between games.

---
