import { LiFi, type RouteRequest, type Route, type Step, type QuoteRequest } from '@lifi/sdk'
import { ChainId, ChainKey } from '@lifi/types'

export interface LiFiConfig {
  integrator: string
  apiUrl?: string
  widgetConfig?: any
}

export interface CrossChainQuote {
  id: string
  fromChain: ChainId
  toChain: ChainId
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  gasEstimate: string
  duration: number
  steps: Step[]
  route: Route
}

export interface TransferStatus {
  id: string
  status: 'PENDING' | 'DONE' | 'FAILED' | 'PARTIAL'
  fromChain: ChainId
  toChain: ChainId
  fromAmount: string
  toAmount: string
  gasUsed?: string
  txHash?: string
  bridgeTxHash?: string
  steps: Step[]
}

class OmniPayLiFiSDK {
  private lifi: LiFi
  private initialized = false

  constructor(private config: LiFiConfig) {
    this.lifi = new LiFi({
      integrator: config.integrator,
      apiUrl: config.apiUrl,
    })
  }

  async initialize(): Promise<void> {
    try {
      await this.lifi.getChains()
      this.initialized = true
      console.log('✅ LI.FI SDK initialized successfully')
    } catch (error) {
      console.error('❌ LI.FI SDK initialization failed:', error)
      throw error
    }
  }

  async getQuote(params: {
    fromChain: ChainId | ChainKey
    toChain: ChainId | ChainKey
    fromToken: string
    toToken: string
    fromAmount: string
    fromAddress: string
    toAddress?: string
    slippage?: number
    allowSwitchChain?: boolean
  }): Promise<CrossChainQuote> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      console.log('🔍 Getting LI.FI quote...')
      
      const quoteRequest: RouteRequest = {
        fromChainId: typeof params.fromChain === 'string' 
          ? this.getChainIdFromKey(params.fromChain) 
          : params.fromChain,
        toChainId: typeof params.toChain === 'string' 
          ? this.getChainIdFromKey(params.toChain) 
          : params.toChain,
        fromTokenAddress: params.fromToken,
        toTokenAddress: params.toToken,
        fromAmount: params.fromAmount,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress || params.fromAddress,
        options: {
          slippage: params.slippage || 0.03, // 3% default
          allowSwitchChain: params.allowSwitchChain ?? true,
        }
      }

      const routes = await this.lifi.getRoutes(quoteRequest)
      
      if (!routes.routes || routes.routes.length === 0) {
        throw new Error('No routes found for this transfer')
      }

      const bestRoute = routes.routes[0] // LI.FI returns sorted by best
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

  async executeRoute(route: Route, updateCallback?: (status: TransferStatus) => void): Promise<string> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      console.log('🚀 Executing LI.FI route...')
      
      const execution = await this.lifi.executeRoute({
        route,
        updateCallback: (update) => {
          if (updateCallback) {
            const status: TransferStatus = {
              id: route.id,
              status: this.mapExecutionStatus(update.status),
              fromChain: route.fromChainId,
              toChain: route.toChainId,
              fromAmount: route.fromAmount,
              toAmount: route.toAmount,
              gasUsed: update.gasUsed,
              txHash: update.txHash,
              bridgeTxHash: update.bridgeTxHash,
              steps: route.steps
            }
            updateCallback(status)
          }
        }
      })

      console.log('✅ LI.FI route executed:', execution)
      return execution.txHash || ''
    } catch (error) {
      console.error('❌ LI.FI route execution failed:', error)
      throw error
    }
  }

  async getTransferStatus(params: {
    fromChain: ChainId
    toChain: ChainId
    txHash: string
    bridge?: string
  }): Promise<TransferStatus> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      const status = await this.lifi.getStatus({
        fromChain: params.fromChain,
        toChain: params.toChain,
        txHash: params.txHash,
        bridge: params.bridge
      })

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
      const chains = await this.lifi.getChains()
      console.log('✅ Retrieved supported chains:', chains.length)
      return chains
    } catch (error) {
      console.error('❌ Failed to get supported chains:', error)
      throw error
    }
  }

  async getSupportedTokens(chainId: ChainId): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('LI.FI SDK not initialized')
    }

    try {
      const tokens = await this.lifi.getTokens({ chains: [chainId] })
      console.log(`✅ Retrieved tokens for chain ${chainId}:`, tokens.tokens[chainId]?.length || 0)
      return tokens.tokens[chainId] || []
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
      const tools = await this.lifi.getTools()
      console.log('✅ Retrieved LI.FI tools:', tools.length)
      return tools
    } catch (error) {
      console.error('❌ Failed to get tools:', error)
      throw error
    }
  }

  private getChainIdFromKey(chainKey: ChainKey): ChainId {
    const chainMap: Record<ChainKey, ChainId> = {
      'eth': ChainId.ETH,
      'pol': ChainId.POL,
      'arb': ChainId.ARB,
      'opt': ChainId.OPT,
      'bas': ChainId.BAS,
      'lin': ChainId.LIN,
      'ava': ChainId.AVA,
      'bsc': ChainId.BSC,
      'dai': ChainId.DAI,
      'fan': ChainId.FAN,
      'ftm': ChainId.FTM,
    }

    return chainMap[chainKey] || ChainId.ETH
  }

  private mapExecutionStatus(status: string): 'PENDING' | 'DONE' | 'FAILED' | 'PARTIAL' {
    switch (status.toLowerCase()) {
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

  private calculateDuration(steps: Step[]): number {
    // Estimate duration based on steps and bridges
    let totalDuration = 0
    
    for (const step of steps) {
      if (step.type === 'cross') {
        // Cross-chain steps take longer
        totalDuration += 300 // 5 minutes base
        
        // Add extra time for specific bridges
        if (step.tool === 'cbridge') totalDuration += 600 // +10 min
        if (step.tool === 'hop') totalDuration += 180 // +3 min
        if (step.tool === 'across') totalDuration += 120 // +2 min
      } else {
        // Same-chain swaps are faster
        totalDuration += 60 // 1 minute
      }
    }
    
    return Math.max(totalDuration, 60) // Minimum 1 minute
  }

  getSDK(): LiFi {
    return this.lifi
  }
}

// Create singleton instance
export const lifiSDK = new OmniPayLiFiSDK({
  integrator: 'omnipay',
  apiUrl: 'https://li.quest/v1/',
})

export default OmniPayLiFiSDK 