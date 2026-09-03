import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { plugins } from '../manifest.config.ts'

export const listPluginNames = (): string => plugins.map((plugin) => plugin.name).join(' ')

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) console.log(listPluginNames())
