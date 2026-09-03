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
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { plugins } from '../manifest.config.ts'
import {
  compileGeminiManifests,
  writeGeminiExtensions,
} from '../scripts/build-gemini.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const goldenRoot = join(root, 'test', 'fixtures', 'golden', 'gemini')
const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe('compileGeminiManifests', () => {
  it('should match every golden extension manifest', () => {
    // Arrange
    const goldenFiles = readTree(goldenRoot)

    // Act
    const manifests = compileGeminiManifests()

    // Assert
    expect(Object.fromEntries(manifests)).toEqual(Object.fromEntries(goldenFiles))
  })
})

describe('writeGeminiExtensions', () => {
  it('should write golden manifests and exact source payloads', () => {
    // Arrange
    const output = temporaryDirectory()

    // Act
    writeGeminiExtensions(root, output)

    // Assert
    for (const [filename, content] of readTree(goldenRoot)) {
      expect(readFileSync(join(output, filename), 'utf8'), filename).toBe(content)
    }
    for (const plugin of plugins) {
      expect(Object.fromEntries(readTree(join(output, plugin.name, 'skills')))).toEqual(
        Object.fromEntries(readTree(join(root, 'plugins', plugin.name, 'skills'))),
      )
      expect(readFileSync(join(output, plugin.name, 'LICENSE'), 'utf8')).toBe(
        readFileSync(join(root, 'LICENSE'), 'utf8'),
      )
    }
  })

  it('should remove stale extension output before writing', () => {
    // Arrange
    const output = temporaryDirectory()
    const staleFile = join(output, 'retired', 'gemini-extension.json')
    mkdirSync(join(output, 'retired'), { recursive: true })
    writeFileSync(staleFile, '{}\n')

    // Act
    writeGeminiExtensions(root, output)

    // Assert
    expect(existsSync(staleFile)).toBe(false)
  })
})

// Helpers

const temporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'tempo-plugin-gemini-'))
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
