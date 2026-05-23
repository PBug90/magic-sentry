import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFile } from 'node:fs/promises'
import { migrate } from './db.js'
import { trafficStore } from './trafficStore.js'
import { createApp } from './app.js'

const app = createApp()
app.use('/reports/*', serveStatic({ root: './dist/client' }))
app.use('/*', serveStatic({ root: './dist/client' }))
app.get('*', async (c) => {
  const html = await readFile('./dist/client/index.html', 'utf-8')
  return c.html(html)
})

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
