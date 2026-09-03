import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

type PortableManifest = {
  description: string
  name: string
  version: string
}

type McpManifest = {
  mcpServers: Record<string, { url: string }>
}

type GeminiManifest = PortableManifest & {
  mcpServers?: Record<string, { httpUrl: string; timeout: number }>
}

const root = fileURLToPath(new URL('..', import.meta.url))
const pluginsRoot = join(root, 'plugins')
const outputRoot = join(root, 'dist', 'gemini')
const pluginNames = ['docs', 'wallet', 'mercator'] as const

const readJson = <T>(filename: string): T =>
  JSON.parse(readFileSync(filename, 'utf8')) as T

rmSync(outputRoot, { force: true, recursive: true })

for (const name of pluginNames) {
  const pluginRoot = join(pluginsRoot, name)
  const metadata = readJson<PortableManifest>(join(pluginRoot, 'plugin.json'))
  const output = join(outputRoot, name)
  const manifest: GeminiManifest = {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
  }

  try {
    const mcp = readJson<McpManifest>(join(pluginRoot, 'mcp.json'))
    manifest.mcpServers = Object.fromEntries(
      Object.entries(mcp.mcpServers).map(([serverName, server]) => [
        serverName,
        { httpUrl: server.url, timeout: 600_000 },
      ]),
    )
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw error
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

console.log(`Built ${pluginNames.length} Gemini CLI extensions in dist/gemini`)
