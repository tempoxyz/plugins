# Distribution guide

Use the canonical generated artifacts and validations below when publishing a
plugin. Track rollout status and reviewer feedback in GitHub issues.

| Channel | Artifact | Validation | Publication |
|---|---|---|---|
| OpenAI Plugins Directory | `submissions/openai/docs.md` | MCP and skill tests | Submit `docs` through Apps Management |
| Codex marketplace | `.agents/plugins/marketplace.json` | Repository installation | Add the repository marketplace |
| Claude Code | `.claude-plugin/marketplace.json` | `claude plugin validate .` | Submit at `platform.claude.com/plugins/submit` |
| Cursor | `.cursor-plugin/marketplace.json` | Manifest and repository import | Submit the repository URL |
| Gemini CLI | `npm run build:gemini` | Link the generated extension | Mirror one extension per root repository and add the gallery topic |
| GitHub Agent Skills | `plugins/*/skills/*` | `gh skill publish --dry-run` | Publish a signed version tag and release |
| skills.sh | Agent Skill directories | `npx skills add <repository>` | Confirm installation and discovery |
| MCP Registry | `registry/*/server.json` | JSON and endpoint checks | Verify DNS and run `mcp-publisher publish` |
| Smithery | Hosted MCP URLs | Endpoint checks | Publish each URL and complete its server scan |

Only submit `docs` to the OpenAI directory. The paid digital-service and
transaction workflows in `wallet` and `mercator` do not meet its commerce
rules. They remain eligible for stores that permit and accurately disclose
those capabilities.
