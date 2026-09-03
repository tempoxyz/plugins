# Contributing

Keep each plugin self-contained under `plugins/<name>`. Update shared metadata
in `manifest.config.ts`, then run `npm run build`. Do not edit generated JSON
manifests directly.

## Pull requests

Before opening a pull request:

```sh
npm test
npm run test:mcp
claude plugin validate --strict .
gh skill publish --dry-run
```

Run `npm run format:json` after changing JSON files. CI rejects malformed or
non-canonical JSON through `npm run check:json`.

Live MCP checks may be omitted only when the endpoint is unavailable for a
known, tracked reason. Use conventional commits. Sign every commit and release
tag cryptographically.

## Releases

1. Update the plugin version in `manifest.config.ts`.
2. Run `npm run build`, then run the validation commands above and inspect the generated files.
3. Merge through a pull request with required checks passing.
4. Create and push a signed `v*` tag from `main`.

The release workflow verifies the tag signature and publishes native and Gemini
archives. Repository tags identify immutable snapshots; plugin manifests carry
the independently versioned plugin releases.

## Maintenance

- Dependabot checks pinned workflow actions weekly.
- Production MCP endpoints are smoke-tested daily.
- `main` requires validation and signed commits; human approvals are not required.
- Tempo marks are copied from `tempoxyz/tempo-web/public/images/icons/logo-compact.svg`.
- Mercator's icon is copied from `tempoxyz/mercator/apps/web/public/favicon.svg`.
- The Mercator skill is generated from private `tempoxyz/mercator`. Do not edit its public copy.
- Its automation uses a short-lived token scoped to this repository and opens a signed pull request.
- Report marketplace compatibility changes through an issue and update the
  corresponding manifest, test, and submission notes together.
