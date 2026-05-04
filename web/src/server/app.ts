import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { trafficStore } from './trafficStore.js'
import api from './routes/api.js'
import auth from './routes/auth.js'

export function createApp() {
  const app = new Hono()

  app.use(
    '/api/*',
    cors({
      origin: ['https://ext-twitch.tv', 'http://localhost:3000'],
      allowHeaders: ['Authorization', 'Content-Type'],
      allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    }),
  )

  app.use('/api/*', async (c, next) => {
    const authHeader = c.req.header('authorization')
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!bearer) {
      await next()
      return
    }

    const isIngest = c.req.method === 'POST' && c.req.path === '/api/ingest'
    if (isIngest) {
      const bytes = Math.max(0, Number(c.req.header('content-length') ?? 0) || 0)
      await next()
      trafficStore.record(bearer, 'ingest', bytes)
    } else {
      await next()
      const bytes = Math.max(0, Number(c.res.headers.get('content-length') ?? 0) || 0)
      trafficStore.record(bearer, 'fetch', bytes)
    }
  })

  app.route('/api', api)
  app.route('/auth', auth)

  return app
}
