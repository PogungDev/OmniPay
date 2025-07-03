export interface ChainConfig {
  id: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  logoUrl: string
  nativeToken: {
    symbol: string
    name: string
    decimals: number
  }
  supportedTokens: TokenConfig[]
}

export interface TokenConfig {
  symbol: string
  name: string
  address: string
  decimals: number
  logoUrl: string
  coingeckoId?: string
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    logoUrl: "/chains/ethereum.svg",
    nativeToken: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xA0b86a33E6441b8C4505B4afDcA7FBf0251f7046",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        decimals: 6,
        logoUrl: "/tokens/usdt.svg",
        coingeckoId: "tether",
      },
    ],
  },
  137: {
    id: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: "https://polygon.llamarpc.com",
    explorerUrl: "https://polygonscan.com",
    logoUrl: "/chains/polygon.svg",
    nativeToken: {
      symbol: "MATIC",
      name: "Polygon",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        decimals: 6,
        logoUrl: "/tokens/usdt.svg",
        coingeckoId: "tether",
      },
    ],
  },
  42161: {
    id: 42161,
    name: "Arbitrum",
    symbol: "ARB",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    logoUrl: "/chains/arbitrum.svg",
    nativeToken: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
      {
        symbol: "ARB",
        name: "Arbitrum",
        address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        decimals: 18,
        logoUrl: "/tokens/arb.svg",
        coingeckoId: "arbitrum",
      },
    ],
  },
  10: {
    id: 10,
    name: "Optimism",
    symbol: "OP",
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    logoUrl: "/chains/optimism.svg",
    nativeToken: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
      {
        symbol: "OP",
        name: "Optimism",
        address: "0x4200000000000000000000000000000000000042",
        decimals: 18,
        logoUrl: "/tokens/op.svg",
        coingeckoId: "optimism",
      },
    ],
  },
  8453: {
    id: 8453,
    name: "Base",
    symbol: "BASE",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    logoUrl: "/chains/base.svg",
    nativeToken: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
    ],
  },
  56: {
    id: 56,
    name: "BNB Chain",
    symbol: "BNB",
    rpcUrl: "https://bsc-dataseed1.binance.org",
    explorerUrl: "https://bscscan.com",
    logoUrl: "/chains/bnb.svg",
    nativeToken: {
      symbol: "BNB",
      name: "BNB",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        decimals: 18,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0x55d398326f99059fF775485246999027B3197955",
        decimals: 18,
        logoUrl: "/tokens/usdt.svg",
        coingeckoId: "tether",
      },
    ],
  },
  43114: {
    id: 43114,
    name: "Avalanche",
    symbol: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerUrl: "https://snowtrace.io",
    logoUrl: "/chains/avalanche.svg",
    nativeToken: {
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xB97EF9Ef8734C71904D8002F8b6e502ce6d221758",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        decimals: 6,
        logoUrl: "/tokens/usdt.svg",
        coingeckoId: "tether",
      },
    ],
  },
  11155111: {
    id: 11155111,
    name: "Sepolia",
    symbol: "ETH",
    rpcUrl: "https://rpc.sepolia.org",
    explorerUrl: "https://sepolia.etherscan.io",
    logoUrl: "/chains/ethereum.svg",
    nativeToken: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
    ],
  },
  421614: {
    id: 421614,
    name: "Arbitrum Sepolia",
    symbol: "ETH",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: "https://sepolia.arbiscan.io",
    logoUrl: "/chains/arbitrum.svg",
    nativeToken: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
    },
    supportedTokens: [
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
        decimals: 6,
        logoUrl: "/tokens/usdc.svg",
        coingeckoId: "usd-coin",
      },
    ],
  },
}

// Helper functions
export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId]
}

export function getTokenByAddress(chainId: number, address: string): TokenConfig | undefined {
  const chain = SUPPORTED_CHAINS[chainId]
  if (!chain) return undefined
  return chain.supportedTokens.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

export function getTokenBySymbol(chainId: number, symbol: string): TokenConfig | undefined {
  const chain = SUPPORTED_CHAINS[chainId]
  if (!chain) return undefined
  return chain.supportedTokens.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase())
}

export function getAllSupportedTokens(): TokenConfig[] {
  const allTokens: TokenConfig[] = []
  Object.values(SUPPORTED_CHAINS).forEach((chain) => {
    allTokens.push(...chain.supportedTokens)
  })
  return allTokens
}

export function isChainSupported(chainId: number): boolean {
  return chainId in SUPPORTED_CHAINS
}

export function getSupportedChainIds(): number[] {
  return Object.keys(SUPPORTED_CHAINS).map(Number)
}

export function getChainLogoUrl(chainId: number): string {
  const chain = SUPPORTED_CHAINS[chainId]
  return chain?.logoUrl || "/chains/default.svg"
}

export function getTokenLogoUrl(chainId: number, tokenAddress: string): string {
  const token = getTokenByAddress(chainId, tokenAddress)
  return token?.logoUrl || "/tokens/default.svg"
}

// Network configuration for MetaMask
// Token address mappings for easy access
export const TOKEN_ADDRESSES = {
  1: { // Ethereum
    USDC: "0xA0b86a33E6441b8C4505B4afDcA7FBf0251f7046",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    ETH: "0x0000000000000000000000000000000000000000", // Native ETH
  },
  137: { // Polygon
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    MATIC: "0x0000000000000000000000000000000000000000", // Native MATIC
  },
  42161: { // Arbitrum
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    ETH: "0x0000000000000000000000000000000000000000", // Native ETH
  },
  10: { // Optimism
    USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    OP: "0x4200000000000000000000000000000000000042",
    ETH: "0x0000000000000000000000000000000000000000", // Native ETH
  },
  8453: { // Base
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    ETH: "0x0000000000000000000000000000000000000000", // Native ETH
  },
  56: { // BNB Chain
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    BNB: "0x0000000000000000000000000000000000000000", // Native BNB
  }
}

// USDC addresses across all chains (most important for cross-chain)
export const USDC_ADDRESSES = {
  1: "0xA0b86a33E6441b8C4505B4afDcA7FBf0251f7046",   // Ethereum
  137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",  // Optimism
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  56: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",  // BNB Chain
}

export function getNetworkConfig(chainId: number) {
  const chain = SUPPORTED_CHAINS[chainId]
  if (!chain) return null

  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeToken,
    rpcUrls: [chain.rpcUrl],
    blockExplorerUrls: [chain.explorerUrl],
  }
}

// Default chains for different environments
export const DEFAULT_CHAINS = {
  MAINNET: [1, 137, 42161, 10, 8453],
  TESTNET: [11155111],
  ALL: [1, 137, 42161, 10, 8453, 56, 43114, 11155111],
}

// Chain categories
export const CHAIN_CATEGORIES = {
  ETHEREUM_L1: [1, 11155111],
  ETHEREUM_L2: [137, 42161, 10, 8453],
  OTHER_L1: [56, 43114],
}

// Popular token addresses across chains
export const POPULAR_TOKENS = {
  USDC: {
    1: "0xA0b86a33E6441b8C4505B4afDcA7FBf0251f7046",
    137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  },
  USDT: {
    1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    56: "0x55d398326f99059fF775485246999027B3197955",
    43114: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
  },
}
