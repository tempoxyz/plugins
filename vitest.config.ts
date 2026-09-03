import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['test/live-mcp.test.ts'],
  },
})
