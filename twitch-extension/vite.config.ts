import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'path'

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
  plugins: [react(), basicSsl(), requestLogger],
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
    rollupOptions: {
      input: {
        viewer: resolve(__dirname, 'viewer.html'),
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
