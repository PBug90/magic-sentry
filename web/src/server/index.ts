import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { migrate } from './db.js'
import { trafficStore } from './trafficStore.js'
import { createApp } from './app.js'

const app = createApp()
app.use('/*', serveStatic({ root: './dist/client' }))

const port = Number(process.env.PORT) || 3000

migrate()
  .then(() => {
    console.log('[db] migrations applied')
    trafficStore.startFlushLoop()
    serve({ fetch: app.fetch, port }, () => {
      console.log(`Magic Sentry web server running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('[db] migration failed:', err)
    process.exit(1)
  })
