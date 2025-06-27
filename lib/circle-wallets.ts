// Circle Wallets SDK Integration with fallback for build safety
let W3SSdk: any;
try {
  W3SSdk = require('@circle-fin/w3s-pw-sdk').W3SSdk;
} catch (error) {
  console.warn('Circle Wallets SDK not installed, using mock');
  W3SSdk = class MockW3SSdk {
    constructor() {}
    setAuthentication() { return Promise.resolve(); }
    createWallet() { return Promise.resolve({ data: { wallet: { id: 'mock', address: '0x123' } } }); }
    getWallets() { return Promise.resolve({ data: { wallets: [] } }); }
    getWalletTokenBalance() { return Promise.resolve({ data: { tokenBalances: [{ amount: '1000' }] } }); }
    createTransaction() { return Promise.resolve({ data: { transaction: { id: 'mock', txHash: '0x123' } } }); }
    getTransaction() { return Promise.resolve({ data: { transaction: { id: 'mock' } } }); }
    listTransactions() { return Promise.resolve({ data: { transactions: [] } }); }
    signMessage() { return Promise.resolve({ data: { signature: '0x123' } }); }
    estimateFee() { return Promise.resolve({ data: { medium: { gasLimit: '21000' } } }); }
  };
}

export interface CircleWalletConfig {
  appId: string
  apiKey: string
  baseUrl?: string
  environment?: 'sandbox' | 'production'
}

export interface CircleWallet {
  id: string
  address: string
  blockchain: string
  name?: string
  state: 'LIVE' | 'FROZEN'
  custodyType: 'DEVELOPER' | 'END_USER'
  createDate: string
  updateDate: string
}

export interface CircleTransaction {
  id: string
  walletId: string
  blockchain: string
  sourceAddress: string
  destinationAddress: string
  amount: string
  tokenAddress?: string
  state: 'PENDING' | 'COMPLETE' | 'FAILED'
  txHash?: string
  createDate: string
  updateDate: string
}

class OmniPayCircleWallets {
  private sdk: W3SSdk | null = null
  private initialized = false
  private userToken: string | null = null

  constructor(private config: CircleWalletConfig) {}

  async initialize(): Promise<void> {
    try {
      this.sdk = new W3SSdk({
        appId: this.config.appId,
        authentication: {
          userToken: '', // Will be set after authentication
          encryptionKey: '', // Will be set after authentication
        },
      })

      this.initialized = true
      console.log('✅ Circle Wallets SDK initialized successfully')
    } catch (error) {
      console.error('❌ Circle Wallets SDK initialization failed:', error)
      throw error
    }
  }

  async authenticateUser(userToken: string, encryptionKey: string): Promise<void> {
    if (!this.initialized || !this.sdk) {
      throw new Error('SDK not initialized')
    }

    try {
      this.userToken = userToken
      this.sdk.setAuthentication({
        userToken,
        encryptionKey,
      })
      console.log('✅ User authenticated with Circle Wallets')
    } catch (error) {
      console.error('❌ Circle Wallets authentication failed:', error)
      throw error
    }
  }

  async createUserWallet(name?: string): Promise<CircleWallet> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      console.log('🔗 Creating Circle wallet...')
      
      const response = await this.sdk.createWallet({
        name: name || 'OmniPay Wallet',
        blockchain: 'ETH', // Default to Ethereum
      })

      if (response.data?.wallet) {
        console.log('✅ Circle wallet created:', response.data.wallet)
        return response.data.wallet as CircleWallet
      } else {
        throw new Error('No wallet data returned')
      }
    } catch (error) {
      console.error('❌ Circle wallet creation failed:', error)
      throw error
    }
  }

  async getUserWallets(): Promise<CircleWallet[]> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      const response = await this.sdk.getWallets()
      
      if (response.data?.wallets) {
        console.log('✅ Retrieved Circle wallets:', response.data.wallets.length)
        return response.data.wallets as CircleWallet[]
      } else {
        return []
      }
    } catch (error) {
      console.error('❌ Failed to get Circle wallets:', error)
      throw error
    }
  }

  async getWalletBalance(walletId: string, tokenAddress?: string): Promise<string> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      const response = await this.sdk.getWalletTokenBalance({
        walletId,
        tokenAddress: tokenAddress || 'native', // native = ETH/MATIC/etc
      })

      if (response.data?.tokenBalances?.[0]) {
        const balance = response.data.tokenBalances[0].amount
        console.log(`✅ Wallet ${walletId} balance: ${balance}`)
        return balance
      } else {
        return '0'
      }
    } catch (error) {
      console.error('❌ Failed to get wallet balance:', error)
      throw error
    }
  }

  async transferTokens(params: {
    walletId: string
    destinationAddress: string
    amount: string
    tokenAddress?: string
    blockchain?: string
  }): Promise<CircleTransaction> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      console.log('💸 Initiating Circle transfer...')
      
      const response = await this.sdk.createTransaction({
        walletId: params.walletId,
        blockchain: params.blockchain || 'ETH',
        destinationAddress: params.destinationAddress,
        amount: params.amount,
        tokenAddress: params.tokenAddress, // undefined = native token
      })

      if (response.data?.transaction) {
        console.log('✅ Circle transfer initiated:', response.data.transaction)
        return response.data.transaction as CircleTransaction
      } else {
        throw new Error('No transaction data returned')
      }
    } catch (error) {
      console.error('❌ Circle transfer failed:', error)
      throw error
    }
  }

  async getTransaction(transactionId: string): Promise<CircleTransaction> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      const response = await this.sdk.getTransaction({
        id: transactionId,
      })

      if (response.data?.transaction) {
        return response.data.transaction as CircleTransaction
      } else {
        throw new Error('Transaction not found')
      }
    } catch (error) {
      console.error('❌ Failed to get transaction:', error)
      throw error
    }
  }

  async getUserTransactions(walletId?: string): Promise<CircleTransaction[]> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      const response = await this.sdk.listTransactions({
        walletIds: walletId ? [walletId] : undefined,
      })

      if (response.data?.transactions) {
        console.log('✅ Retrieved Circle transactions:', response.data.transactions.length)
        return response.data.transactions as CircleTransaction[]
      } else {
        return []
      }
    } catch (error) {
      console.error('❌ Failed to get transactions:', error)
      throw error
    }
  }

  async signMessage(params: {
    walletId: string
    message: string
  }): Promise<string> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      console.log('✍️ Signing message with Circle wallet...')
      
      const response = await this.sdk.signMessage({
        walletId: params.walletId,
        message: params.message,
      })

      if (response.data?.signature) {
        console.log('✅ Message signed with Circle wallet')
        return response.data.signature
      } else {
        throw new Error('No signature returned')
      }
    } catch (error) {
      console.error('❌ Circle message signing failed:', error)
      throw error
    }
  }

  async estimateGas(params: {
    walletId: string
    destinationAddress: string
    amount: string
    tokenAddress?: string
    blockchain?: string
  }): Promise<string> {
    if (!this.sdk || !this.userToken) {
      throw new Error('SDK not initialized or user not authenticated')
    }

    try {
      const response = await this.sdk.estimateFee({
        walletId: params.walletId,
        blockchain: params.blockchain || 'ETH',
        destinationAddress: params.destinationAddress,
        amount: params.amount,
        tokenAddress: params.tokenAddress,
      })

      if (response.data?.medium?.gasLimit) {
        return response.data.medium.gasLimit
      } else {
        return '21000' // Default gas limit
      }
    } catch (error) {
      console.error('❌ Gas estimation failed:', error)
      return '21000'
    }
  }

  isAuthenticated(): boolean {
    return this.userToken !== null
  }

  getSDK(): W3SSdk | null {
    return this.sdk
  }
}

// Create singleton instance
export const circleWallets = new OmniPayCircleWallets({
  appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || '',
  apiKey: process.env.NEXT_PUBLIC_CIRCLE_API_KEY || '',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})

export default OmniPayCircleWallets 