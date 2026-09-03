# MCP registries

## Official MCP Registry

Prepared metadata:

- `registry/docs/server.json`
- `registry/mercator/server.json`

Both use public Streamable HTTP endpoints. Before publishing, authenticate the
`xyz.tempo` namespace with DNS and run `mcp-publisher publish` from the matching
registry directory. The official registry is in preview.

## Smithery

Publish hosted URLs after public-launch approval:

```bash
smithery mcp publish "https://mcp.tempo.xyz" -n @tempoxyz/docs
smithery mcp publish "https://mercator.tempo.xyz/mcp/auth" -n @tempoxyz/mercator
```

Tempo Docs should scan without authentication. Mercator requires an OAuth
review session or a static server card.

## Other aggregators

Glama and other MCP directories should consume the official Registry listing.
Prefer one canonical Registry record over manually maintained copies when an
aggregator supports synchronization.
