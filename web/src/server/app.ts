import { promisify } from 'node:util'
import { brotliDecompress } from 'node:zlib'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { trafficStore } from './trafficStore.js'
import api, { trackChannelFetch } from './routes/api.js'
import auth from './routes/auth.js'

const brotliDecompressAsync = promisify(brotliDecompress)

// Keyed on the original Request object; populated by decompressIngestBody when
// Content-Encoding: br is present, so the traffic middleware can read both sizes
// without consuming the (already-consumed) raw body a second time.
const ingestWireBytesStore = new WeakMap<Request, number>()
const ingestRawBytesStore = new WeakMap<Request, number>()

export function createApp() {
  const app = new Hono()

  // Registered first → outermost → runs last on the response path, after compress
  // has already wrapped the body. This ensures byte counts reflect wire (compressed) size.
  app.use('/api/:channel/live/:type{full|delta}', trackChannelFetch)
  app.use('/api/:channel/live/after/:from', trackChannelFetch)
  app.use('/api/:channel/live/:gameId/after/:from', trackChannelFetch)

  app.use('*', compress())

  app.use(
    '/api/*',
    cors({
      origin: (origin) =>
        origin === 'http://localhost:3000' ||
        origin === 'https://localhost:8080' ||
        origin.endsWith('.ext-twitch.tv')
          ? origin
          : null,
      allowHeaders: ['Authorization', 'Content-Type'],
      allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      maxAge: 600,
    }),
  )

  // Decompress Brotli-encoded ingest bodies before the traffic middleware or handler
  // reads them. Injects the decompressed text into Hono's body cache so c.req.json()
  // works normally downstream without re-reading the (consumed) raw stream.
  app.use('/api/ingest', async (c, next) => {
    if (c.req.header('content-encoding') !== 'br') return next()

    const wireBytes = Math.max(0, Number(c.req.header('content-length') ?? 0) || 0)
    const compressed = new Uint8Array(await c.req.raw.arrayBuffer())
    const decompressed = await brotliDecompressAsync(compressed)

    ingestWireBytesStore.set(c.req.raw, wireBytes)
    ingestRawBytesStore.set(c.req.raw, decompressed.byteLength)
    ;(c.req.bodyCache as Record<string, unknown>).text = Promise.resolve(
      new TextDecoder().decode(decompressed),
    )

    return next()
  })

  app.post('/api/ingest', async (c, next) => {
    const bearer = c.req.header('authorization')?.startsWith('Bearer ')
      ? c.req.header('authorization')!.slice(7)
      : null
    // If the decompression middleware ran, use the pre-measured sizes. Otherwise
    // content-length is the wire size and we clone the body for the raw size.
    const wireBytes =
      ingestWireBytesStore.get(c.req.raw) ??
      Math.max(0, Number(c.req.header('content-length') ?? 0) || 0)
    const rawBytes =
      ingestRawBytesStore.get(c.req.raw) ??
      (bearer ? (await c.req.raw.clone().arrayBuffer()).byteLength : 0)
    await next()
    if (bearer) trafficStore.record(bearer, 'ingest', rawBytes, wireBytes)
  })

  app.route('/api', api)
  app.route('/auth', auth)

  return app
}
