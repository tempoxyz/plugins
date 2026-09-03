# Gemini CLI distribution

Build standalone extension trees:

```bash
npm run build:gemini
```

Each `dist/gemini/<plugin>` directory has a root `gemini-extension.json` and its
skills. Link one locally with:

```bash
gemini extensions link dist/gemini/tempo-docs
```

The public gallery requires one public GitHub repository per extension because
`gemini-extension.json` must be at the repository root. Mirror the generated
directory, add the `gemini-cli-extension` topic, and use the default branch as
the stable channel. Gemini’s crawler indexes tagged repositories daily.
