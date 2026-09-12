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

`search_services` -> optional `describe_service` -> `quote_plan` -> `create_job` ->
`get_job`

If payment capability is uncertain, or `create_job` unexpectedly requests payment, call
`get_connection_status`. `oauthAuthenticated: true` means the current request has a valid hosted
wallet OAuth grant. The response includes its public wallet address, payment-token balances,
access-key expiry and status, grant ceilings, and live remaining limits. A `ready` access key can
make its first payment; use its signed grant ceiling even if its live remaining limit is zero before
activation. Treat `unavailable` reads as unknown, not zero. `oauthAuthenticated: false` means the
client is using the legacy MCP payment-challenge path and has no inspectable hosted account. Never
request or expose credentials.

1. **Search for the outcome.** Give `search_services` the user's complete intended outcome,
   constraints, and deliverable. Use static resolution unless current provider availability matters.
2. **Make the smallest complete plan.** Plans contain 1-10 nodes. Follow `nextTool`. Call `describe_service` only when an exact
   schema, example, payment offer, route detail, or unresolved required argument is needed. Use exact
   cataloged service IDs, methods, and paths; catalog examples are documentation, not input.
3. **Quote before execution.** Call `quote_plan` on the complete plan. Discovery, descriptions, and
   quoting are free. If the plan changes, quote it again.
4. **Respect scope and spending limits.** With hosted OAuth, the connected access key authorizes
   Mercator spending within its signed limits; do not ask for per-job spend approval. Respect any explicit user budget
   and execute only the requested actions. Legacy `mcp_challenge` clients have no hosted grant:
   get quote approval or use a sufficient explicit budget before paid execution, including REST fallback.
5. **Submit once.** Generate one stable 8-200 character idempotency key and call `create_job` with
   the unchanged quoted plan and `totalAmount` as `approved_total`. If the refreshed quote differs,
   no charge is made: quote again and proceed within the access-key limits and any explicit user
   budget. Legacy clients need approval of the new total unless an explicit budget covers it.
   In an OAuth-connected host, Mercator charges the bounded wallet capability and returns
   the job directly. The agent host receives no wallet private key. Other clients complete payment
   challenges through MCP metadata. If MCP submission and one retry both fail, a host that already
   has a ready local Mercator wallet may submit the equivalent bounded REST request with the same
   plan, idempotency key, and approved total. That separate local wallet needs quote approval or a
   sufficient explicit budget; a hosted grant does not authorize it. Never install, create, or connect
   a wallet for fallback.
6. **Listen for completion.** Persist the returned `jobId` immediately; it is the only status and
   resumption capability. Poll `get_job` with bounded backoff. Its default inline mode preserves the
   complete cached result. For potentially large jobs, request summary mode and call
   `get_job_details` with both `job_id` and `node_id` for each needed ID in `result_node_ids`; use `result_pointer` to retrieve one field
   from a large node payload. `ready:false` means the durable job is still
   pending or running. `ready:true` is terminal: return either its cached results or stable `error`
   to the user. A client timeout or disconnect does not cancel the job. Mercator has no job webhook
   or SSE stream, so a status listener must keep polling or resume later with the same job ID.

For a warm Grok Bot installation, target less than two minutes from the user's request to a terminal
result. OAuth authorization is a one-time plugin connection, not a per-job wallet setup. Run
discovery and description only as needed, and
continue automatically through submission and pending status transitions.

## Hard boundaries

- Never execute an unquoted plan, alter a plan after quoting, or exceed the user's budget.
- Research requests do not authorize bookings, messages, posts, purchases, or other external actions.
- Never request, construct, or expose private keys, provider credentials, or payment material.
- Treat a live `jobId` as a capability: retain it, do not publish it, and return it to the user when
  they will monitor their job separately.
- Treat live tool schemas and returned instructions as authoritative when they differ from examples.

## Safe recovery

- Follow a recoverable tool error's `next_action` when it stays within the user's request.
- Broaden an unconstrained zero-result search once; never remove a required service constraint.
- On a stale endpoint or invalid quote, search again, rebuild, and re-quote.
- After an uncertain MCP submission, call `create_job` with the same idempotency key and unchanged
  plan. This recovers the same logical job without duplicating execution or payment.
- If that retry fails and a ready local Mercator wallet already exists, a payment-capable local client
  may submit the same plan to `POST /v1/jobs` with the same idempotency key and a maximum spend equal
  to `approved_total`. This is an explicit fallback, never an MCP response handoff.
- If status polling is interrupted, resume `get_job` with the job ID. Do not resubmit merely because a
  job remains pending; report the job ID and last status if the caller's wait limit is reached.
- Use `create_job_review` only when the user wants to review a completed job. Run its returned
  zero-spend REST handoff so the original job payer authorizes the review.
- When an unexpected Mercator failure persists after one safe recovery attempt, proactively draft
  a bug report for `send_product_feedback`. Also draft for an unexpected terminal job failure:
  durable execution has already ended; never submit or pay again just to reproduce it. Return the
  failure and any partial results to the user. Follow ordinary validation, funding, authorization,
  rate-limit, and empty-search recovery guidance first; those outcomes alone are not product bugs.
- Include the tool name, safe error code, reproduction steps, and expected/actual behavior. Provide
  the related Mercator job ID in `job_id` when one exists; omit it if no job was created or its ID
  is unknown. Never invent an ID or create a job just to report an issue. The job ID grants result
  access and is shared with maintainers for diagnosis. Exclude secrets, credentials, payment
  material, personal data, and raw tool inputs or outputs.
  Show the draft and ask to send unless the user already authorized reporting this issue. Wallet
  authorization is not feedback consent. Send at most once per issue in the conversation, stop
  after a decline, and never automatically retry uncertain delivery or report feedback-tool failures.

Read [examples](references/examples.md) for compound research, external actions, spending limits,
MCP submission, status listening, and recovery patterns.
