import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { plugins } from '../manifest.config.ts'
import { compileManifests, findManifestDrift, writeManifests } from '../scripts/build-manifests.ts'

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

const temporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'tempo-plugin-manifests-'))
  temporaryDirectories.push(directory)
  return directory
}

describe('manifest compiler', () => {
  test('compiles every platform from the typed catalog', () => {
    const files = compileManifests()
    const expectedCount = 3 + plugins.reduce(
      (count, plugin) => count + 4 + (plugin.mcp ? 3 : 0),
      0,
    )
    expect(files.size).toBe(expectedCount)
    expect([...files.keys()]).toContain('plugins/docs/.codex-plugin/plugin.json')
    expect([...files.keys()]).toContain('plugins/wallet/.claude-plugin/plugin.json')
    expect([...files.keys()]).toContain('registry/mercator/server.json')
  })

  test('writes a current manifest tree', () => {
    const directory = temporaryDirectory()
    writeManifests(directory)
    expect(findManifestDrift(directory)).toEqual([])
  })

  test.each([
    ['missing', undefined, 'missing'],
    ['outdated', '{}\n', 'out of date'],
  ] as const)('reports %s generated files', (_case, content, expected) => {
    const directory = temporaryDirectory()
    const files = new Map([['plugin.json', '{"name":"docs"}\n']])
    if (content !== undefined) {
      const filename = join(directory, 'plugin.json')
      mkdirSync(dirname(filename), { recursive: true })
      writeFileSync(filename, content)
    }
    expect(findManifestDrift(directory, files)).toEqual([`plugin.json: ${expected}`])
  })
})
