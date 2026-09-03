import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { catalog, plugins } from '../manifest.config.ts'
import { findManifestDrift } from './build-manifests.ts'

type JsonObject = Record<string, unknown>

type MarketplaceEntry = {
  name: string
  source: string | { path: string }
}

type Marketplace = {
  plugins: MarketplaceEntry[]
}

type PluginManifest = {
  name: string
  repository: string
  version: string
}

const pluginNames = plugins.map((plugin) => plugin.name)

const readJson = <T extends JsonObject>(root: string, filename: string): T =>
  JSON.parse(readFileSync(join(root, filename), 'utf8')) as T

export const validateRepository = (root: string): string[] => {
  const failures = findManifestDrift(root)
  const pluginDirectories = readdirSync(join(root, 'plugins'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
  const configuredPlugins = [...pluginNames].sort()
  if (JSON.stringify(pluginDirectories) !== JSON.stringify(configuredPlugins)) {
    failures.push('plugins/: directories must match manifest.config.ts')
  }
  const safeReadJson = <T extends JsonObject>(filename: string): T | undefined => {
    try {
      return readJson<T>(root, filename)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push(`${filename}: ${message}`)
      return undefined
    }
  }

  const marketplaces = [
    ['.agents/plugins/marketplace.json', (entry: MarketplaceEntry) => (entry.source as { path: string }).path],
    ['.claude-plugin/marketplace.json', (entry: MarketplaceEntry) => entry.source as string],
    ['.cursor-plugin/marketplace.json', (entry: MarketplaceEntry) => entry.source as string],
  ] as const

  for (const [filename, getSource] of marketplaces) {
    const marketplace = safeReadJson<Marketplace>(filename)
    if (!marketplace) continue
    const listed = marketplace.plugins.map((plugin) => plugin.name)
    if (JSON.stringify(listed) !== JSON.stringify(pluginNames)) {
      failures.push(`${filename}: expected plugin order ${pluginNames.join(', ')}`)
    }
    for (const plugin of marketplace.plugins) {
      const resolved = getSource(plugin).replace(/^\.\//, '')
      if (!existsSync(join(root, resolved))) {
        failures.push(`${filename}: missing source ${resolved}`)
      }
    }
  }

  for (const name of pluginNames) {
    const pluginRoot = `plugins/${name}`
    const manifests = {
      portable: safeReadJson<PluginManifest>(`${pluginRoot}/plugin.json`),
      codex: safeReadJson<PluginManifest>(`${pluginRoot}/.codex-plugin/plugin.json`),
      claude: safeReadJson<PluginManifest>(`${pluginRoot}/.claude-plugin/plugin.json`),
      cursor: safeReadJson<PluginManifest>(`${pluginRoot}/.cursor-plugin/plugin.json`),
    }

    for (const [kind, manifest] of Object.entries(manifests)) {
      if (!manifest) continue
      if (manifest.name !== name) failures.push(`${pluginRoot}: ${kind} name mismatch`)
      if (manifest.repository !== catalog.repository) {
        failures.push(`${pluginRoot}: ${kind} repository must be ${catalog.repository}`)
      }
    }

    if (!existsSync(join(root, pluginRoot, 'skills', name, 'SKILL.md'))) {
      failures.push(`${pluginRoot}: missing skills/${name}/SKILL.md`)
    }
    const { portable, codex, claude, cursor } = manifests
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

  return failures
}
