import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const names = ['tempo-docs', 'tempo-wallet', 'mercator']
const repository = 'https://github.com/tempoxyz/plugins'
const failures = []

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(join(root, path), 'utf8'))
  } catch (error) {
    failures.push(`${path}: ${error.message}`)
    return null
  }
}

const marketplaces = [
  ['.agents/plugins/marketplace.json', (entry) => entry.source.path],
  ['.claude-plugin/marketplace.json', (entry) => entry.source],
  ['.cursor-plugin/marketplace.json', (entry) => entry.source],
]

for (const [path, source] of marketplaces) {
  const marketplace = readJson(path)
  if (!marketplace) continue
  const listed = marketplace.plugins.map((plugin) => plugin.name)
  if (JSON.stringify(listed) !== JSON.stringify(names)) {
    failures.push(`${path}: expected plugin order ${names.join(', ')}`)
  }
  for (const plugin of marketplace.plugins) {
    const resolved = source(plugin).replace(/^\.\//, '')
    if (!existsSync(join(root, resolved))) {
      failures.push(`${path}: missing source ${resolved}`)
    }
  }
}

for (const name of names) {
  const pluginRoot = `plugins/${name}`
  const portable = readJson(`${pluginRoot}/plugin.json`)
  const codex = readJson(`${pluginRoot}/.codex-plugin/plugin.json`)
  const claude = readJson(`${pluginRoot}/.claude-plugin/plugin.json`)
  const cursor = readJson(`${pluginRoot}/.cursor-plugin/plugin.json`)

  for (const [kind, manifest] of Object.entries({ portable, codex, claude, cursor })) {
    if (!manifest) continue
    if (manifest.name !== name) failures.push(`${pluginRoot}: ${kind} name mismatch`)
    if (manifest.repository !== repository) {
      failures.push(`${pluginRoot}: ${kind} repository must be ${repository}`)
    }
  }

  if (!existsSync(join(root, pluginRoot, 'skills', name, 'SKILL.md'))) {
    failures.push(`${pluginRoot}: missing skills/${name}/SKILL.md`)
  }
  if (portable && claude && portable.version !== claude.version) {
    failures.push(`${pluginRoot}: portable and Claude versions differ`)
  }
  if (portable && cursor && portable.version !== cursor.version) {
    failures.push(`${pluginRoot}: portable and Cursor versions differ`)
  }
  if (
    portable &&
    codex &&
    codex.version !== portable.version &&
    !codex.version.startsWith(`${portable.version}+`)
  ) {
    failures.push(`${pluginRoot}: Codex version must match portable version`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Validated ${names.length} plugins and ${marketplaces.length} marketplaces`)
