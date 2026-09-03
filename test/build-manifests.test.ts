import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import {
  compileManifests,
  findManifestDrift,
  writeManifests,
} from '../scripts/build-manifests.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const goldenRoot = join(root, 'test', 'fixtures', 'golden', 'manifests')
const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe('compileManifests', () => {
  it('should match every golden platform manifest', () => {
    // Arrange
    const goldenFiles = readTree(goldenRoot)

    // Act
    const files = compileManifests()

    // Assert
    expect(Object.fromEntries(files)).toEqual(Object.fromEntries(goldenFiles))
  })
})

describe('writeManifests', () => {
  it('should write the complete golden manifest tree', () => {
    // Arrange
    const directory = temporaryDirectory()

    // Act
    writeManifests(directory)

    // Assert
    expect(Object.fromEntries(readTree(directory))).toEqual(
      Object.fromEntries(readTree(goldenRoot)),
    )
  })

  it('should remove generated manifests that leave the catalog', () => {
    // Arrange
    const directory = temporaryDirectory()
    writeManifests(directory)
    const files = new Map(
      [...compileManifests()].filter(([filename]) =>
        !['plugins/docs/.mcp.json', 'plugins/docs/mcp.json', 'registry/docs/server.json']
          .includes(filename),
      ),
    )

    // Act
    writeManifests(directory, files)

    // Assert
    expect(existsSync(join(directory, 'plugins/docs/.mcp.json'))).toBe(false)
    expect(existsSync(join(directory, 'plugins/docs/mcp.json'))).toBe(false)
    expect(existsSync(join(directory, 'registry/docs/server.json'))).toBe(false)
  })
})

describe('findManifestDrift', () => {
  it('should accept a current manifest tree', () => {
    // Arrange
    const directory = temporaryDirectory()
    writeManifests(directory)

    // Act
    const drift = findManifestDrift(directory)

    // Assert
    expect(drift).toEqual([])
  })

  it.each([
    ['missing', undefined, 'missing'],
    ['outdated', '{}\n', 'out of date'],
  ] as const)('should report a %s generated file', (_case, content, expected) => {
    // Arrange
    const directory = temporaryDirectory()
    const files = new Map([['plugin.json', '{"name":"docs"}\n']])
    if (content !== undefined) {
      const filename = join(directory, 'plugin.json')
      mkdirSync(dirname(filename), { recursive: true })
      writeFileSync(filename, content)
    }

    // Act
    const drift = findManifestDrift(directory, files)

    // Assert
    expect(drift).toEqual([`plugin.json: ${expected}`])
  })

  it('should report unexpected generated manifests', () => {
    // Arrange
    const directory = temporaryDirectory()
    writeManifests(directory)
    const path = join(directory, 'plugins/wallet/mcp.json')
    writeFileSync(path, '{}\n')

    // Act
    const drift = findManifestDrift(directory)

    // Assert
    expect(drift).toContain('plugins/wallet/mcp.json: unexpected')
  })
})

// Helpers

const temporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'tempo-plugin-manifests-'))
  temporaryDirectories.push(directory)
  return directory
}

const readTree = (directory: string): ReadonlyMap<string, string> => {
  const files = new Map<string, string>()
  const visit = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) visit(path)
      else files.set(relative(directory, path), readFileSync(path, 'utf8'))
    }
  }
  visit(directory)
  return files
}
