# Contributing

Keep each plugin self-contained under `plugins/<name>`. Update every platform
manifest when metadata or versions change.

Before opening a pull request:

```bash
npm test
claude plugin validate --strict .
gh skill publish --dry-run
```

Use conventional commits. All commits must be cryptographically signed.
