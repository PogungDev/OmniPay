"use client"

import { useState, useEffect, useCallback } from 'react'
import { ethers, BrowserProvider, Contract } from 'ethers'
import { useToast } from './use-toast'
import { 
  CONTRACT_ADDRESSES, 
  OMNIPAY_CORE_ABI, 
  OMNIPAY_CCTP_ABI, 
  OMNIPAY_CARD_ABI,
  getContractAddress,
  areContractsDeployed,
  USDC_ADDRESSES
} from '@/lib/contracts'

export interface UserProfile {
  name: string
  email: string
  isVerified: boolean
  totalSent: string
  totalReceived: string
  transactionCount: string
  registrationTime: string
}

export interface Payment {
  sender: string
  recipient: string
  token: string
  amount: string
  timestamp: string
  status: string
  txHash: string
  chainId: string
  tokenSymbol: string
}

export interface CCTPTransfer {
  transferId: string
  sender: string
  recipient: string
  amount: string
  destinationDomain: number
  sourceDomain: number
  nonce: string
  burnTxHash: string
  attestation: string
  status: number
  timestamp: string
}

export interface CardProfile {
  owner: string
  creditLimit: string
  currentBalance: string
  availableCredit: string
  isActive: boolean
  createdAt: string
  cardId: string
}

export function useOmniPayContracts() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<any>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [account, setAccount] = useState<string>("")
  const [isContractsDeployed, setIsContractsDeployed] = useState(false)
  const { toast } = useToast()

  // Initialize provider and check contracts
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum)
          setProvider(provider)
          
          const network = await provider.getNetwork()
          const currentChainId = Number(network.chainId)
          setChainId(currentChainId)
          
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0].address)
            setSigner(await provider.getSigner())
          }

          // Check if contracts are deployed
          const deployed = areContractsDeployed(currentChainId)
          setIsContractsDeployed(deployed)
          
        } catch (error) {
          console.error('Failed to initialize provider:', error)
        }
      }
    }

    initProvider()

    // Listen for account/network changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          initProvider()
        } else {
          setAccount('')
          setSigner(null)
        }
      })

      window.ethereum.on('chainChanged', () => {
        initProvider()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }, [])

  // Get contract instance
  const getContract = useCallback((contractName: 'CORE' | 'CCTP' | 'CARD', withSigner = false) => {
    if (!provider || !chainId) return null

    try {
      const address = getContractAddress(chainId, `OMNIPAY_${contractName}`)
      let abi: string[]
      
      switch (contractName) {
        case 'CORE':
          abi = OMNIPAY_CORE_ABI
          break
        case 'CCTP':
          abi = OMNIPAY_CCTP_ABI
          break
        case 'CARD':
          abi = OMNIPAY_CARD_ABI
          break
        default:
          throw new Error(`Unknown contract: ${contractName}`)
      }

      return new Contract(address, abi, withSigner && signer ? signer : provider)
    } catch (error) {
      console.error(`Failed to get ${contractName} contract:`, error)
      return null
    }
  }, [provider, signer, chainId])

  // Core Contract Functions
  const registerUser = useCallback(async (name: string, email: string) => {
    if (!signer) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return null
    }

    try {
      const contract = getContract('CORE', true)
      if (!contract) throw new Error('Core contract not available')

      const tx = await contract.registerUser(name, email)
      await tx.wait()

      toast({
        title: "Registration successful",
        description: "Your profile has been created"
      })

      return tx.hash
    } catch (error) {
      console.error('Registration failed:', error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
      return null
    }
  }, [signer, getContract, toast])

  const createPayment = useCallback(async (
    recipient: string,
    token: string,
    amount: string,
    txHash: string,
    chainId: number,
    tokenSymbol: string
  ) => {
    if (!signer) throw new Error('Wallet not connected')

    try {
      const contract = getContract('CORE', true)
      if (!contract) throw new Error('Core contract not available')

      const tx = await contract.createPayment(
        recipient,
        token,
        ethers.parseUnits(amount, 18),
        txHash,
        chainId,
        tokenSymbol
      )
      await tx.wait()

      return tx.hash
    } catch (error) {
      console.error('Create payment failed:', error)
      throw error
    }
  }, [signer, getContract])

  const getUserProfile = useCallback(async (address?: string): Promise<UserProfile | null> => {
    try {
      const contract = getContract('CORE')
      if (!contract) return null

      const userAddress = address || account
      if (!userAddress) return null

      const profile = await contract.getUserProfile(userAddress)
      
      return {
        name: profile.name,
        email: profile.email,
        isVerified: profile.isVerified,
        totalSent: ethers.formatEther(profile.totalSent),
        totalReceived: ethers.formatEther(profile.totalReceived),
        transactionCount: profile.transactionCount.toString(),
        registrationTime: new Date(Number(profile.registrationTime) * 1000).toISOString()
      }
    } catch (error) {
      console.error('Get user profile failed:', error)
      return null
    }
  }, [getContract, account])

  const getUserPayments = useCallback(async (address?: string): Promise<Payment[]> => {
    try {
      const contract = getContract('CORE')
      if (!contract) return []

      const userAddress = address || account
      if (!userAddress) return []

      const paymentIds = await contract.getUserPayments(userAddress)
      const payments: Payment[] = []

      for (const paymentId of paymentIds) {
        try {
          const payment = await contract.getPayment(paymentId)
          payments.push({
            sender: payment.sender,
            recipient: payment.recipient,
            token: payment.token,
            amount: ethers.formatEther(payment.amount),
            timestamp: new Date(Number(payment.timestamp) * 1000).toISOString(),
            status: payment.status,
            txHash: payment.txHash,
            chainId: payment.chainId.toString(),
            tokenSymbol: payment.tokenSymbol
          })
        } catch (err) {
          console.error('Failed to get payment details:', err)
        }
      }

      return payments
    } catch (error) {
      console.error('Get user payments failed:', error)
      return []
    }
  }, [getContract, account])

  // CCTP Functions
  const initiateCCTPTransfer = useCallback(async (
    recipient: string,
    amount: string,
    destinationChainId: number
  ) => {
    if (!signer) throw new Error('Wallet not connected')

    try {
      const contract = getContract('CCTP', true)
      if (!contract) throw new Error('CCTP contract not available')

      // First approve USDC
      const usdcAddress = USDC_ADDRESSES[chainId as keyof typeof USDC_ADDRESSES]
      if (!usdcAddress) throw new Error('USDC not supported on this chain')

      const usdcContract = new Contract(
        usdcAddress,
        ["function approve(address spender, uint256 amount) external returns (bool)"],
        signer
      )

      const approveAmount = ethers.parseUnits(amount, 6) // USDC has 6 decimals
      const approveTx = await usdcContract.approve(contract.target, approveAmount)
      await approveTx.wait()

      // Then initiate transfer
      const tx = await contract.initiateCCTPTransfer(
        recipient,
        approveAmount,
        destinationChainId
      )
      await tx.wait()

      return tx.hash
    } catch (error) {
      console.error('CCTP transfer failed:', error)
      throw error
    }
  }, [signer, getContract, chainId])

  // Card Functions
  const createCard = useCallback(async (cardId: string) => {
    if (!signer) throw new Error('Wallet not connected')

    try {
      const contract = getContract('CARD', true)
      if (!contract) throw new Error('Card contract not available')

      const tx = await contract.createCard(cardId)
      await tx.wait()

      return tx.hash
    } catch (error) {
      console.error('Create card failed:', error)
      throw error
    }
  }, [signer, getContract])

  const getCardProfile = useCallback(async (address?: string): Promise<CardProfile | null> => {
    try {
      const contract = getContract('CARD')
      if (!contract) return null

      const userAddress = address || account
      if (!userAddress) return null

      const profile = await contract.cardProfiles(userAddress)
      
      return {
        owner: profile.owner,
        creditLimit: ethers.formatEther(profile.creditLimit),
        currentBalance: ethers.formatEther(profile.currentBalance),
        availableCredit: ethers.formatEther(profile.availableCredit),
        isActive: profile.isActive,
        createdAt: new Date(Number(profile.createdAt) * 1000).toISOString(),
        cardId: profile.cardId
      }
    } catch (error) {
      console.error('Get card profile failed:', error)
      return null
    }
  }, [getContract, account])

  return {
    // State
    provider,
    signer,
    chainId,
    account,
    isContractsDeployed,
    
    // Core functions
    registerUser,
    createPayment,
    getUserProfile,
    getUserPayments,
    
    // CCTP functions
    initiateCCTPTransfer,
    
    // Card functions
    createCard,
    getCardProfile,
    
    // Utils
    getContract
  }
} 