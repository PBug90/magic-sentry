import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode ?? 'test', process.cwd(), '')
  return {
    test: {
      include: ['src/server/__tests__/**/*.test.ts'],
      environment: 'node',
      fileParallelism: false,
      pool: 'forks',
      env,
    },
  }
})
