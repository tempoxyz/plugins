# REST workflow

Call Mercator over HTTP at `https://mercator.sh/v1` from code that does not use MCP. The
[OpenAPI specification](https://mercator.sh/openapi.json) is authoritative.

1. `GET /v1/services/search` with the complete intended outcome.
2. `GET /v1/services/{serviceId}` when you need the endpoint's `inputSchema` or `effects`.
3. Save the plan with one node per endpoint:

   ```json
   {
     "nodes": [{
       "id": "filing",
       "serviceId": "{{SERVICE_ID}}",
       "method": "{{METHOD}}",
       "path": "{{PATH}}",
       "input": {"query": "latest official NVIDIA SEC filing"},
       "dependsOn": []
     }]
   }
   ```

4. `POST /v1/quote` with the plan. Quotes are free and expire at `validUntil`.
5. `POST /v1/jobs` with a JSON body holding the unchanged `plan`, `quoteToken`, `totalAmount` as
   `approvedTotal`, and an `idempotencyKey` (8 to 200 characters) you persist first.
6. `GET /v1/jobs/{jobId}` until the status is terminal. Send `Prefer: wait=20` to wait in one
   request, and use `GET /v1/jobs/{jobId}/results/{nodeId}` for one node.

| Operation | Authentication |
| --- | --- |
| Search, describe, quote | None |
| Create a job | Hosted OAuth wallet or a supported payment client |
| Read a hosted wallet job | The original payer's OAuth bearer or account session |
| Read a direct payer job | The private job ID |
| Download an artifact | The signed `url` from a job read; it expires after 1 hour |

- Native MPP and local wallets need quote approval or a sufficient explicit budget before paying.
- For a known plan, send `maxTotal` instead of `quoteToken` and `approvedTotal`; the job fails with
  `quote_changed` before payment when the live total is higher.
- Retry a lost submission with the same `idempotencyKey` and unchanged plan. A new key can create a second paid
  job; a pending or running job (HTTP `202`) needs polling, not resubmission.
- Confirm listed `effects` with the user before submitting. Mercator cannot undo them.
