import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileGeminiManifests } from './build-gemini.ts'
import { compileManifests } from './build-manifests.ts'
import { listPluginNames } from './list-plugins.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const goldenRoot = join(root, 'test', 'fixtures', 'golden')

export const compileGoldenFiles = (): ReadonlyMap<string, string> => new Map([
  ...[...compileManifests()].map(([filename, content]) => [
    `manifests/${filename}`,
    content,
  ] as const),
  ...[...compileGeminiManifests()].map(([filename, content]) => [
    `gemini/${filename}`,
    content,
  ] as const),
  ['plugin-list.txt', `${listPluginNames()}\n`],
])

export const writeGoldenFiles = (outputRoot: string): void => {
  rmSync(outputRoot, { force: true, recursive: true })
  for (const [filename, content] of compileGoldenFiles()) {
    const path = join(outputRoot, filename)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const files = compileGoldenFiles()
  writeGoldenFiles(goldenRoot)
  console.log(`Updated ${files.size} golden files`)
}
