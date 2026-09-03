import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const pluginsRoot = join(root, 'plugins')
const outputRoot = join(root, 'dist', 'gemini')
const pluginNames = ['tempo-docs', 'tempo-wallet', 'mercator']

rmSync(outputRoot, { force: true, recursive: true })

for (const name of pluginNames) {
  const pluginRoot = join(pluginsRoot, name)
  const metadata = JSON.parse(readFileSync(join(pluginRoot, 'plugin.json'), 'utf8'))
  const output = join(outputRoot, name)
  const manifest = {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
  }

  const mcpPath = join(pluginRoot, 'mcp.json')
  try {
    const mcp = JSON.parse(readFileSync(mcpPath, 'utf8'))
    manifest.mcpServers = Object.fromEntries(
      Object.entries(mcp.mcpServers).map(([serverName, server]) => [
        serverName,
        { httpUrl: server.url, timeout: 600000 },
      ]),
    )
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
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
