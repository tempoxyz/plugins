import assert from 'node:assert/strict'

const tempoDocsUrl = 'https://mcp.tempo.xyz'
const mercatorUrl = 'https://mercator.tempo.xyz/mcp/auth'
let requestId = 0

const call = async (url, method, params) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
  })
  assert.equal(response.status, 200, `${method} returned ${response.status}`)

  const body = await response.text()
  const data = body
    .split('\n')
    .find((line) => line.startsWith('data:'))
    ?.slice('data:'.length)
    .trim()
  const message = JSON.parse(data ?? body)
  assert.equal(message.error, undefined, `${method}: ${JSON.stringify(message.error)}`)
  return message.result
}

await call(tempoDocsUrl, 'initialize', {
  protocolVersion: '2025-06-18',
  capabilities: {},
  clientInfo: { name: 'tempo-plugin-smoke', version: '0.1.0' },
})

const tools = await call(tempoDocsUrl, 'tools/list', {})
assert.deepEqual(
  tools.tools.map((tool) => tool.name),
  ['search', 'find_pages', 'read_page', 'code'],
)
for (const tool of tools.tools) {
	assert.ok(tool.annotations, `${tool.name} is missing annotations`)
	assert.equal(tool.annotations.readOnlyHint, true, tool.name)
	assert.equal(tool.annotations.destructiveHint, false, tool.name)
}

for (const [name, args] of [
  [
    'search',
    {
      query: 'How do I connect a TypeScript app to Tempo?',
      source: 'tempo',
      max_results: 3,
      response_format: 'structured',
    },
  ],
  [
    'find_pages',
    {
      source: 'tempo',
      query: 'sponsored transactions',
      response_format: 'structured',
    },
  ],
  [
    'read_page',
    {
      source: 'tempo',
      path: '/quickstart/connection-details',
      max_chars: 1500,
      response_format: 'structured',
    },
  ],
]) {
  const result = await call(tempoDocsUrl, 'tools/call', {
    name,
    arguments: args,
  })
  assert.notEqual(result.isError, true, name)
  assert.ok(JSON.stringify(result).length > 100, `${name} returned too little data`)
}

const mercator = await fetch(mercatorUrl, {
  method: 'POST',
  headers: {
    Accept: 'application/json, text/event-stream',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: ++requestId,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'tempo-plugin-smoke', version: '0.1.0' },
    },
  }),
})
assert.equal(mercator.status, 401)
assert.match(mercator.headers.get('www-authenticate') ?? '', /resource_metadata=/)

console.log('Tempo Docs tools and Mercator OAuth challenge passed live MCP smoke tests')
