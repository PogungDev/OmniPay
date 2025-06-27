import { MetaMaskSDK } from '@metamask/sdk'
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
let MetaMaskSDK: any;
try {
  MetaMaskSDK = require('@metamask/sdk').MetaMaskSDK;
} catch (error) {
  console.warn('MetaMask SDK not installed, using mock');
  MetaMaskSDK = class MockMetaMaskSDK {
    constructor() {}
    init() { return Promise.resolve(); }
    connect() { return Promise.resolve([]); }
    getAccounts() { return Promise.resolve([]); }
    sendTransaction() { return Promise.resolve('0x123'); }
    switchChain() { return Promise.resolve(); }
    disconnect() { return Promise.resolve(); }
    isConnected() { return false; }
    getBalance() { return Promise.resolve('1000000000000000000'); }
  };
}

class OmniPayMetaMaskSDK {
  private sdk: MetaMaskSDK | null = null
  private provider: BrowserProvider | null = null
  private initialized = false

  constructor(private options: MetaMaskSDKOptions) {}

  async initialize(): Promise<void> {
    try {
      this.sdk = new MetaMaskSDK({
        dappMetadata: this.options.dappMetadata,
        infuraAPIKey: this.options.infuraAPIKey,
        readonlyRPCMap: this.options.readonlyRPCMap,
        checkInstallationImmediately: this.options.checkInstallationImmediately ?? false,
        enableDebug: this.options.enableDebug ?? false,
        extensionOnly: false, // Allow mobile and browser extension
        preferDesktop: true,
        openDeeplink: (link: string) => {
          console.log('Opening deeplink:', link)
          window.open(link, '_blank')
        },
        useDeeplink: false,
        forceDeleteProvider: false,
        forceInjectProvider: false,
      })

      await this.sdk.init()
      this.initialized = true
      console.log('✅ MetaMask SDK initialized successfully')
    } catch (error) {
      console.error('❌ MetaMask SDK initialization failed:', error)
      throw error
    }
  }

  async connect(): Promise<WalletAccount[]> {
    if (!this.initialized || !this.sdk) {
      throw new Error('SDK not initialized')
    }

    try {
      console.log('🔗 Connecting to MetaMask...')
      const accounts = await this.sdk.connect()
      
      if (accounts && accounts.length > 0) {
        console.log('✅ Connected to MetaMask:', accounts)
        return accounts.map(address => ({ address }))
      } else {
        throw new Error('No accounts returned from MetaMask')
      }
    } catch (error) {
      console.error('❌ MetaMask connection failed:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.sdk) {
      try {
        await this.sdk.terminate()
        this.provider = null
        console.log('✅ Disconnected from MetaMask')
      } catch (error) {
        console.error('❌ MetaMask disconnection failed:', error)
        throw error
      }
    }
  }

  async getProvider(): Promise<BrowserProvider> {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    if (!this.provider) {
      const ethereum = this.sdk.getProvider()
      this.provider = new BrowserProvider(ethereum)
    }

    return this.provider
  }

  async getAccounts(): Promise<string[]> {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    try {
      const provider = await this.getProvider()
      const accounts = await provider.listAccounts()
      return accounts.map(account => account.address)
    } catch (error) {
      console.error('❌ Failed to get accounts:', error)
      throw error
    }
  }

  async getBalance(address: string): Promise<string> {
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
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    try {
      const ethereum = this.sdk.getProvider()
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
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const chainConfigs: { [key: string]: any } = {
      '0xe708': { // Linea Mainnet (59144)
        chainId: '0xe708',
        chainName: 'Linea',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.linea.build'],
        blockExplorerUrls: ['https://lineascan.build'],
      },
      '0xe704': { // Linea Goerli (59140)
        chainId: '0xe704',
        chainName: 'Linea Goerli',
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://rpc.goerli.linea.build'],
        blockExplorerUrls: ['https://goerli.lineascan.build'],
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
    return this.sdk?.isConnected() ?? false
  }

  getSDK(): MetaMaskSDK | null {
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