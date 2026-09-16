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
`get_connection_status`:

- `oauthAuthenticated: true`: the request has a valid hosted wallet OAuth grant. Inspect its public
  wallet address, balances, access-key status and expiry, grant ceilings, and live remaining limits.
- `ready`: the key can make its first payment. Before activation, use its signed grant ceiling even
  when the live remaining limit is zero.
- `unavailable`: the chain read is unknown, not zero.
- `oauthAuthenticated: false`: the client uses the legacy MCP payment-challenge path and has no
  inspectable hosted account.
- Never request or expose credentials.

1. **Search for the outcome.** Give `search_services` the user's complete intended outcome,
   constraints, and deliverable. Set `resolution` to `live` so Mercator probes candidate availability
   before planning.
2. **Make the smallest complete plan.** Plans contain 1-10 nodes. Follow `nextTool`. Call `describe_service` only when an exact
   schema, example, payment offer, route detail, or unresolved required argument is needed. Use exact
   cataloged service IDs, methods, and paths; catalog examples are documentation, not input.
3. **Quote before execution.** Call `quote_plan` on the complete plan. Discovery, descriptions, and
   quoting are free. If the plan changes or `validUntil` has elapsed, quote it again.
4. **Respect scope and spending limits.** With hosted OAuth, the connected access key authorizes
   Mercator spending within its signed limits; do not ask for per-job spend approval. Respect any explicit user budget
   and execute only the requested actions. Legacy `mcp_challenge` clients have no hosted grant:
   get quote approval or use a sufficient explicit budget before paid execution, including REST fallback.
5. **Submit once.** Generate and persist one stable 8-200 character `idempotency_key` and call `create_job` with
   the unchanged quoted plan and `totalAmount` as `approved_total`.
   - Changed quote: no charge occurs. Quote again and continue only within the access-key limits and
     any explicit user budget. Legacy clients need approval unless that budget covers the new total.
   - Hosted OAuth: Mercator charges the bounded wallet capability and returns the job. The agent host
     receives no wallet private key.
   - Legacy client: complete the payment challenge through MCP metadata.
   - Failed MCP submission and one identical retry: use REST only when the host already has a ready
     local Mercator wallet. Keep the plan, `idempotency_key`, and approved total unchanged. Obtain quote
     approval or stay within an explicit budget; the hosted grant does not authorize the local wallet.
   - Never install, create, or connect a wallet for fallback.
6. **Listen for completion.** Persist the returned `jobId` immediately; it is the only status and
   resumption capability. Poll `get_job` with bounded backoff.
   - Default inline mode returns the complete cached result.
   - For large jobs, request summary mode. Call `get_job_details` with `job_id` and each needed
     `node_id` from `result_node_ids`; use `result_pointer` for one field from a large node payload.
   - `ready:false`: the job remains pending or running.
   - `ready:true`: return the cached result or stable `error`.
   - A timeout or disconnect does not cancel the job. Mercator has no webhook or SSE stream; keep
     polling or resume later with the same job ID.

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
- Draft `send_product_feedback` after one safe recovery fails or an unexpected terminal job failure
  occurs. Never submit or pay again merely to reproduce it. Return failures and partial results.
- Do not treat ordinary validation, funding, authorization, rate-limit, or empty-search outcomes as
  product bugs.
- Include the tool name, safe error code, reproduction steps, and expected/actual behavior.
- Include `job_id` only when a related job exists. Never invent one or create a job for reporting.
  The ID grants result access and is shared with maintainers.
- Exclude secrets, credentials, payment material, personal data, and raw tool inputs or outputs.
- Show the draft and ask to send unless the user already authorized reporting this issue. Wallet
  authorization is not feedback consent.
- Send at most once per issue. Stop after a decline. Never retry uncertain delivery automatically or
  report feedback-tool failures.

Read [examples](references/examples.md) for compound research, external actions, spending limits,
MCP submission, status listening, and recovery patterns.
