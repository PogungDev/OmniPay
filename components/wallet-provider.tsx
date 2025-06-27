"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"
import { metaMaskSDK } from "@/lib/metamask-sdk"
import { circleWallets } from "@/lib/circle-wallets"

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
  metaMaskSDK: typeof metaMaskSDK
  circleWallets: typeof circleWallets
  // Backward compatibility
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  address: string | null
  chainId: number | null
  isConnected: boolean
  isDemoMode: boolean
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

  // Check if MetaMask is available (fallback compatibility)
  const isMetaMaskAvailable = () => {
    return typeof window !== "undefined" && window.ethereum && window.ethereum.isMetaMask
  }

  // Initialize SDKs and set demo mode if needed
  useEffect(() => {
    const initializeSDKs = async () => {
      try {
        // Initialize MetaMask SDK
        await metaMaskSDK.initialize()
        console.log('✅ MetaMask SDK initialized')
        
        // Initialize Circle Wallets SDK  
        await circleWallets.initialize()
        console.log('✅ Circle Wallets SDK initialized')
        
        // Check if MetaMask is connected
        if (metaMaskSDK.isConnected()) {
          await checkMetaMaskConnection()
        } else if (!isMetaMaskAvailable()) {
          // Fallback to demo mode
          setWalletState({
            address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
            chainId: 1, // Ethereum mainnet for demo
            isConnected: true,
            isDemo: true,
            balance: "1.5",
            provider: 'demo',
          })
          
          toast({
            title: "Demo Mode Active",
            description: "MetaMask not detected. Using demo wallet.",
          })
        }
      } catch (error) {
        console.error('❌ SDK initialization failed:', error)
        
        // Fallback to demo mode on error
        setWalletState({
          address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
          chainId: 1,
          isConnected: true,
          isDemo: true,
          balance: "1.5",
          provider: 'demo',
        })
      }
    }

    initializeSDKs()
  }, [])

  const checkMetaMaskConnection = async () => {
    try {
      const accounts = await metaMaskSDK.getAccounts()
      if (accounts.length > 0) {
        const balance = await metaMaskSDK.getBalance(accounts[0])
        
        setWalletState({
          address: accounts[0],
          chainId: 1, // Will be updated by chain detection
          isConnected: true,
          isDemo: false,
          balance: (parseFloat(balance) / 10 ** 18).toFixed(4),
          provider: 'metamask',
        })
      }
    } catch (error) {
      console.error("Failed to check MetaMask connection:", error)
    }
  }

  const connectWallet = async (provider: 'metamask' | 'circle' = 'metamask') => {
    try {
      if (provider === 'metamask') {
        const accounts = await metaMaskSDK.connect()
        
        if (accounts.length > 0) {
          const balance = await metaMaskSDK.getBalance(accounts[0].address)
          
          setWalletState({
            address: accounts[0].address,
            chainId: 1, // Will be updated by chain detection
            isConnected: true,
            isDemo: false,
            balance: (parseFloat(balance) / 10 ** 18).toFixed(4),
            provider: 'metamask',
          })

          toast({
            title: "✅ MetaMask Connected",
            description: "Successfully connected to MetaMask SDK",
          })
        }
      } else if (provider === 'circle') {
        // For Circle Wallets, we need user authentication first
        const demoUserToken = 'demo_user_token'
        const demoEncryptionKey = 'demo_encryption_key'
        
        await circleWallets.authenticateUser(demoUserToken, demoEncryptionKey)
        
        const wallets = await circleWallets.getUserWallets()
        
        if (wallets.length > 0) {
          const wallet = wallets[0]
          const balance = await circleWallets.getWalletBalance(wallet.id)
          
          setWalletState({
            address: wallet.address,
            chainId: 1,
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
          // Create new wallet if none exists
          const newWallet = await circleWallets.createUserWallet("OmniPay Wallet")
          
          setWalletState({
            address: newWallet.address,
            chainId: 1,
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
        description: `Could not connect to ${provider}. Using demo mode.`,
        variant: "destructive",
      })
      
      // Fallback to demo mode
      setWalletState({
        address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
        chainId: 1,
        isConnected: true,
        isDemo: true,
        balance: "1.5",
        provider: 'demo',
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
      console.error("Failed to disconnect:", error)
    }
  }

  const switchChain = async (chainId: string) => {
    if (walletState.isDemo) {
      // In demo mode, just update the state
      setWalletState((prev) => ({ ...prev, chainId: parseInt(chainId) }))
      return
    }

    try {
      if (walletState.provider === 'metamask') {
        await metaMaskSDK.switchChain(chainId)
        setWalletState((prev) => ({ ...prev, chainId: parseInt(chainId) }))
        
        toast({
          title: "✅ Chain Switched",
          description: `Switched to chain ${chainId}`,
        })
      }
    } catch (error: any) {
      console.error("Failed to switch chain:", error)
      
      toast({
        title: "❌ Chain Switch Failed",
        description: error.message || "Failed to switch chain",
        variant: "destructive",
      })
    }
  }

  const sendTransaction = async (to: string, value: string, data?: string) => {
    if (walletState.isDemo) {
      // Simulate transaction in demo mode
      return `0x${Math.random().toString(16).substr(2, 64)}`
    }

    if (!walletState.address) {
      throw new Error("Wallet not connected")
    }

    try {
      if (walletState.provider === 'metamask') {
        const txHash = await metaMaskSDK.sendTransaction({
          to,
          value,
          data,
        })
        return txHash
      } else if (walletState.provider === 'circle') {
        // For Circle Wallets, we need to find the wallet ID first
        const wallets = await circleWallets.getUserWallets()
        if (wallets.length > 0) {
          const transaction = await circleWallets.transferTokens({
            walletId: wallets[0].id,
            destinationAddress: to,
            amount: value,
          })
          return transaction.txHash || transaction.id
        }
      }
      
      throw new Error("No supported wallet provider")
    } catch (error) {
      console.error("Transaction failed:", error)
      throw error
    }
  }

  // Backward compatibility wrappers
  const connect = () => connectWallet('metamask')
  const disconnect = async () => { disconnectWallet() }

  const value = {
    walletState,
    connectWallet,
    disconnectWallet,
    switchChain,
    sendTransaction,
    metaMaskSDK,
    circleWallets,
    // Backward compatibility
    connect,
    disconnect,
    address: walletState.address,
    chainId: walletState.chainId,
    isConnected: walletState.isConnected,
    isDemoMode: walletState.isDemo,
    balance: parseFloat(walletState.balance),
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// TypeScript declarations for window.ethereum (fallback)
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
