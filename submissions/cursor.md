# Cursor submission

Submit `https://github.com/tempoxyz/plugins` at
`https://cursor.com/marketplace/publish` after the repository is public.

Checklist:

- `.cursor-plugin/marketplace.json` lists unique plugin names.
- Each plugin has `.cursor-plugin/plugin.json`, a committed logo, README-level
  usage documentation, valid relative paths, and no undeclared variables.
- Submit `tempo-docs` first. Review `tempo-wallet` and `mercator` separately
  because they can install software, authenticate, pay, and change external
  state.
