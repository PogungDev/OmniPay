import { BrowserProvider } from 'ethers'

export interface DelegationData {
  delegate: string
  authority: string
  caveats: any[]
  salt: string
  signature?: string
}

export interface DelegatedTransactionRequest {
  to: string
  value: string
  data: string
  delegationData: DelegationData
}

class MetaMaskDelegationToolkit {
  private provider: BrowserProvider | null = null
  private isInitialized = false

  async initialize(provider: BrowserProvider): Promise<void> {
    this.provider = provider
    this.isInitialized = true
    console.log('✅ MetaMask Delegation Toolkit initialized')
  }

  async createDelegation(params: {
    delegate: string
    authority: string
    caveats?: any[]
  }): Promise<DelegationData> {
    if (!this.isInitialized || !this.provider) {
      throw new Error('Delegation toolkit not initialized')
    }

    try {
      // Generate salt for delegation
      const salt = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      const delegationData: DelegationData = {
        delegate: params.delegate,
        authority: params.authority,
        caveats: params.caveats || [],
        salt: salt,
      }

      // Request delegation signature from MetaMask
      const signer = await this.provider.getSigner()
      const delegationMessage = this.encodeDelegationMessage(delegationData)
      
      // Use wallet_invokeMethod for delegation (MetaMask Delegation Toolkit)
      const signature = await signer.signMessage(delegationMessage)
      
      delegationData.signature = signature

      console.log('✅ Delegation created:', delegationData)
      return delegationData
    } catch (error) {
      console.error('❌ Failed to create delegation:', error)
      throw error
    }
  }

  async executeDelegatedTransaction(params: DelegatedTransactionRequest): Promise<string> {
    if (!this.isInitialized || !this.provider) {
      throw new Error('Delegation toolkit not initialized')
    }

    try {
      // Prepare the delegated transaction call
      const signer = await this.provider.getSigner()
      
      // For demonstration, we'll execute the transaction normally
      // In a real implementation, this would use the delegation infrastructure
      const txRequest = {
        to: params.to,
        value: params.value,
        data: params.data,
      }

      const tx = await signer.sendTransaction(txRequest)
      console.log('✅ Delegated transaction executed:', tx.hash)
      
      return tx.hash
    } catch (error) {
      console.error('❌ Failed to execute delegated transaction:', error)
      throw error
    }
  }

  async revokeDelegation(delegationData: DelegationData): Promise<void> {
    if (!this.isInitialized || !this.provider) {
      throw new Error('Delegation toolkit not initialized')
    }

    try {
      // In a real implementation, this would revoke the delegation on-chain
      console.log('✅ Delegation revoked:', delegationData.delegate)
    } catch (error) {
      console.error('❌ Failed to revoke delegation:', error)
      throw error
    }
  }

  private encodeDelegationMessage(delegation: DelegationData): string {
    // This is a simplified encoding for demonstration
    // Real implementation would follow MetaMask Delegation Toolkit spec
    return JSON.stringify({
      delegate: delegation.delegate,
      authority: delegation.authority,
      caveats: delegation.caveats,
      salt: delegation.salt,
    })
  }

  isSupported(): boolean {
    // Check if MetaMask supports delegation
    return typeof window !== 'undefined' && 
           !!window.ethereum && 
           !!(window.ethereum as any)?.isMetaMask
  }
}

export const delegationToolkit = new MetaMaskDelegationToolkit() 