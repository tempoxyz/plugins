# Tempo plugins

Official Tempo plugins for AI agents and developer tools.

| Plugin | Purpose | OpenAI directory candidate |
|---|---|---|
| `tempo-docs` | Read Tempo documentation through the hosted MCP server | Yes |
| `tempo-wallet` | Set up Tempo Wallet and make approved paid requests | No |
| `mercator` | Discover, quote, and run paid API workflows | No |

The plugins share one canonical payload and include adapters for Codex, Claude
Code, Cursor, Agent Plugins, Gemini CLI, and GitHub Agent Skills.

## Install

### Codex

```bash
codex plugin marketplace add tempoxyz/plugins
codex plugin add tempo-docs@tempo
```

### Claude Code

```bash
claude plugin marketplace add tempoxyz/plugins
claude plugin install tempo-docs@tempo
```

### Cursor

Clone the repository and import the plugin from `plugins/tempo-docs` while the
repository is private. Public marketplace submission uses the same directory.

### GitHub Agent Skills

```bash
gh skill install tempoxyz/plugins tempo-docs
```

## Validate

```bash
npm test
npm run test:mcp
```

The second command checks the production Tempo Docs tools and Mercator OAuth
challenge. It requires internet access.

Store-specific submission copy and checklists live in `submissions/`.
