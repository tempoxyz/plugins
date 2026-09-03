import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/live-mcp.test.ts'],
    testTimeout: 30_000,
  },
})
