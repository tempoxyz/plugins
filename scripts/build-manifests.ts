import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalog, plugins, type PluginDefinition } from '../manifest.config.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const commonManifest = (plugin: PluginDefinition) => ({
  name: plugin.name,
  version: plugin.version,
  description: plugin.description,
  homepage: plugin.homepage,
  repository: catalog.repository,
  license: catalog.license,
  keywords: plugin.keywords,
})

export const compileManifests = (): ReadonlyMap<string, string> => {
  const files = new Map<string, string>()

  files.set('.agents/plugins/marketplace.json', json({
    name: catalog.name,
    interface: { displayName: catalog.displayName },
    plugins: plugins.map((plugin) => ({
      name: plugin.name,
      source: { source: 'local', path: `./plugins/${plugin.name}` },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
      category: plugin.category,
    })),
  }))

  files.set('.claude-plugin/marketplace.json', json({
    name: catalog.name,
    metadata: { description: `${catalog.displayName} Claude Code plugin marketplace.` },
    owner: { name: catalog.author.name, email: catalog.author.email },
    plugins: plugins.map((plugin) => ({
      name: plugin.name,
      description: plugin.description,
      source: `./plugins/${plugin.name}`,
      category: plugin.claudeCategory,
      homepage: plugin.homepage,
    })),
  }))

  files.set('.cursor-plugin/marketplace.json', json({
    name: catalog.name,
    owner: { name: catalog.author.name },
    metadata: { description: catalog.description },
    plugins: plugins.map((plugin) => ({
      name: plugin.name,
      source: `plugins/${plugin.name}`,
      description: plugin.description,
      category: plugin.category,
      tags: plugin.keywords,
    })),
  }))

  for (const plugin of plugins) {
    const pluginRoot = `plugins/${plugin.name}`
    const common = commonManifest(plugin)
    const componentPaths = {
      skills: './skills/',
      ...(plugin.mcp ? { mcpServers: './.mcp.json' } : {}),
    }

    files.set(`${pluginRoot}/plugin.json`, json({
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      ...common,
      author: { name: catalog.author.name, url: catalog.author.url },
    }))

    files.set(`${pluginRoot}/.codex-plugin/plugin.json`, json({
      ...common,
      version: plugin.codexVersionSuffix
        ? `${plugin.version}+${plugin.codexVersionSuffix}`
        : plugin.version,
      author: catalog.author,
      ...componentPaths,
      interface: {
        displayName: plugin.displayName,
        shortDescription: plugin.interface.shortDescription,
        longDescription: plugin.interface.longDescription,
        developerName: catalog.author.name,
        category: plugin.category,
        capabilities: plugin.interface.capabilities,
        websiteURL: plugin.interface.websiteURL,
        ...(plugin.interface.privacyPolicyURL
          ? { privacyPolicyURL: plugin.interface.privacyPolicyURL }
          : {}),
        ...(plugin.interface.termsOfServiceURL
          ? { termsOfServiceURL: plugin.interface.termsOfServiceURL }
          : {}),
        defaultPrompt: plugin.interface.defaultPrompt,
        brandColor: plugin.interface.brandColor,
        composerIcon: `./assets/${plugin.icon}`,
        logo: `./assets/${plugin.icon}`,
      },
    }))

    files.set(`${pluginRoot}/.claude-plugin/plugin.json`, json({
      $schema: 'https://json.schemastore.org/claude-code-plugin-manifest.json',
      name: plugin.name,
      displayName: plugin.displayName,
      version: plugin.version,
      description: plugin.description,
      author: { name: catalog.author.name },
      homepage: plugin.homepage,
      repository: catalog.repository,
      license: catalog.license,
      keywords: plugin.keywords,
      ...componentPaths,
    }))

    files.set(`${pluginRoot}/.cursor-plugin/plugin.json`, json({
      name: plugin.name,
      displayName: plugin.displayName,
      version: plugin.version,
      description: plugin.description,
      author: { name: catalog.author.name },
      homepage: plugin.homepage,
      repository: catalog.repository,
      license: catalog.license,
      logo: `./assets/${plugin.icon}`,
      keywords: plugin.keywords,
      ...componentPaths,
    }))

    if (plugin.mcp) {
      files.set(`${pluginRoot}/.mcp.json`, json({
        mcpServers: {
          [plugin.mcp.serverName]: {
            type: 'http',
            url: plugin.mcp.url,
            note: plugin.mcp.note,
          },
        },
      }))
      files.set(`${pluginRoot}/mcp.json`, json({
        $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
        mcpServers: {
          [plugin.mcp.serverName]: {
            type: 'streamable-http',
            url: plugin.mcp.url,
          },
        },
      }))
      files.set(`registry/${plugin.name}/server.json`, json({
        $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
        name: `xyz.tempo/${plugin.name}`,
        title: plugin.displayName,
        description: plugin.mcp.registryDescription,
        version: plugin.version,
        remotes: [{ type: 'streamable-http', url: plugin.mcp.url }],
      }))
    }
  }

  return files
}

export const findManifestDrift = (
  directory: string,
  files: ReadonlyMap<string, string> = compileManifests(),
): string[] => [...files].flatMap(([filename, expected]) => {
  const path = join(directory, filename)
  if (!existsSync(path)) return [`${filename}: missing`]
  return readFileSync(path, 'utf8') === expected ? [] : [`${filename}: out of date`]
})

export const writeManifests = (
  directory: string,
  files: ReadonlyMap<string, string> = compileManifests(),
): void => {
  for (const [filename, content] of files) {
    const path = join(directory, filename)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  if (process.argv.includes('--check')) {
    const drift = findManifestDrift(root)
    if (drift.length > 0) {
      console.error(['Generated manifests are stale:', ...drift.map((line) => `- ${line}`)].join('\n'))
      process.exitCode = 1
    } else {
      console.log(`Verified ${compileManifests().size} generated manifests`)
    }
  } else {
    const files = compileManifests()
    writeManifests(root, files)
    console.log(`Built ${files.size} manifests from manifest.config.ts`)
  }
}
