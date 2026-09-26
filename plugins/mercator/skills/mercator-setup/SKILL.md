---
name: mercator-setup
description: Install, connect, or troubleshoot Mercator in agent clients. Use for plugin setup, OAuth authorization, missing tools, connection diagnostics, and wallet funding readiness. For discovery and paid API execution on a working connection, use mercator.
license: MIT
---

# Mercator setup

Connect the user's chosen client and verify readiness with free checks. Setup does not require a
paid job or a local payment wallet.

## Connect or repair

- Identify the user's app and mode first; ask if unclear. Do not infer local terminal access
  from the agent's ability to run commands in a sandbox.
- **Claude Desktop chat or claude.ai:** direct the user to **Customize → Connectors → Add custom
  connector**, name it **Mercator**, and enter `https://mercator.sh/mcp/auth`. The user completes
  connection and authorization. Do not run the installer in the chat sandbox. `--client claude`
  means Claude Code, not Desktop chat.
- **Plugin installed:** inspect native MCP status and complete the client's **Authorize** action.
  Follow the activation steps below if tools are missing; avoid installing a duplicate.
- **Local client:** run `mercator status`, then `mercator setup` to install or repair. Consult
  `mercator setup --help` and honor the user's client choice with `--client`.
- **CLI absent:** install and start setup with the canonical command below. Append setup arguments
  with `sh -s -- --client <client>` when the user selected a client.
- **Managed or cloud host:** use native plugin and OAuth controls. A CLI inside an agent container
  does not configure the user's desktop.
- **Other MCP client:** run `mercator setup --manual` for current connection instructions.

```bash
curl -fsSL https://mercator.sh/install.sh | sh
```

## Activate after installation

| Client / change | Next step |
| --- | --- |
| Claude Code terminal plugin | Run `/reload-plugins` in the existing session after installer or CLI plugin changes. If it warns about the prompt cache, use `/reload-plugins --force`. Restart Claude Code if unavailable. Native `/plugin` installs can activate in place. |
| Claude Code without an interactive terminal | Start a new session for plugin MCP changes. |
| Codex plugin | Check plugin/MCP status first: recent versions support live refresh (CLI 0.154.0 includes fixes for installed tools and externally updated skills). If tools remain missing, fully quit and reopen the desktop app, or exit and resume the CLI. A new desktop task alone may not refresh the running host. |
| Codex `AGENTS.md` guidance | Start a new session to load changed instructions. |
| Grok plugin | Restart Grok after a plugin refresh when setup requests it. |
| Standalone MCP registration | If Mercator is missing, restart the client, then complete its OAuth. Plugin reload does not guarantee that configuration written by `mercator setup` is loaded. |
| `mercator refresh` | Updates installer-managed files; it does not restart the running client. Do not kill the user's session or claim tools are active based only on installation success. |
| Current agent cannot reload | Report the exact next action to the user. For immediate shell-based access, `mercator login`, `mercator tools`, and `mercator call` use the separate CLI connection; they do not activate tools in the running agent. |

## Verify and recover

- If an embedded browser cannot use the user's passkey, use **Continue in another browser** on
  Mercator's approval page. For an unreachable localhost callback, return the one-time completion
  link shown after approval to the same client. Use the client's documented code input or port
  forwarding if it cannot accept the full link. Keep the link out of shared diagnostics.
- Run `mercator doctor` when available and follow its diagnostics. Use targeted
  `mercator setup --client <client> --verbose` for persistent setup failures.
- On the connected server, inspect live tool descriptions and call `search_services` and
  `get_connection_status` for free discovery and payment-readiness checks. Follow their returned
  next steps. An OAuth challenge alone does not prove authorization or paid readiness.
- Report verified readiness and remaining user actions. Never create a paid job as a connection test.
- The user chooses wallet access limits, expiry, and funding. Never request private keys, copy tokens
  into chat, or install a local payment wallet to repair hosted OAuth.
- Exclude credentials, OAuth codes, payment material, and raw provider data from shared diagnostics.

## Feedback

- When an unexpected failure persists after one safe recovery attempt, proactively draft a report
  for `send_product_feedback`.
- Include the tool or command, safe error code, reproduction steps, and expected versus actual
  behavior. Follow live tool schemas.
- Exclude secrets, credentials, payment material, personal data, and raw inputs or outputs. Include
  a known job ID only when authorized; sharing it gives maintainers access to job results.
- Show the draft and ask before sending unless the user already authorized reporting this issue.
  Stop after a decline.
- Send at most once per issue. Do not retry uncertain delivery or report feedback-tool failures.
  Never create a paid job just to report a problem.
- If Mercator tools remain unavailable, show the sanitized report to the user and leave it unsent.
