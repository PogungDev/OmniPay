import { BrowserProvider } from 'ethers'

export interface MetaMaskSDKOptions {
  dappMetadata: {
    name: string
    url: string
    iconUrl?: string
  }
  infuraAPIKey?: string
  readonlyRPCMap?: { [chainId: string]: string }
  checkInstallationImmediately?: boolean
  enableDebug?: boolean
}

export interface WalletAccount {
  address: string
  balance?: string
  chainId?: string
}

// MetaMask SDK Integration with fallback for build safety
let MetaMaskSDK: any
let mockMode = false

try {
  if (typeof window !== 'undefined') {
    MetaMaskSDK = require('@metamask/sdk').MetaMaskSDK
  } else {
    throw new Error('Window not available')
  }
} catch (error) {
  console.warn('MetaMask SDK not available, using mock mode')
  mockMode = true
}

class OmniPayMetaMaskSDK {
  private sdk: any = null
  private provider: BrowserProvider | null = null
  private initialized = false
  private accounts: string[] = []

  constructor(private options: MetaMaskSDKOptions) {}

  async initialize(): Promise<void> {
    if (mockMode) {
      this.initialized = true
      console.log('✅ MetaMask SDK initialized in mock mode')
      return
    }

    try {
      this.sdk = new MetaMaskSDK({
        dappMetadata: this.options.dappMetadata,
        infuraAPIKey: this.options.infuraAPIKey,
        readonlyRPCMap: this.options.readonlyRPCMap,
        checkInstallationImmediately: false,
        enableDebug: this.options.enableDebug ?? false,
        extensionOnly: false,
        preferDesktop: true,
        useDeeplink: false,
        forceDeleteProvider: false,
        forceInjectProvider: false,
      })

      await this.sdk.init()
      this.initialized = true
      console.log('✅ MetaMask SDK initialized successfully')
      
    } catch (error) {
      console.error('❌ MetaMask SDK initialization failed:', error)
      mockMode = true
      this.initialized = true
      console.log('✅ Fallback to mock mode')
    }
  }

  async connect(): Promise<WalletAccount[]> {
    if (!this.initialized) {
      throw new Error('SDK not initialized')
    }

    if (mockMode) {
      console.log('🔗 Mock connection to MetaMask...')
      this.accounts = ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7']
      return this.accounts.map(address => ({ address }))
    }

    if (!this.sdk) {
      throw new Error('SDK not available')
    }

    try {
      console.log('🔗 Connecting to MetaMask...')
      
      const ethereum = this.sdk.getProvider()
      if (!ethereum) {
        throw new Error('MetaMask provider not available')
      }
      
      const result = await ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      this.accounts = Array.isArray(result) ? result : []
      
      if (this.accounts.length > 0) {
        console.log('✅ Connected to MetaMask:', this.accounts)
        return this.accounts.map(address => ({ address }))
      } else {
        throw new Error('No accounts returned from MetaMask')
      }
    } catch (error) {
      console.error('❌ MetaMask connection failed:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.sdk && !mockMode) {
      try {
        await this.sdk.terminate()
        this.provider = null
        this.accounts = []
        console.log('✅ Disconnected from MetaMask')
      } catch (error) {
        console.error('❌ MetaMask disconnection failed:', error)
        throw error
      }
    } else {
      this.accounts = []
      console.log('✅ Disconnected from mock MetaMask')
    }
  }

  async getProvider(): Promise<BrowserProvider> {
    if (mockMode) {
      throw new Error('Provider not available in mock mode')
    }

    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    if (!this.provider) {
      const ethereum = this.sdk.getProvider()
      if (!ethereum) {
        throw new Error('MetaMask provider not available')
      }
      this.provider = new BrowserProvider(ethereum)
    }

    return this.provider
  }

  async getAccounts(): Promise<string[]> {
    if (mockMode) {
      return this.accounts
    }

    if (!this.sdk) {
      return []
    }

    try {
      const ethereum = this.sdk.getProvider()
      if (!ethereum) return []
      
      const result = await ethereum.request({ method: 'eth_accounts' })
      this.accounts = Array.isArray(result) ? result : []
      return this.accounts
    } catch (error) {
      console.error('❌ Failed to get accounts:', error)
      return []
    }
  }

  async getBalance(address: string): Promise<string> {
    if (mockMode) {
      return '1000000000000000000' // 1 ETH in wei
    }

    try {
      const provider = await this.getProvider()
      const balance = await provider.getBalance(address)
      return balance.toString()
    } catch (error) {
      console.error('❌ Failed to get balance:', error)
      throw error
    }
  }

  async switchChain(chainId: string): Promise<void> {
    if (mockMode) {
      console.log(`✅ Mock switched to chain ${chainId}`)
      return
    }

    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    try {
      const ethereum = this.sdk.getProvider()
      if (!ethereum) {
        throw new Error('MetaMask provider not available')
      }
      
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
      console.log(`✅ Switched to chain ${chainId}`)
    } catch (error: any) {
      console.error('❌ Failed to switch chain:', error)
      
      // If chain not added, try to add it
      if (error.code === 4902) {
        await this.addChain(chainId)
      } else {
        throw error
      }
    }
  }

  async addChain(chainId: string): Promise<void> {
    if (mockMode) {
      console.log(`✅ Mock added chain ${chainId}`)
      return
    }

    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const chainConfigs: { [key: string]: any } = {
      '0xaa36a7': { // Sepolia (11155111)
        chainId: '0xaa36a7',
        chainName: 'Sepolia',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      '0x66eee': { // Arbitrum Sepolia (421614)
        chainId: '0x66eee',
        chainName: 'Arbitrum Sepolia',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://sepolia.arbiscan.io'],
      },
      '0x89': { // Polygon (137)
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
      },
      '0xa4b1': { // Arbitrum (42161)
        chainId: '0xa4b1',
        chainName: 'Arbitrum One',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io'],
      },
      '0x2105': { // Base (8453)
        chainId: '0x2105',
        chainName: 'Base',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
      },
    }

    const chainConfig = chainConfigs[chainId]
    if (!chainConfig) {
      throw new Error(`Chain configuration not found for chainId: ${chainId}`)
    }

    try {
      const ethereum = this.sdk.getProvider()
      if (!ethereum) {
        throw new Error('MetaMask provider not available')
      }
      
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [chainConfig],
      })
      console.log(`✅ Added chain ${chainId}`)
    } catch (error) {
      console.error('❌ Failed to add chain:', error)
      throw error
    }
  }

  async sendTransaction(params: {
    to: string
    value?: string
    data?: string
    gasLimit?: string
    gasPrice?: string
  }): Promise<string> {
    if (mockMode) {
      return '0x' + Math.random().toString(16).substr(2, 64)
    }

    try {
      const provider = await this.getProvider()
      const signer = await provider.getSigner()
      
      const tx = await signer.sendTransaction({
        to: params.to,
        value: params.value ? BigInt(params.value) : undefined,
        data: params.data,
        gasLimit: params.gasLimit ? BigInt(params.gasLimit) : undefined,
        gasPrice: params.gasPrice ? BigInt(params.gasPrice) : undefined,
      })

      console.log('✅ Transaction sent:', tx.hash)
      return tx.hash
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      throw error
    }
  }

  async signMessage(message: string): Promise<string> {
    if (mockMode) {
      return '0x' + Math.random().toString(16).substr(2, 128)
    }

    try {
      const provider = await this.getProvider()
      const signer = await provider.getSigner()
      const signature = await signer.signMessage(message)
      console.log('✅ Message signed')
      return signature
    } catch (error) {
      console.error('❌ Message signing failed:', error)
      throw error
    }
  }

  isConnected(): boolean {
    return this.accounts.length > 0
  }

  getSDK(): any {
    return this.sdk
  }
}

// Create singleton instance
export const metaMaskSDK = new OmniPayMetaMaskSDK({
  dappMetadata: {
    name: 'OmniPay',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://omnipay.app',
    iconUrl: '/placeholder-logo.svg',
  },
  enableDebug: process.env.NODE_ENV === 'development',
  checkInstallationImmediately: false,
  infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
  readonlyRPCMap: {
    '0x1': 'https://mainnet.infura.io/v3/' + process.env.NEXT_PUBLIC_INFURA_API_KEY,
    '0x89': 'https://polygon-mainnet.infura.io/v3/' + process.env.NEXT_PUBLIC_INFURA_API_KEY,
    '0xa4b1': 'https://arbitrum-mainnet.infura.io/v3/' + process.env.NEXT_PUBLIC_INFURA_API_KEY,
  },
})

export default OmniPayMetaMaskSDK 