import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const configPath = fileURLToPath(new URL('../manifest.config.ts', import.meta.url))

/** Bump one plugin's patch version so installed clients pick up synced skill changes. */
export const bumpPluginVersion = (config: string, name: string): string => {
  const pattern = new RegExp(`(\\n    name: '${name}',\\n    version: ')(\\d+)\\.(\\d+)\\.(\\d+)(')`)
  const match = pattern.exec(config)
  if (!match) throw new Error(`manifest.config.ts has no version for plugin "${name}"`)
  const [, prefix, major, minor, patch, suffix] = match
  return config.replace(pattern, `${prefix}${major}.${minor}.${Number(patch) + 1}${suffix}`)
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const name = process.argv[2]
  if (!name) throw new Error('usage: bump-plugin-version.ts <plugin>')
  writeFileSync(configPath, bumpPluginVersion(readFileSync(configPath, 'utf8'), name))
}
