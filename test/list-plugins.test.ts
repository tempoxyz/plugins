import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { listPluginNames } from '../scripts/list-plugins.ts'

const golden = readFileSync(
  new URL('./fixtures/golden/plugin-list.txt', import.meta.url),
  'utf8',
).trimEnd()

describe('listPluginNames', () => {
  it('should match the golden release plugin list', () => {
    // Act
    const names = listPluginNames()

    // Assert
    expect(names).toBe(golden)
  })
})
