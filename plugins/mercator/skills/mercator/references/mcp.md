# MCP workflow

Run Mercator through the connected MCP server at `https://mercator.sh/mcp/auth`.

1. Call `search_services` with the complete intended outcome. Pass the returned `id` unchanged to
   quoting and submission when present.
2. Call `describe_service` when you need an endpoint's authoritative `inputSchema` or `effects`.
3. Put one node per endpoint in a plan, using the exact `serviceId`, `method`, and `path`.
4. Call `quote_plan` with the plan. Quotes are free and expire at `validUntil`.
5. Call `create_job` with the unchanged plan, the quote's `quoteToken` as `quote_token`, its
   `totalAmount` as `approved_total`, and an `idempotency_key` you persist first.
6. Poll `get_job` with the returned `job_id` until the status is terminal. Use
   `result_mode: "summary"` for large results and `get_job_details` for one node.

- Hosted OAuth access-key limits authorize spending without per-job approval; still respect any
  budget the user gave. `get_connection_status` reports connection and payment readiness for free.
- To search only chosen providers, pass `service_ids` with `service_mode: "require"`; use
  `"prefer"` to rank them first and keep fallbacks.
- For a known plan, `create_job` accepts `max_total` instead of `quote_token` and
  `approved_total`; it returns `quote_changed` without charging when the live total is higher.
- `list_recipes` and `build_recipe_plan` turn curated recipes into quotable plans.
- When `describe_service` lists `effects` or `quote_plan` lists them in `next_action`, confirm them
  with the user before submitting. Mercator cannot undo orders, messages, uploads, or calls.
- Live tool schemas and returned `next_action` values take precedence over this file.
