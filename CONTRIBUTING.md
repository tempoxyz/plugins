# Contributing

Keep each plugin self-contained under `plugins/<name>`. Follow existing plugin
structure and update every platform manifest when metadata or versions change.

## Pull requests

Before opening a pull request:

```sh
npm test
npm run test:mcp
claude plugin validate --strict .
gh skill publish --dry-run
```

Live MCP checks may be omitted only when the endpoint is unavailable for a
known, tracked reason. Use conventional commits. Sign every commit and release
tag cryptographically.

## Releases

1. Update the version in every manifest for each changed plugin.
2. Run the validation commands above and inspect the generated Gemini files.
3. Merge through a reviewed pull request with required checks passing.
4. Create and push a signed `v*` tag from `main`.

The release workflow verifies the tag signature and publishes native and Gemini
archives. Repository tags identify immutable snapshots; plugin manifests carry
the independently versioned plugin releases.

## Maintenance

- Dependabot checks pinned workflow actions weekly.
- Production MCP endpoints are smoke-tested daily.
- `main` requires validation, review, and resolved review threads.
- Report marketplace compatibility changes through an issue and update the
  corresponding manifest, test, and submission notes together.
