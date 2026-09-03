<br>

<p align="center">
  <a href="https://tempo.xyz">
    <img alt="Tempo" src="./plugins/tempo-docs/assets/favicon.svg" width="80" height="80">
  </a>
</p>

<br>

# Tempo Plugins

Official plugins for building on Tempo with AI agents and developer tools.

[tempo.xyz/developers](https://tempo.xyz/developers)

## Plugins

| Plugin | Description |
| --- | --- |
| [`tempo-docs`](./plugins/tempo-docs) | Search and read Tempo documentation through the hosted MCP server. |
| [`tempo-wallet`](./plugins/tempo-wallet) | Set up Tempo Wallet and make explicitly approved paid requests. |
| [`mercator`](./plugins/mercator) | Discover, quote, and run paid API workflows. |

## Usage

```sh
# Codex
codex plugin marketplace add tempoxyz/plugins
codex plugin add tempo-docs@tempo

# Claude Code
claude plugin marketplace add tempoxyz/plugins
claude plugin install tempo-docs@tempo

# GitHub Agent Skills
gh skill install tempoxyz/plugins tempo-docs
```

The repository also contains Cursor manifests and generated Gemini CLI
extensions. See [`submissions`](./submissions) for platform-specific release
requirements.

## Development

```sh
npm test          # Validate manifests, generated files, and repository policy
npm run test:mcp  # Smoke-test production MCP endpoints
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Security

See [`SECURITY.md`](./SECURITY.md).

## License

Licensed under the [MIT License](./LICENSE).
