import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const pluginNames = ['tempo-docs', 'tempo-wallet', 'mercator']
const repository = 'https://github.com/tempoxyz/plugins'

const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'))

test('Tempo Docs is the only OpenAI directory candidate', () => {
  const submission = readFileSync(
    join(root, 'submissions/openai/tempo-docs.md'),
    'utf8',
  )
  assert.match(submission, /Candidate: `tempo-docs`/)
  assert.match(submission, /Excluded: `tempo-wallet`, `mercator`/)
})

test('all Agent Plugin manifests use streamable HTTP when MCP is present', () => {
  for (const name of pluginNames) {
    const path = join(root, `plugins/${name}/mcp.json`)
    try {
      const manifest = readJson(`plugins/${name}/mcp.json`)
      for (const server of Object.values(manifest.mcpServers)) {
        assert.equal(server.type, 'streamable-http')
        assert.match(server.url, /^https:\/\//)
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
})

test('Tempo Docs skill stays read-only', () => {
  const skill = readFileSync(
    join(root, 'plugins/tempo-docs/skills/tempo-docs/SKILL.md'),
    'utf8',
  )
  assert.match(skill, /This plugin is read-only/)
  assert.match(skill, /must not install software/)
})

test('platform manifests use canonical names and repository', () => {
  for (const name of pluginNames) {
    for (const manifestPath of [
      `plugins/${name}/plugin.json`,
      `plugins/${name}/.codex-plugin/plugin.json`,
      `plugins/${name}/.claude-plugin/plugin.json`,
      `plugins/${name}/.cursor-plugin/plugin.json`,
    ]) {
      const manifest = readJson(manifestPath)
      assert.equal(manifest.name, name, manifestPath)
      assert.equal(manifest.repository, repository, manifestPath)
    }
  }
})

test('generated Gemini extensions preserve names, versions, and remote MCP URLs', () => {
  for (const name of pluginNames) {
    const portable = readJson(`plugins/${name}/plugin.json`)
    const generated = readJson(`dist/gemini/${name}/gemini-extension.json`)
    assert.equal(generated.name, portable.name)
    assert.equal(generated.version, portable.version)

    try {
      const mcp = readJson(`plugins/${name}/mcp.json`)
      for (const [serverName, server] of Object.entries(mcp.mcpServers)) {
        assert.equal(generated.mcpServers[serverName].httpUrl, server.url)
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      assert.equal(generated.mcpServers, undefined)
    }
  }
})

test('MCP Registry records use HTTPS Streamable HTTP remotes', () => {
  for (const name of ['tempo-docs', 'mercator']) {
    const server = readJson(`registry/${name}/server.json`)
    assert.match(server.name, /^xyz\.tempo\//)
    assert.deepEqual(
      server.remotes.map((remote) => remote.type),
      ['streamable-http'],
    )
    assert.match(server.remotes[0].url, /^https:\/\//)
  }
})

test('wallet requests require a quote and explicit approval', () => {
  const skill = readFileSync(
    join(root, 'plugins/tempo-wallet/skills/tempo-wallet/SKILL.md'),
    'utf8',
  )
  const quote = skill.indexOf('request -t --dry-run')
  const approval = skill.indexOf('wait for explicit approval')
  const execution = skill.indexOf('request -t -X POST')
  assert.ok(quote >= 0)
  assert.ok(approval > quote)
  assert.ok(execution > approval)
})

test('release workflow verifies signed tags and packages the license', () => {
  const workflow = readFileSync(
    join(root, '.github/workflows/release.yml'),
    'utf8',
  )
  assert.match(workflow, /\.verification\.verified/)
  assert.match(workflow, /cp LICENSE "dist\/native\/\$plugin\/LICENSE"/)
})
