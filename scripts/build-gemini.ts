import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { plugins, type PluginDefinition } from '../manifest.config.ts'

type GeminiManifest = {
  description: string
  name: string
  version: string
  mcpServers?: Record<string, { httpUrl: string; timeout: number }>
}

const root = fileURLToPath(new URL('..', import.meta.url))

export const compileGeminiManifests = (
  definitions: readonly PluginDefinition[] = plugins,
): ReadonlyMap<string, string> => new Map(definitions.map((plugin) => {
  const manifest: GeminiManifest = {
    name: plugin.name,
    version: plugin.version,
    description: plugin.description,
    ...(plugin.mcp ? {
      mcpServers: {
        [plugin.mcp.serverName]: { httpUrl: plugin.mcp.url, timeout: 600_000 },
      },
    } : {}),
  }
  return [`${plugin.name}/gemini-extension.json`, `${JSON.stringify(manifest, null, 2)}\n`]
}))

export const writeGeminiExtensions = (
  sourceRoot: string,
  outputRoot: string,
  definitions: readonly PluginDefinition[] = plugins,
): void => {
  rmSync(outputRoot, { force: true, recursive: true })
  const manifests = compileGeminiManifests(definitions)
  for (const [filename, content] of manifests) {
    const pluginName = filename.split('/')[0]
    if (!pluginName) throw new Error(`Invalid Gemini manifest path: ${filename}`)
    const output = join(outputRoot, pluginName)
    mkdirSync(dirname(join(outputRoot, filename)), { recursive: true })
    writeFileSync(join(outputRoot, filename), content)
    cpSync(join(sourceRoot, 'plugins', pluginName, 'skills'), join(output, 'skills'), {
      recursive: true,
    })
    cpSync(join(sourceRoot, 'LICENSE'), join(output, 'LICENSE'))
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  writeGeminiExtensions(root, join(root, 'dist', 'gemini'))
  console.log(`Built ${plugins.length} Gemini CLI extensions in dist/gemini`)
}
