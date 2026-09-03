# Distribution tracker

The repository stays private until launch approval. `tempo-docs` is the first
public candidate; wallet and paid-action plugins remain separately installable
but are excluded from OpenAI review.

| Channel | Prepared artifact | Private validation | Public launch step |
|---|---|---|---|
| OpenAI Plugins Directory | `submissions/openai/tempo-docs.md` | MCP and skill tests | Complete policy gap, scan tools, submit draft |
| Codex team marketplace | `.agents/plugins/marketplace.json` | Local/private GitHub install | Make repository public or configure team access |
| Claude Code | `.claude-plugin/marketplace.json` | `claude plugin validate .` | Submit at `platform.claude.com/plugins/submit` |
| Cursor | `.cursor-plugin/marketplace.json` | Manifest and local import | Make repository public; submit repository URL |
| Gemini CLI | `npm run build:gemini` | Link generated extension | Mirror one extension per public root repository; add gallery topic |
| GitHub Agent Skills | `plugins/*/skills/*` | `gh skill publish --dry-run` | Make repository public; publish signed version tag/release |
| skills.sh | Agent Skill directories | `npx skills add <local path>` | Make repository public; installs drive discovery |
| MCP Registry | `registry/*/server.json` | JSON and endpoint checks | DNS verification and `mcp-publisher publish` |
| Smithery | Hosted MCP URLs | Endpoint checks | Publish URL and complete server scan |

Do not submit `tempo-wallet` or `mercator` to the OpenAI directory. Their paid
digital-service and transaction workflows conflict with current directory
commerce rules. They remain valid candidates for stores that permit those
capabilities and accurately disclose them.
