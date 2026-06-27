import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Dev-only API that serves the bundled example games to the playground using the
// same {patches,next} chunk protocol the real backend speaks, so the overlay can
// be tested end-to-end without Twitch or the web server running.
const EXAMPLES: Record<string, string> = {
  all: 'example-game.json',
  'hu-orc': 'example-hu-orc.json',
  'ne-ud': 'example-ne-ud.json',
}

function devApi() {
  return {
    name: 'magic-sentry-dev-api',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        if (!path.startsWith('/dev-api/')) return next()
        const [, , example, kind, sub, seqStr] = path.split('/') // dev-api/<ex>/<live|history>/after/<seq>
        const file = EXAMPLES[example]
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Content-Type', 'application/json')
        if (!file) {
          res.statusCode = 404
          return res.end(JSON.stringify({ error: 'unknown example' }))
        }
        if (kind === 'history') return res.end('[]')
        if (kind === 'live' && sub === 'after') {
          const patch = JSON.parse(readFileSync(resolve(__dirname, '..', file), 'utf8'))
          if (parseInt(seqStr, 10) < patch.seq) {
            return res.end(
              JSON.stringify({ patches: [patch], next: `/dev-api/${example}/live/after/${patch.seq}` }),
            )
          }
          res.statusCode = 204
          return res.end()
        }
        return next()
      })
    },
  }
}

const requestLogger = {
  name: 'request-logger',
  configureServer(server: import('vite').ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      const start = Date.now()
      res.on('finish', () => {
        const ms = Date.now() - start
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${req.url} → ${res.statusCode} (${ms}ms) origin=${req.headers.origin ?? '-'} cors=${res.getHeader('access-control-allow-origin') ?? 'none'}`,
        )
      })
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), basicSsl(), requestLogger, devApi()],
  resolve: {
    alias: {
      '@magic-sentry/viewer': resolve(__dirname, '../viewer/src/index.ts'),
    },
  },
  server: {
    port: 8080,
    https: {}, // basic-ssl fills in the self-signed cert
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: false,
    rollupOptions: {
      input: {
        video_overlay: resolve(__dirname, 'video_overlay.html'),
        config: resolve(__dirname, 'config.html'),
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: '../assets',
  // Twitch extensions are served from ext-twitch.tv; relative base keeps asset
  // paths correct whether deployed to the CDN root or a sub-folder.
  base: './',
})
