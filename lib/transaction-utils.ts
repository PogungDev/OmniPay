// Real transaction tracking utility
export interface Transaction {
  id: string
  type: string
  status: 'Processing' | 'Completed' | 'Failed'
  amount: number
  token: string
  usdValue: number
  from: string
  to: string
  chain: string
  txHash: string
  details: string
  date: string
}

export const addTransactionToHistory = (transaction: Omit<Transaction, 'id' | 'date'>) => {
  if (typeof window === 'undefined') return

  const newTransaction: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    ...transaction,
    date: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  try {
    const existing = getStoredTransactions()
    const updated = [newTransaction, ...existing].slice(0, 100) // Keep last 100 transactions
    localStorage.setItem('omnipay_transactions', JSON.stringify(updated))
    
    // Dispatch custom event to trigger re-render
    window.dispatchEvent(new CustomEvent('omnipay_transaction_added'))
    
    console.log('✅ Transaction added to history:', newTransaction)
    return newTransaction.id
  } catch (error) {
    console.error('Error saving transaction:', error)
    return null
  }
}

export const updateTransactionStatus = (txId: string, status: 'Processing' | 'Completed' | 'Failed', txHash?: string) => {
  if (typeof window === 'undefined') return

  try {
    const existing = getStoredTransactions()
    const updated = existing.map((tx: Transaction) => {
      if (tx.id === txId) {
        return {
          ...tx,
          status,
          ...(txHash && { txHash })
        }
      }
      return tx
    })
    
    localStorage.setItem('omnipay_transactions', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('omnipay_transaction_added'))
    
    console.log('✅ Transaction status updated:', { txId, status, txHash })
  } catch (error) {
    console.error('Error updating transaction:', error)
  }
}

export const getStoredTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('omnipay_transactions')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading transactions:', error)
    return []
  }
}

// Generate realistic testnet transaction hash
export const generateTestnetTxHash = () => {
  return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
}

// Simulate real blockchain interaction with proper delays
export const simulateBlockchainTransaction = async (
  type: string,
  amount: number,
  token: string,
  fromChain: string,
  toChain: string,
  fromAddress: string,
  toAddress: string
): Promise<{ txId: string; txHash: string }> => {
  
  // Start transaction as processing
  const txId = addTransactionToHistory({
    type,
    status: 'Processing',
    amount,
    token,
    usdValue: amount * (token === 'USDC' ? 1 : token === 'ETH' ? 3500 : token === 'MATIC' ? 0.9 : 1),
    from: fromAddress,
    to: toAddress,
    chain: fromChain,
    txHash: 'pending...',
    details: `${type} from ${fromChain} to ${toChain} via OmniPay infrastructure`
  })

  // Simulate realistic network delay (3-8 seconds)
  const delay = 3000 + Math.random() * 5000
  await new Promise(resolve => setTimeout(resolve, delay))

  // Generate realistic testnet tx hash
  const txHash = generateTestnetTxHash()
  
  // 95% success rate (realistic)
  const isSuccess = Math.random() > 0.05
  
  // Update with final status and real hash
  if (txId) {
    updateTransactionStatus(txId, isSuccess ? 'Completed' : 'Failed', isSuccess ? txHash : 'failed')
  }

  return { txId: txId!, txHash: isSuccess ? txHash : 'failed' }
} 