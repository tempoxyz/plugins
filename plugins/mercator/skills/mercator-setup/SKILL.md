---
name: mercator-setup
description: Install, connect, or troubleshoot Mercator in agent clients. Use for plugin setup, OAuth authorization, missing tools, connection diagnostics, and wallet funding readiness. For discovery and paid API execution on a working connection, use mercator.
license: MIT
---

# Mercator setup

Connect the user's chosen agent client to Mercator and verify transport, discovery, and payment
readiness separately. Setup itself does not require a paid job or a local wallet.

## Choose the setup path

- **Plugin already installed:** inspect the client's MCP connection and complete its native
  **Authorize** action. Reload the plugin or start a new session if tools are missing. Do not
  install a second copy merely because authorization is incomplete.
- **Local client, CLI available:** run `mercator status`, then `mercator setup` for installation
  or repair. Honor the user's client choice with `--client`; inspect `mercator setup --help`
  for supported values. Interactive setup selects detected clients; preserve unrelated clients.
- **Local client, CLI absent:** use the canonical standalone installer below. It installs the CLI
  and starts setup without requiring Node.js. Pass `--client` when the user chose a client.
- **Managed or cloud host:** use its native plugin and OAuth controls. Installing a CLI in an
  agent container does not configure the user's desktop client.
- **Other MCP client:** `mercator setup --manual` prints configuration guidance without modifying
  integrations. Configure Streamable HTTP at `https://mercator.sh/mcp/auth` and finish
  OAuth in that client. If client registration is required, read
  [Mercator authentication](https://mercator.sh/auth.md).

```bash
curl -fsSL https://mercator.sh/install.sh | sh
```

For a selected client, append setup arguments with `sh -s -- --client <client>`.
Grok CLI authorization is handled by `mercator setup --client grok`; it uses browser OAuth with
loopback PKCE. Use `--force` only when the registration needs replacing. OpenClaw and Hermes use
runtime-native MPP wallets and the legacy `/mcp` endpoint; retain their setup-managed configuration.

## Verify without spending

1. Inspect native MCP status. If the CLI is available, run `mercator doctor`. A valid OAuth
   challenge proves transport availability, not successful authorization or paid readiness.
2. Complete browser authorization if needed. The user chooses wallet access limits and expiry;
   never request a wallet key or copy OAuth tokens into chat or commands.
3. On the connected server, call the free `search_services` tool with a simple data lookup to
   verify discovery. Do not submit a job as a connection test.
4. Call `get_connection_status` to inspect hosted authorization, token balances, access-key
   expiry/status, and remaining limits. Unavailable chain reads mean unknown, not zero. A `ready`
   key can make its first payment using its signed grant ceiling before live limits activate.
   `oauthAuthenticated: false` identifies the legacy payment-challenge path, not a hosted grant.

Report what was verified and what still needs user action. Zero funding or zero spending authority
can coexist with successful connection and discovery. Once connected, use the `mercator` skill for
requested research or API execution.

## Troubleshoot the failed layer

| Symptom | Next action |
| --- | --- |
| Plugin or server missing | Check the selected client's registration with native controls or `mercator status`; rerun targeted setup when absent. |
| Tools missing after install | Reload the plugin or start a fresh session; inspect the client's MCP status. |
| HTTP 401 or authorization pending | Complete native browser authorization; for Grok CLI, rerun its targeted setup. |
| Discovery not verified | Resolve transport or OAuth first, then retry the free search probe. |
| Search works, paid execution unavailable | Inspect connection status for funding, expiry, revocation, and token limits. |
| Unfunded authorized token | Open `https://mercator.sh/account` or use `fund_wallet` when available; the user chooses the funding amount. |
| Expired/revoked key or insufficient authority | Manage the grant in Account and reconnect through OAuth for user-selected limits. |
| Setup failure persists | Run `mercator setup --client <client> --verbose` for the affected client and inspect its bounded diagnostics. |

Do not install or create a local payment wallet to repair hosted OAuth. Never include credentials,
OAuth codes, payment material, or raw provider data in diagnostics shared with others.
