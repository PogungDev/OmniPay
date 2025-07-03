"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"
import { metaMaskSDK } from "@/lib/metamask-sdk"
import { circleWallets } from "@/lib/circle-wallets"
import { ethers } from "ethers"

interface WalletState {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isDemo: boolean
  balance: string
  provider: 'metamask' | 'circle' | 'demo' | null
}

interface WalletContextType {
  walletState: WalletState
  connectWallet: (provider?: 'metamask' | 'circle') => Promise<void>
  disconnectWallet: () => void
  switchChain: (chainId: string) => Promise<void>
  sendTransaction: (to: string, value: string, data?: string) => Promise<string>
  fetchTokenBalance: (tokenAddress: string, walletAddress: string, chainId: number) => Promise<string>
  detectChainId: () => Promise<number>
  metaMaskSDK: typeof metaMaskSDK
  circleWallets: typeof circleWallets
  // Backward compatibility
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  address: string | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  isDemoMode: boolean
  isDummy: boolean
  balance: number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isDemo: false,
    balance: "0",
    provider: null,
  })

  // Initialize SDKs
  useEffect(() => {
    const initializeSDKs = async () => {
      try {
        console.log('🔄 Initializing SDKs...')
        
        // Initialize MetaMask SDK
        await metaMaskSDK.initialize()
        console.log('✅ MetaMask SDK initialized')
        
        // Initialize Circle Wallets SDK  
        await circleWallets.initialize()
        console.log('✅ Circle Wallets SDK initialized')
        
      } catch (error) {
        console.error('❌ SDK initialization failed:', error)
      }
    }

    initializeSDKs()
  }, [])

  const fetchTokenBalance = async (
    tokenAddress: string, 
    walletAddress: string, 
    chainId: number
  ): Promise<string> => {
    try {
      if (!metaMaskSDK.isConnected()) {
        return "0"
      }

      const provider = await metaMaskSDK.getProvider()
      
      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        // Native token (ETH, MATIC, etc.)
        const balance = await provider.getBalance(walletAddress)
        return (parseFloat(balance.toString()) / 10 ** 18).toFixed(6)
      } else {
        // ERC-20 token
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)"
          ],
          provider
        )
        
        const [balance, decimals] = await Promise.all([
          tokenContract.balanceOf(walletAddress),
          tokenContract.decimals()
        ])
        
        return (parseFloat(balance.toString()) / (10 ** Number(decimals))).toFixed(6)
      }
    } catch (error) {
      console.error(`Error fetching balance for ${tokenAddress}:`, error)
      return "0"
    }
  }

  const detectChainId = async (): Promise<number> => {
    try {
      if (!metaMaskSDK.isConnected()) {
        return 11155111 // Default to Sepolia
      }

      const provider = await metaMaskSDK.getProvider()
      const network = await provider.getNetwork()
      return Number(network.chainId)
    } catch (error) {
      console.error("Failed to detect chain ID:", error)
      return 11155111
    }
  }

  const connectWallet = async (provider: 'metamask' | 'circle' = 'metamask') => {
    try {
      if (provider === 'metamask') {
        console.log('🔗 Connecting to MetaMask...')
        
        const accounts = await metaMaskSDK.connect()
        
        if (accounts.length > 0) {
          const chainId = await detectChainId()
          const balance = await metaMaskSDK.getBalance(accounts[0].address)
          
          setWalletState({
            address: accounts[0].address,
            chainId: chainId,
            isConnected: true,
            isDemo: false,
            balance: (parseFloat(balance) / 10 ** 18).toFixed(4),
            provider: 'metamask',
          })

          toast({
            title: "✅ MetaMask Connected",
            description: `Connected to ${accounts[0].address.slice(0, 6)}...${accounts[0].address.slice(-4)}`,
          })
        }
      } else if (provider === 'circle') {
        // Circle Wallets connection
        const demoUserToken = 'demo_user_token'
        const demoEncryptionKey = 'demo_encryption_key'
        
        await circleWallets.authenticateUser(demoUserToken, demoEncryptionKey)
        
        const wallets = await circleWallets.getUserWallets()
        
        if (wallets.length > 0) {
          const wallet = wallets[0]
          const balance = await circleWallets.getWalletBalance(wallet.id)
          
          setWalletState({
            address: wallet.address,
            chainId: 11155111,
            isConnected: true,
            isDemo: false,
            balance: balance,
            provider: 'circle',
          })

          toast({
            title: "✅ Circle Wallet Connected",
            description: "Successfully connected to Circle Programmable Wallet",
          })
        } else {
          const newWallet = await circleWallets.createUserWallet("OmniPay Wallet")
          
          setWalletState({
            address: newWallet.address,
            chainId: 11155111,
            isConnected: true,
            isDemo: false,
            balance: "0",
            provider: 'circle',
          })

          toast({
            title: "✅ Circle Wallet Created",
            description: "New Circle Programmable Wallet created successfully",
          })
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      
      toast({
        title: "❌ Connection Failed",
        description: `Could not connect to ${provider}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = () => {
    try {
      if (walletState.provider === 'metamask') {
        metaMaskSDK.disconnect()
      }
      
      setWalletState({
        address: null,
        chainId: null,
        isConnected: false,
        isDemo: false,
        balance: "0",
        provider: null,
      })

      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      })
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const switchChain = async (chainId: string) => {
    try {
      if (walletState.provider === 'metamask') {
        await metaMaskSDK.switchChain(chainId)
        
        // Update state with new chain
        const newChainId = parseInt(chainId, 16)
        setWalletState(prev => ({
          ...prev,
          chainId: newChainId
        }))

        toast({
          title: "✅ Network Switched",
          description: `Switched to chain ${newChainId}`,
        })
      }
    } catch (error) {
      console.error("Failed to switch chain:", error)
      
      toast({
        title: "❌ Network Switch Failed",
        description: "Could not switch network. Please try manually.",
        variant: "destructive",
      })
    }
  }

  const sendTransaction = async (to: string, value: string, data?: string) => {
    try {
      if (walletState.provider === 'metamask') {
        const txHash = await metaMaskSDK.sendTransaction({
          to,
          value,
          data,
        })

        toast({
          title: "✅ Transaction Sent",
          description: `Transaction: ${txHash.slice(0, 10)}...`,
        })

        return txHash
      } else if (walletState.provider === 'circle') {
        // Circle transaction logic
        const wallets = await circleWallets.getUserWallets()
        if (wallets.length === 0) {
          throw new Error('No Circle wallet found')
        }
        
        const transaction = await circleWallets.transferTokens({
          walletId: wallets[0].id,
          destinationAddress: to,
          amount: value,
        })
        
        const txHash = transaction.txHash || transaction.id
        
        toast({
          title: "✅ Transaction Sent",
          description: `Transaction: ${txHash.slice(0, 10)}...`,
        })

        return txHash
      }
      
      throw new Error('No wallet connected')
    } catch (error: any) {
      console.error("Transaction failed:", error)
      
      toast({
        title: "❌ Transaction Failed",
        description: error.message || "Transaction could not be sent",
        variant: "destructive",
      })
      
      throw error
    }
  }

  // Backward compatibility
  const connect = () => connectWallet('metamask')
  const disconnect = async () => { disconnectWallet() }

  const contextValue: WalletContextType = {
    walletState,
    connectWallet,
    disconnectWallet,
    switchChain,
    sendTransaction,
    fetchTokenBalance,
    detectChainId,
    metaMaskSDK,
    circleWallets,
    // Backward compatibility
    connect,
    disconnect,
    address: walletState.address,
    account: walletState.address,
    chainId: walletState.chainId,
    isConnected: walletState.isConnected,
    isDemoMode: walletState.isDemo,
    isDummy: false,
    balance: parseFloat(walletState.balance),
  }

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// Global window type for MetaMask
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}
