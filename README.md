<br>
<br>

<p align="center">
  <a href="https://tempo.xyz">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset=".github/assets/tempo-wordmark-white.svg">
      <img alt="Tempo wordmark" src=".github/assets/tempo-wordmark-black.svg" width="360">
    </picture>
  </a>
</p>

<br>
<br>

# Tempo Plugins

Official plugins for building on Tempo with AI agents and developer tools. Install the documentation plugin as `docs@tempo`, then add product-specific plugins as needed.

[tempo.xyz/developers](https://tempo.xyz/developers)

## Plugins

| Plugin | Description |
| --- | --- |
| [`docs`](./plugins/docs) | Search and read Tempo documentation through the hosted MCP server. |
| [`tempo-wallet`](./plugins/tempo-wallet) | Set up Tempo Wallet and make explicitly approved paid requests. |
| [`mercator`](./plugins/mercator) | Discover, quote, and run paid API workflows. |

## Usage

```sh
# Codex
codex plugin marketplace add tempoxyz/plugins
codex plugin add docs@tempo

# Claude Code
claude plugin marketplace add tempoxyz/plugins
claude plugin install docs@tempo

# GitHub Agent Skills
gh skill install tempoxyz/plugins docs
```

The repository also contains Cursor manifests and generated Gemini CLI
extensions. See [`submissions`](./submissions) for platform-specific release
requirements.

## Development

```sh
npm test          # Validate manifests, distributions, and repository policy
npm run test:mcp  # Smoke-test production MCP endpoints
```

Repository tooling is TypeScript and tested with Vitest. The Mercator skill is
generated from its private product repository; changes arrive here through a
signed synchronization pull request.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Security

See [`SECURITY.md`](./SECURITY.md).

## License

Licensed under the [MIT License](./LICENSE).
