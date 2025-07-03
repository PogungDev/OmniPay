// Real LI.FI SDK Integration with correct types
import { type RoutesRequest, type RoutesResponse, type Route, type LiFiStep } from '@lifi/sdk'

export interface LiFiConfig {
  integrator: string
  apiUrl?: string
}

export interface CrossChainQuote {
  id: string
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  gasEstimate: string
  duration: number
  steps: LiFiStep[]
  route: Route
}

export interface TransferStatus {
  id: string
  status: 'PENDING' | 'DONE' | 'FAILED' | 'PARTIAL'
  fromChain: number
  toChain: number
  fromAmount: string
  toAmount: string
  gasUsed?: string
  txHash?: string
  bridgeTxHash?: string
  steps: LiFiStep[]
}

class OmniPayLiFiSDK {
  private config: LiFiConfig
  private initialized = false
  private apiUrl: string

  constructor(config: LiFiConfig) {
    this.config = config
    this.apiUrl = config.apiUrl || 'https://li.quest/v1'
  }

  async initialize(): Promise<void> {
    try {
      // Test API connection
      const response = await fetch(`${this.apiUrl}/chains`)
      if (!response.ok) {
        throw new Error('API connection failed')
      }
      
      this.initialized = true
      console.log('✅ LI.FI SDK initialized successfully')
    } catch (error) {
      console.error('❌ LI.FI SDK initialization failed:', error)
      throw error
    }
  }

  async getQuote(params: {
    fromChain: number
    toChain: number
    fromToken: string
    toToken: string
    fromAmount: string
    fromAddress: string
    toAddress?: string
    slippage?: number
  }): Promise<CrossChainQuote> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      console.log('🔍 Getting LI.FI quote...')
      
      const routeRequest: RoutesRequest = {
        fromChainId: params.fromChain,
        toChainId: params.toChain,
        fromTokenAddress: params.fromToken,
        toTokenAddress: params.toToken,
        fromAmount: params.fromAmount,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress || params.fromAddress,
        options: {
          slippage: params.slippage || 0.03, // 3% default
          integrator: this.config.integrator,
        }
      }

      const response = await fetch(`${this.apiUrl}/advanced/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeRequest),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const routesResponse: RoutesResponse = await response.json()
      
      if (!routesResponse.routes || routesResponse.routes.length === 0) {
        throw new Error('No routes found for this transfer')
      }

      const bestRoute = routesResponse.routes[0] // LI.FI returns sorted by best
      const quote: CrossChainQuote = {
        id: bestRoute.id,
        fromChain: bestRoute.fromChainId,
        toChain: bestRoute.toChainId,
        fromToken: bestRoute.fromToken.address,
        toToken: bestRoute.toToken.address,
        fromAmount: bestRoute.fromAmount,
        toAmount: bestRoute.toAmount,
        gasEstimate: bestRoute.gasCostUSD || '0',
        duration: this.calculateDuration(bestRoute.steps),
        steps: bestRoute.steps,
        route: bestRoute
      }

      console.log('✅ LI.FI quote received:', quote)
      return quote
    } catch (error) {
      console.error('❌ LI.FI quote failed:', error)
      throw error
    }
  }

  async getTransferStatus(params: {
    fromChain: number
    toChain: number
    txHash: string
    bridge?: string
  }): Promise<TransferStatus> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      const response = await fetch(`${this.apiUrl}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromChain: params.fromChain,
          toChain: params.toChain,
          txHash: params.txHash,
          bridge: params.bridge,
        }),
      })

      if (!response.ok) {
        throw new Error(`Status API error: ${response.statusText}`)
      }

      const status = await response.json()

      return {
        id: params.txHash,
        status: this.mapExecutionStatus(status.status),
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAmount: status.sending?.amount || '0',
        toAmount: status.receiving?.amount || '0',
        gasUsed: status.gasUsed,
        txHash: status.sending?.txHash,
        bridgeTxHash: status.receiving?.txHash,
        steps: status.substatuses || []
      }
    } catch (error) {
      console.error('❌ Failed to get transfer status:', error)
      throw error
    }
  }

  async getSupportedChains(): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      const response = await fetch(`${this.apiUrl}/chains`)
      
      if (!response.ok) {
        throw new Error(`Chains API error: ${response.statusText}`)
      }
      
      const chains = await response.json()
      console.log('✅ Retrieved supported chains:', chains.length)
      return chains
    } catch (error) {
      console.error('❌ Failed to get supported chains:', error)
      throw error
    }
  }

  async getSupportedTokens(chainId: number): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      const response = await fetch(`${this.apiUrl}/tokens?chains=${chainId}`)
      
      if (!response.ok) {
        throw new Error(`Tokens API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      const tokens = data.tokens?.[chainId] || []
      console.log(`✅ Retrieved tokens for chain ${chainId}:`, tokens.length)
      return tokens
    } catch (error) {
      console.error('❌ Failed to get supported tokens:', error)
      throw error
    }
  }

  async getTools(): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      const response = await fetch(`${this.apiUrl}/tools`)
      
      if (!response.ok) {
        throw new Error(`Tools API error: ${response.statusText}`)
      }
      
      const tools = await response.json()
      console.log('✅ Retrieved LI.FI tools:', tools.length)
      return tools
    } catch (error) {
      console.error('❌ Failed to get tools:', error)
      throw error
    }
  }

  private mapExecutionStatus(status: string): 'PENDING' | 'DONE' | 'FAILED' | 'PARTIAL' {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'success':
      case 'completed':
        return 'DONE'
      case 'failed':
      case 'error':
        return 'FAILED'
      case 'partial':
        return 'PARTIAL'
      default:
        return 'PENDING'
    }
  }

  private calculateDuration(steps: LiFiStep[]): number {
    // Estimate duration based on steps and bridges
    let totalDuration = 0
    
    for (const step of steps) {
      if (step.type === 'lifi' || step.action?.fromChainId !== step.action?.toChainId) {
        // Cross-chain steps take longer
        totalDuration += 300 // 5 minutes base
        
        // Add extra time for specific bridges
        if (step.toolDetails?.name === 'cbridge') totalDuration += 600 // +10 min
        if (step.toolDetails?.name === 'hop') totalDuration += 180 // +3 min
        if (step.toolDetails?.name === 'across') totalDuration += 120 // +2 min
      } else {
        // Same-chain swaps are faster
        totalDuration += 60 // 1 minute
      }
    }
    
    return Math.max(totalDuration, 60) // Minimum 1 minute
  }

  async executeRoute(
    signer: any, 
    route: Route, 
    options?: {
      updateCallback?: (status: any) => void
      gasPrice?: string
      gasLimit?: string
    }
  ): Promise<{ txHash: string; status: string }> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      console.log('🚀 Executing LI.FI route...')
      
      // Execute first step of the route
      const firstStep = route.steps[0]
      if (!firstStep) {
        throw new Error('No steps found in route')
      }

      const transactionRequest = firstStep.transactionRequest
      if (!transactionRequest) {
        throw new Error('No transaction request found in step')
      }

      // Execute the transaction
      const txResponse = await signer.sendTransaction({
        to: transactionRequest.to,
        value: transactionRequest.value || '0',
        data: transactionRequest.data,
        gasLimit: options?.gasLimit || transactionRequest.gasLimit,
        gasPrice: options?.gasPrice || transactionRequest.gasPrice,
      })

      console.log('✅ Transaction sent:', txResponse.hash)

      // Monitor transaction status
      if (options?.updateCallback) {
        this.monitorTransactionStatus(
          route.fromChainId,
          route.toChainId,
          txResponse.hash,
          options.updateCallback
        )
      }

      return {
        txHash: txResponse.hash,
        status: 'PENDING'
      }
    } catch (error) {
      console.error('❌ Route execution failed:', error)
      throw error
    }
  }

  private async monitorTransactionStatus(
    fromChain: number,
    toChain: number,
    txHash: string,
    callback: (status: any) => void
  ): Promise<void> {
    let attempts = 0
    const maxAttempts = 60 // Monitor for 5 minutes (5 second intervals)

    const checkStatus = async () => {
      try {
        const status = await this.getTransferStatus({
          fromChain,
          toChain,
          txHash,
        })

        callback({
          status: status.status,
          txHash: status.txHash,
          bridgeTxHash: status.bridgeTxHash,
          errorMessage: status.status === 'FAILED' ? 'Transaction failed' : undefined
        })

        // Continue monitoring if still pending
        if (status.status === 'PENDING' && attempts < maxAttempts) {
          attempts++
          setTimeout(checkStatus, 5000) // Check every 5 seconds
        }
      } catch (error) {
        console.error('Status check failed:', error)
        if (attempts < maxAttempts) {
          attempts++
          setTimeout(checkStatus, 5000)
        }
      }
    }

    // Start monitoring after a short delay
    setTimeout(checkStatus, 2000)
  }

  getConfig(): LiFiConfig {
    return this.config
  }
}

// Create singleton instance
export const lifiSDK = new OmniPayLiFiSDK({
  integrator: 'omnipay',
  apiUrl: 'https://li.quest/v1',
})

export default OmniPayLiFiSDK 