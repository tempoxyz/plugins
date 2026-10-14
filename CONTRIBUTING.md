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

When an intentional catalog change affects generated output, run
`npm run update:goldens` and review every fixture diff before running the full
test suite. CI compares every platform manifest with these golden files.

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
- All changes must pass validation and use signed commits.
- Use the canonical Tempo and Mercator brand assets.
- Skills under `plugins/*/skills/` are generated from the repositories listed
  in [`skills.json`](./skills.json). Edit the source repository, not the copy;
  CI rejects copies that no longer match `skills.lock.json`.
- `.github/workflows/sync-skills.yml` opens one signed pull request per plugin
  when a source changes, bumps that plugin's patch version, and merges once
  validation passes.
- To distribute a new skill, add an entry to `skills.json`. A private source
  repository also needs a `.github/sts/skill-sync-read.sts.yaml` read policy;
  see the [skill-sync action](https://github.com/tempoxyz/gh-actions/tree/main/actions/skill-sync).
- Report marketplace compatibility changes through an issue and update the
  corresponding manifest, test, and submission notes together.
