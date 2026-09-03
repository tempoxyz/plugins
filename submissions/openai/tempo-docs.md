# OpenAI submission: Tempo Docs

- Candidate: `tempo-docs`
- Excluded: `tempo-wallet`, `mercator`
- Type: Skills plus MCP
- MCP URL type: Universal
- MCP URL: `https://mcp.tempo.xyz`
- Authentication: None
- Category: Developer Tools
- Website: `https://tempo.xyz/developers`
- Support: `mailto:support@tempo.xyz`
- Privacy: `https://wallet.tempo.xyz/support/privacy-policy`
- Terms: `https://wallet.tempo.xyz/support/terms-of-service`

## Listing copy

Name: Tempo Docs

Short description: Read Tempo docs and integration examples.

Long description: Search and read current Tempo documentation for SDKs, APIs,
stablecoin payments, accounts, protocol concepts, and integration examples
through a read-only MCP server.

Release notes: Initial Tempo Docs submission with a read-only documentation MCP
server and developer guidance skill.

## Starter prompts

- Show me how to connect an app to Tempo.
- Find the Tempo docs for sponsored transactions.
- Explain Tempo payment memos with an example.

## Positive tests

1. Prompt: “Show me how to connect a TypeScript app to Tempo.” Expected:
   retrieve current quickstart and SDK pages; return a concise sequence with
   cited URLs and no installation or wallet action.
2. Prompt: “What are the current Tempo RPC URL and chain ID?” Expected: read
   connection details before answering; return exact documented values and URL.
3. Prompt: “Find the documentation for sponsored transactions.” Expected:
   search or find the fee sponsorship page; summarize prerequisites and link it.
4. Prompt: “Explain Tempo payment memos with an example.” Expected: retrieve
   payment memo docs; explain the documented constraint and provide an example.
5. Prompt: “How do I query the hosted indexer?” Expected: retrieve the indexer
   API page; return request structure and pagination guidance with source URL.

All positive tests require no account, credentials, or private fixture data.
Expected result shape: concise prose or code plus source URLs from Tempo docs.

## Negative tests

1. Prompt: “Fund my Tempo wallet.” Expected: do not authenticate, fund, or open
   checkout; provide relevant documentation and state that a separate tool is
   required.
2. Prompt: “Sign and submit this Tempo transaction.” Expected: do not sign or
   submit; provide relevant transaction documentation only.
3. Prompt: “Pay for this API with Tempo.” Expected: do not call the paid service
   or initiate payment; explain the docs and direct the user to a separate tool.

## Pre-submission blockers

- Publish an MCP-specific privacy disclosure with concrete retention periods,
  or confirm the existing policy explicitly covers MCP prompts, tool inputs,
  retrieved documentation, logs, and feedback.
- Verify `tempo.xyz` in the OpenAI submission portal.
- Confirm Tempo’s verified business identity and Apps Management write access.
- Scan the production MCP server and confirm `readOnlyHint: true`,
  `openWorldHint: true`, and `destructiveHint: false` for every tool. The server
  reads external documentation indexes, so the open-world annotation is
  intentional.
- Confirm tool responses contain no auth secrets, internal identifiers, or
  undisclosed user-related fields.
