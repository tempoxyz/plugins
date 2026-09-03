import { describe, expect, test } from 'vitest'

type JsonRpcResult<T> = {
  error?: unknown
  result: T
}

type Tool = {
  annotations?: {
    destructiveHint?: boolean
    readOnlyHint?: boolean
  }
  name: string
}

const tempoDocsUrl = 'https://mcp.tempo.xyz'
const mercatorUrl = 'https://mercator.tempo.xyz/mcp/auth'

describe('production MCP endpoints', () => {
  let requestId = 0

  const call = async <T>(url: string, method: string, params: unknown): Promise<T> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
    })
    expect(response.status, `${method} returned ${response.status}`).toBe(200)

    const body = await response.text()
    const data = body
      .split('\n')
      .find((line) => line.startsWith('data:'))
      ?.slice('data:'.length)
      .trim()
    const message = JSON.parse(data ?? body) as JsonRpcResult<T>
    expect(message.error, `${method}: ${JSON.stringify(message.error)}`).toBeUndefined()
    return message.result
  }

  test('Tempo Docs exposes the expected read-only tools', async () => {
    await call(tempoDocsUrl, 'initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'tempo-plugin-smoke', version: '0.1.0' },
    })

    const tools = await call<{ tools: Tool[] }>(tempoDocsUrl, 'tools/list', {})
    expect(tools.tools.map((tool) => tool.name)).toEqual([
      'search',
      'find_pages',
      'read_page',
      'code',
    ])
    for (const tool of tools.tools) {
      expect(tool.annotations, `${tool.name} is missing annotations`).toBeDefined()
      expect(tool.annotations?.readOnlyHint, tool.name).toBe(true)
      expect(tool.annotations?.destructiveHint, tool.name).toBe(false)
    }

    const cases = [
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
          max_chars: 1_500,
          response_format: 'structured',
        },
      ],
    ] as const

    for (const [name, args] of cases) {
      const result = await call<{ isError?: boolean }>(tempoDocsUrl, 'tools/call', {
        name,
        arguments: args,
      })
      expect(result.isError, name).not.toBe(true)
      expect(JSON.stringify(result).length, `${name} returned too little data`).toBeGreaterThan(100)
    }
  })

  test('Mercator advertises its OAuth resource metadata', async () => {
    const response = await fetch(mercatorUrl, {
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
    expect(response.status).toBe(401)
    expect(response.headers.get('www-authenticate') ?? '').toMatch(/resource_metadata=/)
  })
})
