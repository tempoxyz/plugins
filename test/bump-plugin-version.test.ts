import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { bumpPluginVersion } from '../scripts/bump-plugin-version.ts'

const config = readFileSync(new URL('../manifest.config.ts', import.meta.url), 'utf8')
const version = (source: string, name: string): string | undefined =>
  new RegExp(`\\n    name: '${name}',\\n    version: '([^']+)'`).exec(source)?.[1]

describe('bumpPluginVersion', () => {
  it.each(['docs', 'wallet', 'mercator'])('bumps only the %s patch version', (name) => {
    const bumped = bumpPluginVersion(config, name)
    const [major, minor, patch] = version(config, name)!.split('.')
    expect(version(bumped, name)).toBe(`${major}.${minor}.${Number(patch) + 1}`)
    for (const other of ['docs', 'wallet', 'mercator'].filter((plugin) => plugin !== name)) {
      expect(version(bumped, other)).toBe(version(config, other))
    }
  })

  it('rejects an unknown plugin', () => {
    expect(() => bumpPluginVersion(config, 'missing')).toThrow(/no version for plugin "missing"/)
  })
})
