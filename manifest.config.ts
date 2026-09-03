export type PluginDefinition = {
  name: string
  version: string
  codexVersionSuffix?: string
  description: string
  displayName: string
  homepage: string
  keywords: readonly string[]
  category: string
  claudeCategory: string
  icon: string
  interface: {
    shortDescription: string
    longDescription: string
    capabilities: readonly string[]
    websiteURL: string
    privacyPolicyURL?: string
    termsOfServiceURL?: string
    defaultPrompt: readonly string[]
    brandColor: string
  }
  mcp?: {
    serverName: string
    url: string
    note: string
    registryDescription: string
  }
}

export const catalog = {
  name: 'tempo',
  displayName: 'Tempo',
  description: 'Tempo plugins for documentation and current-data API workflows.',
  repository: 'https://github.com/tempoxyz/plugins',
  license: 'MIT',
  author: {
    name: 'Tempo',
    email: 'support@tempo.xyz',
    url: 'https://tempo.xyz',
  },
} as const

export const plugins: readonly PluginDefinition[] = [
  {
    name: 'docs',
    version: '0.1.0',
    description: 'Read Tempo documentation and use its examples while building on Tempo.',
    displayName: 'Tempo Docs',
    homepage: 'https://tempo.xyz/developers/docs/guide/using-tempo-with-ai',
    keywords: ['tempo', 'documentation', 'mcp', 'stablecoins', 'payments'],
    category: 'Developer Tools',
    claudeCategory: 'development',
    icon: 'tempo-mark.svg',
    interface: {
      shortDescription: 'Read Tempo docs and integration examples.',
      longDescription: 'Search and read current Tempo documentation for SDKs, APIs, stablecoin payments, accounts, protocol concepts, and integration examples through a read-only MCP server.',
      capabilities: ['Read'],
      websiteURL: 'https://tempo.xyz/developers',
      privacyPolicyURL: 'https://wallet.tempo.xyz/support/privacy-policy',
      termsOfServiceURL: 'https://wallet.tempo.xyz/support/terms-of-service',
      defaultPrompt: [
        'Show me how to connect an app to Tempo.',
        'Find the Tempo docs for sponsored transactions.',
        'Explain Tempo payment memos with an example.',
      ],
      brandColor: '#000000',
    },
    mcp: {
      serverName: 'docs',
      url: 'https://mcp.tempo.xyz',
      note: 'Read-only Tempo documentation search, page discovery, page reads, and multi-step lookups.',
      registryDescription: 'Search and read current Tempo developer documentation.',
    },
  },
  {
    name: 'wallet',
    version: '0.1.0',
    description: 'Set up Tempo Wallet and make explicitly approved paid API requests.',
    displayName: 'Tempo Wallet',
    homepage: 'https://tempo.xyz/developers/docs/wallet/use-with-agents',
    keywords: ['tempo', 'wallet', 'mpp', 'payments'],
    category: 'Finance',
    claudeCategory: 'finance',
    icon: 'tempo-mark.svg',
    interface: {
      shortDescription: 'Use Tempo Wallet with explicit approvals.',
      longDescription: 'Set up Tempo Wallet, discover paid services, preview costs, and make explicitly approved requests with scoped spending limits.',
      capabilities: ['Interactive', 'Write'],
      websiteURL: 'https://wallet.tempo.xyz',
      privacyPolicyURL: 'https://wallet.tempo.xyz/support/privacy-policy',
      termsOfServiceURL: 'https://wallet.tempo.xyz/support/terms-of-service',
      defaultPrompt: [
        'Check whether Tempo Wallet is ready.',
        'Find paid services for this task without running them.',
        'Preview the cost of this paid API request.',
      ],
      brandColor: '#000000',
    },
  },
  {
    name: 'mercator',
    version: '0.3.1',
    codexVersionSuffix: 'codex.20260902183800',
    description: 'Discover, quote, and run paid API workflows through one secure MCP connection. Connect a Tempo Wallet once; no local CLI or wallet setup.',
    displayName: 'Mercator',
    homepage: 'https://mercator.tempo.xyz/',
    keywords: ['api', 'current-data', 'mercator', 'mcp', 'paid-services', 'payments', 'tempo'],
    category: 'Productivity',
    claudeCategory: 'research',
    icon: 'favicon.svg',
    interface: {
      shortDescription: 'Discover, quote, and run paid API workflows',
      longDescription: 'Connect agents to current data and paid APIs through one remote MCP server. Authorize a limited Tempo Wallet key once; no CLI or wallet key is installed in the agent VM.',
      capabilities: ['Interactive', 'Read', 'Write'],
      websiteURL: 'https://mercator.tempo.xyz/',
      defaultPrompt: [
        'Rescue my canceled Boston-to-London flight under $1,200; add a hotel and transfer if needed, then email the itinerary.',
        'Find 15 overlooked Boston HVAC businesses, verify owner emails, flag outdated sites, and map a route from Back Bay.',
        'Investigate unusual AAVE activity across smart-money flows, holders, price, news, and regulation; return a sourced chart.',
      ],
      brandColor: '#0B0B0B',
    },
    mcp: {
      serverName: 'mercator',
      url: 'https://mercator.tempo.xyz/mcp/auth',
      note: 'Mercator remote MCP for service discovery, live quotes, secure Tempo payments, and durable paid jobs.',
      registryDescription: 'Discover, quote, and run fresh external research and API workflows.',
    },
  },
]
