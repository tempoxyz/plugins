import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { plugins } from '../manifest.config.ts'
import { validateRepository } from '../scripts/validate.ts'

type McpManifest = {
  mcpServers: Record<string, { type: string; url: string }>
}

type PluginManifest = {
  name: string
  repository: string
  version: string
}

type GeminiManifest = PluginManifest & {
  mcpServers?: Record<string, { httpUrl: string }>
}

type RegistryManifest = {
  name: string
  remotes: Array<{ type: string; url: string }>
}

const root = fileURLToPath(new URL('..', import.meta.url))
const pluginNames = plugins.map((plugin) => plugin.name)
const mcpPluginNames = plugins.filter((plugin) => plugin.mcp).map((plugin) => plugin.name)
const repository = 'https://github.com/tempoxyz/plugins'

const readJson = <T>(filename: string): T =>
  JSON.parse(readFileSync(join(root, filename), 'utf8')) as T

describe('repository validation', () => {
  test('all manifests and marketplace entries are valid', () => {
    expect(validateRepository(root)).toEqual([])
  })

  test('Tempo Docs is the only OpenAI directory candidate', () => {
    const submission = readFileSync(join(root, 'submissions/openai/docs.md'), 'utf8')
    expect(submission).toMatch(/Candidate: `docs`/)
    expect(submission).toMatch(/Excluded: `wallet`, `mercator`/)
  })

  test.each(pluginNames)('%s uses streamable HTTP when MCP is present', (name) => {
    const filename = join(root, `plugins/${name}/mcp.json`)
    try {
      const manifest = readJson<McpManifest>(`plugins/${name}/mcp.json`)
      for (const server of Object.values(manifest.mcpServers)) {
        expect(server.type).toBe('streamable-http')
        expect(server.url).toMatch(/^https:\/\//)
      }
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
        throw error
      }
      expect(filename.endsWith('wallet/mcp.json')).toBe(true)
    }
  })

  test('Tempo Docs skill stays read-only', () => {
    const skill = readFileSync(join(root, 'plugins/docs/skills/docs/SKILL.md'), 'utf8')
    expect(skill).toMatch(/This plugin is read-only/)
    expect(skill).toMatch(/must not install software/)
  })

  test.each(pluginNames)('%s platform manifests use canonical identity', (name) => {
    for (const manifestPath of [
      `plugins/${name}/plugin.json`,
      `plugins/${name}/.codex-plugin/plugin.json`,
      `plugins/${name}/.claude-plugin/plugin.json`,
      `plugins/${name}/.cursor-plugin/plugin.json`,
    ]) {
      const manifest = readJson<PluginManifest>(manifestPath)
      expect(manifest.name, manifestPath).toBe(name)
      expect(manifest.repository, manifestPath).toBe(repository)
    }
  })

  test.each(pluginNames)('%s Gemini extension preserves portable metadata', (name) => {
    const portable = readJson<PluginManifest>(`plugins/${name}/plugin.json`)
    const generated = readJson<GeminiManifest>(`dist/gemini/${name}/gemini-extension.json`)
    expect(generated.name).toBe(portable.name)
    expect(generated.version).toBe(portable.version)

    try {
      const mcp = readJson<McpManifest>(`plugins/${name}/mcp.json`)
      for (const [serverName, server] of Object.entries(mcp.mcpServers)) {
        expect(generated.mcpServers?.[serverName]?.httpUrl).toBe(server.url)
      }
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
        throw error
      }
      expect(generated.mcpServers).toBeUndefined()
    }
  })

  test.each(mcpPluginNames)('%s MCP Registry record uses HTTPS Streamable HTTP', (name) => {
    const server = readJson<RegistryManifest>(`registry/${name}/server.json`)
    expect(server.name).toMatch(/^xyz\.tempo\//)
    expect(server.remotes.map((remote) => remote.type)).toEqual(['streamable-http'])
    expect(server.remotes[0]?.url).toMatch(/^https:\/\//)
  })

  test('wallet requests require a quote and explicit approval', () => {
    const skill = readFileSync(
      join(root, 'plugins/wallet/skills/wallet/SKILL.md'),
      'utf8',
    )
    const quote = skill.indexOf('request -t --dry-run')
    const approval = skill.indexOf('wait for explicit approval')
    const execution = skill.indexOf('request -t -X POST')
    expect(quote).toBeGreaterThanOrEqual(0)
    expect(approval).toBeGreaterThan(quote)
    expect(execution).toBeGreaterThan(approval)
  })

  test('current Tempo mark is used consistently', () => {
    const expectedHash = '1537798eaacb5c87ad4876caf4538edee25cc5843939b3edce04474f0bf9dd4a'
    for (const name of ['docs', 'wallet']) {
      const asset = readFileSync(join(root, `plugins/${name}/assets/tempo-mark.svg`))
      expect(createHash('sha256').update(asset).digest('hex'), name).toBe(expectedHash)
    }
  })

  test('Mercator uses its current product icon and surface color', () => {
    const expectedHash = 'a6bb9fee5a252c0fde25d5a759e31a57f48356462a8898da42523bfef8b24216'
    const asset = readFileSync(join(root, 'plugins/mercator/assets/favicon.svg'))
    const manifest = readJson<{ interface: { brandColor: string } }>(
      'plugins/mercator/.codex-plugin/plugin.json',
    )
    expect(createHash('sha256').update(asset).digest('hex')).toBe(expectedHash)
    expect(manifest.interface.brandColor).toBe('#0B0B0B')
  })

  test('Mercator includes the complete canonical skill package', () => {
    expect(readFileSync(join(root, 'plugins/mercator/skills/mercator/agents/openai.yaml'), 'utf8'))
      .toMatch(/value: "mercator"/)
  })

  test('Mercator sync trust is limited to its main-branch workflow', () => {
    const policy = readFileSync(
      join(root, '.github/sts/mercator-skill-sync.sts.yaml'),
      'utf8',
    )
    expect(policy).toMatch(/mercator@1331378779:ref:refs\/heads\/main/)
    expect(policy).toMatch(/public-plugin-sync\\\.yml@refs\/heads\/main/)
    expect(policy).toMatch(/contents: write/)
    expect(policy).toMatch(/pull_requests: write/)
  })

  test('release workflow verifies signed tags and packages the license', () => {
    const workflow = readFileSync(join(root, '.github/workflows/release.yml'), 'utf8')
    expect(workflow).toMatch(/\.verification\.verified/)
    expect(workflow).toMatch(/npm run --silent list:plugins/)
    expect(workflow).toMatch(/cp LICENSE "dist\/native\/\$plugin\/LICENSE"/)
  })

  test('workflows pin external actions to commit SHAs', () => {
    const workflowRoot = join(root, '.github/workflows')
    for (const name of readdirSync(workflowRoot)) {
      const workflow = readFileSync(join(workflowRoot, name), 'utf8')
      const uses = [...workflow.matchAll(/^\s*- uses: ([^\s]+)(?:\s+#.*)?$/gm)]
      for (const [, reference] of uses) {
        if (reference?.startsWith('./')) continue
        expect(reference, `${name}: ${reference}`).toMatch(/@[0-9a-f]{40}$/)
      }
    }
  })

  test('automation workflows declare permissions and timeouts', () => {
    const workflowRoot = join(root, '.github/workflows')
    for (const name of readdirSync(workflowRoot)) {
      const workflow = readFileSync(join(workflowRoot, name), 'utf8')
      expect(workflow, `${name}: missing permissions`).toMatch(/^permissions:/m)
      expect(workflow, `${name}: missing timeout`).toMatch(/^\s+timeout-minutes: \d+$/m)
    }
  })

  test('repository tooling uses TypeScript rather than MJS', () => {
    for (const directory of ['scripts', 'test']) {
      expect(readdirSync(join(root, directory)).filter((name) => name.endsWith('.mjs'))).toEqual([])
    }
  })
})
