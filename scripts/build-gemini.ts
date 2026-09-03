import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { plugins } from '../manifest.config.ts'

type GeminiManifest = {
  description: string
  name: string
  version: string
  mcpServers?: Record<string, { httpUrl: string; timeout: number }>
}

const root = fileURLToPath(new URL('..', import.meta.url))
const pluginsRoot = join(root, 'plugins')
const outputRoot = join(root, 'dist', 'gemini')
rmSync(outputRoot, { force: true, recursive: true })

for (const plugin of plugins) {
  const pluginRoot = join(pluginsRoot, plugin.name)
  const output = join(outputRoot, plugin.name)
  const manifest: GeminiManifest = {
    name: plugin.name,
    version: plugin.version,
    description: plugin.description,
  }

  if (plugin.mcp) {
    manifest.mcpServers = {
      [plugin.mcp.serverName]: { httpUrl: plugin.mcp.url, timeout: 600_000 },
    }
  }

  mkdirSync(output, { recursive: true })
  writeFileSync(
    join(output, 'gemini-extension.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )
  cpSync(join(pluginRoot, 'skills'), join(output, 'skills'), { recursive: true })
  cpSync(join(root, 'LICENSE'), join(output, 'LICENSE'))
}

console.log(`Built ${plugins.length} Gemini CLI extensions in dist/gemini`)
