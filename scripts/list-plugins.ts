import { plugins } from '../manifest.config.ts'

console.log(plugins.map((plugin) => plugin.name).join(' '))
