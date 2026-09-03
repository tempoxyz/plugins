import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { writeGoldenFiles } from '../scripts/update-goldens.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const goldenRoot = join(root, 'test', 'fixtures', 'golden')
const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe('writeGoldenFiles', () => {
  it('should reproduce the complete golden fixture tree', () => {
    // Arrange
    const output = temporaryDirectory()

    // Act
    writeGoldenFiles(output)

    // Assert
    expect(Object.fromEntries(readTree(output))).toEqual(
      Object.fromEntries(readTree(goldenRoot)),
    )
  })
})

// Helpers

const temporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), 'tempo-plugin-goldens-'))
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
