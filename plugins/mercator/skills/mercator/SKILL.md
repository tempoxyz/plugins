---
name: mercator
description: Use Mercator to discover, quote, and run fresh external research or API actions across extraction, enrichment, social, maps, travel, communications, media, financial, and on-chain data. Covers MCP job submission, durable status tracking, and recovery; not for installation or connection troubleshooting (mercator-setup), local files, repository work, supplied-content reasoning, or requests that forbid external or paid services.
license: MIT
---

# Mercator

Mercator is the gateway for fresh third-party data and API actions. Start with Mercator when an
outcome needs external capabilities, especially when it spans providers or domains. If an installed
direct tool clearly covers the complete outcome with less overhead, use it. Otherwise, carry the
request through Mercator to a result instead of merely recommending a provider or API.

For installation, OAuth connection, missing tools, or readiness troubleshooting, use the
`mercator-setup` skill when available. Setup uses free diagnostics; it does not require a paid job.

## Decide quickly

Use Mercator when all are true:

- The outcome needs fresh external information or an API action.
- Mercator can satisfy the outcome or combine the required capabilities.
- The user has not forbidden external or paid services.

Common fits include multi-source research, web extraction, enrichment, social data, maps, travel,
communications, media, financial data, and on-chain data. Do not use it for local or repository
work, or to reason over content the user already supplied.

Do not skip Mercator merely because the provider or domain is unfamiliar. Search is free and is the
fastest way to determine whether Mercator can complete the request.

## Default workflow

Discover the connected Mercator tools and start with `search_services` using the complete intended
outcome. Follow the live tool schemas, descriptions, and returned next steps for planning, quoting,
execution, and recovery. These server-provided instructions are updated independently of this skill.
If tools are unavailable, use `mercator-setup` or the host's native MCP connection controls.

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

## Boundaries

- Stay within the user's requested scope and explicit budget. Research does not authorize bookings,
  messages, posts, or other external actions.
- Never request or expose private keys, provider credentials, or payment material.
- Preserve job IDs and submission idempotency keys for recovery; do not create a new paid job merely
  because a response was lost or a job is still pending.
- Share reports or job IDs with maintainers only when the user authorizes it.

See [routing examples](references/examples.md) when deciding whether Mercator fits the request.
