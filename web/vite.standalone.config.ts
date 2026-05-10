import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: '../assets',
  build: {
    outDir: 'dist/standalone',
    emptyOutDir: true,
    chunkSizeWarningLimit: 10000,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: 'src/client/standalone.tsx',
      output: {
        entryFileNames: 'report.js',
        assetFileNames: '[name][extname]',
        format: 'iife',
        name: 'MagicSentryReport',
        inlineDynamicImports: true,
      },
    },
  },
})
