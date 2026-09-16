# Mercator examples

These examples show routing, scope, and spending decisions. Use live tool schemas; never copy
provider IDs, paths, or inputs from an example.

## Current data

**Request:** “Compare today's weather in Boston and New York.”

Use an installed weather tool when it fully covers this request. Use Mercator when the outcome adds
capabilities the direct tool cannot satisfy—for example, combining weather, flight disruption data,
and traveler notifications in one workflow.

## Compound research

**Request:** “Investigate unusual AAVE activity across smart-money flows, holders, price, news, and
regulation; return a sourced chart. Budget: $5.”

Search with the entire outcome. Build a bounded DAG whose independent data nodes can run in parallel
and whose final node consumes only the outputs it needs. Quote the whole DAG. If the total is at most
$5 and the plan contains only the requested research, the supplied budget authorizes execution.

Use Mercator's dependency expressions inside the cataloged node inputs. For example, a downstream
summary node that depends on `holders`, `news`, and `price` can contain:

```json
{
  "id": "summarize",
  "dependsOn": ["holders", "news", "price"],
  "input": {
    "addresses": {
      "$map": {
        "from": "flow://holders/output#/rows",
        "path": "/address"
      }
    },
    "headline": "flow://news/output#/items/0/title",
    "label": {
      "$concat": ["Asset: ", "flow://price/output#/symbol"]
    }
  }
}
```

Merge that input with the exact `serviceId`, `method`, and `path` returned by discovery. A plain
`flow://node/output` reference may include an RFC 6901 JSON Pointer suffix. `$map` projects each item
from an upstream array; `$concat` combines values only when they resolve to all strings or all arrays.

Before submission, a useful confirmation is:

> I found a five-source research plan covering flows, holders, price, news, and regulation. The
> Mercator quote is $3.80, within your $5 budget. I’ll run it and return the requested sourced chart.

With hosted OAuth, the connected access key authorizes spending within its signed limits. Do not ask for per-job spend
approval; respect the explicit $5 budget and the requested scope. Legacy challenge clients can also
proceed within that explicit budget; without one, show the quote and obtain approval before paying.

## Research versus action

**Request:** “Find replacement Boston-to-London flights under $1,200.”

Search and quote a research plan. Do not book a flight: the user asked to find options.

**Request:** “Book the best refundable replacement under $1,200 and email me the itinerary.”

The requested workflow may include booking and email actions. Before execution, show the selected
plan and Mercator quote. Keep the fare within the $1,200 travel limit and Mercator's separate workflow
charge within the connected access-key limits and any explicit workflow budget.

A useful confirmation is:

> The refundable fare is $1,146 and Mercator’s workflow charge is $0.42. The plan will purchase the
> ticket and email the itinerary. I’ll run it using the connected wallet.

## Missing required input

If `search_services` returns an endpoint without a ready suggested plan node, use
`describe_service` to learn its exact schema. Ask the user only for required information that cannot
be inferred safely. Then quote the completed plan.

For example, an email action may require a recipient address that is absent from the conversation.
Ask for that address; do not invent it or quietly remove the email step.

## MCP submission and status

1. Generate and persist an 8–200 character `idempotency_key` before submission; a UUID works.
2. Call `create_job` once with the unchanged quoted plan, that key, and the quoted `totalAmount` as
   `approved_total`.
3. After a timeout or lost response, retry with the same plan, key, and approved total.

- Use a new key for a new logical job. A new key during recovery can create a second paid job.
- Omitting the key fails validation. Never reuse a key with a changed plan.
- OAuth-connected hosts charge the bounded wallet inside Mercator.
- Legacy challenge clients require quote approval or a sufficient explicit budget, including after
  a price change.
- Never install a CLI or translate MCP submission into a REST request.

For an illustrative quote with `totalAmount: "0.007"`, pass `approved_total: "0.007"`.
Preserve the exact decimal string; never guess a total or infer it from a discovery estimate.
Hosted OAuth spending is authorized by the signed access-key limits, subject to explicit user
budgets. Legacy clients need quote approval or a sufficient explicit budget. If `validUntil`
has elapsed, refresh the quote before submitting and apply the same authorization rules to any
changed price. An `approval_required` response means the quoted total was not supplied and no
charge was made: supply the actual quote total with the same plan and idempotency key.

A successful submission returns either a terminal job or a pending response:

```json
{"jobId":"4d9ea616-4223-4b9d-bd19-2d3f74c9fa4c","ready":false}
```

Persist the job ID and start a status listener with:

```json
{"job_id":"4d9ea616-4223-4b9d-bd19-2d3f74c9fa4c"}
```

- `ready:false`: wait with bounded backoff, then call `get_job` again.
- `ready:true`: stop; return the cached success result or stable failure.
- Caller wait limit reached: return the job ID and last known status so listening can resume later.
- Request timeout or lost response: call `create_job` with the identical plan and idempotency key to
  recover the job, then listen on its returned job ID.

In summary mode (`"result_mode":"summary"`), an empty `job.result` means payloads were omitted.
Use each returned `result_node_ids` value with `get_job_details`:

```json
{"job_id":"4d9ea616-4223-4b9d-bd19-2d3f74c9fa4c","node_id":"search1"}
```

Use the actual returned node ID. Alternatively, call `get_job` with `result_mode: "inline"`.
Both reads use cached outputs and do not charge again. Failed jobs may retain successful outputs.

Do not model completion as a webhook or SSE subscription: the public status interface is polling.

## Existing local wallet fallback

Use REST only when MCP submission fails, one identical retry also fails, and the host already has a
ready local Mercator wallet. Submit the same plan to `POST https://mercator.sh/v1/jobs` with
the same idempotency key and a maximum spend equal to `approved_total`. Never install, create, or
connect a wallet for fallback. A local fallback wallet needs quote approval or a sufficient explicit
budget; the hosted OAuth grant does not authorize a separate local wallet. Resume job polling through MCP `get_job` with the returned job ID.

## No result or stale endpoint

- Unconstrained search with no result: broaden the outcome once while preserving user constraints.
- Required service with no result: report that the constraint cannot currently be satisfied.
- Stale endpoint or quote failure: search again for a current alternative, rebuild the plan, and
  quote it again before submitting within the access-key limits and any explicit user budget.

## Do not activate

- “Fix the failing test in this repository.”
- “Summarize the attached PDF.”
- “Analyze this pasted JSON without calling external services.”
- “Use only free local tools.”
- A simple lookup already fully covered by a suitable installed direct tool.
