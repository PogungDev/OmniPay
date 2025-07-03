"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowDown, ArrowLeft, Zap, Clock, DollarSign, AlertCircle, ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import { WalletConnect } from "@/components/wallet-connect"
import { SUPPORTED_CHAINS } from "@/config/chains"
import type { TokenInfo } from "@/types/payment"
import { useToast } from "@/hooks/use-toast"
import { lifiSDK } from "@/lib/lifi-real"
import { delegationToolkit } from "@/lib/delegation-toolkit"

interface PaymentRoute {
  id: string
  fromAmount: string
  toAmount: string
  fromToken: string
  toToken: string
  fromChain: string
  toChain: string
  gasFee: string
  duration: number
  exchange: string
  steps: any[]
  lifiRoute: any
}

export default function SendPage() {
  const { 
    walletState, 
    metaMaskSDK, 
    fetchTokenBalance, 
    detectChainId,
    switchChain 
  } = useWallet()
  const { address: account, chainId, isConnected, isDemo: isDummy } = walletState
  const { toast } = useToast()

  // Form states
  const [fromToken, setFromToken] = useState("")
  const [fromChain, setFromChain] = useState<number>(11155111) // Default to Sepolia
  const [toChain, setToChain] = useState<number>(421614) // Default to Arbitrum Sepolia
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  
  // Route and execution states
  const [route, setRoute] = useState<PaymentRoute | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [userTokens, setUserTokens] = useState<TokenInfo[]>([])
  
  // Transaction tracking
  const [txHash, setTxHash] = useState<string>("")
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  
  // Delegation features
  const [useDelegation, setUseDelegation] = useState(false)
  const [delegationAddress, setDelegationAddress] = useState("")

  // Get available tokens for current chain
  const getTokensForChain = (chainId: number): TokenInfo[] => {
    const chainConfig = SUPPORTED_CHAINS[chainId]
    if (!chainConfig) return []

    const tokens: TokenInfo[] = [
      {
        address: "0x0000000000000000000000000000000000000000", // Native token
        symbol: chainConfig.nativeToken.symbol,
        name: chainConfig.nativeToken.name,
        decimals: chainConfig.nativeToken.decimals,
        chainId: chainId,
        logo: `/tokens/${chainConfig.nativeToken.symbol.toLowerCase()}.svg`,
        balance: "0",
      },
    ]

    // Add supported tokens for this chain
    chainConfig.supportedTokens.forEach(token => {
      tokens.push({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        chainId: chainId,
        logo: token.logoUrl,
        balance: "0",
      })
    })

    return tokens
  }

  // Fetch real token balances
  const fetchBalances = async (currentChainId: number, walletAccount: string) => {
    if (!walletAccount || isDummy) {
      // Set demo balances
      const tokens = getTokensForChain(currentChainId)
      const demoTokens = tokens.map(token => ({
        ...token,
        balance: token.symbol === "ETH" ? "2.5" : "1000"
      }))
      setUserTokens(demoTokens)
      return
    }

    try {
      const tokens = getTokensForChain(currentChainId)
      const updatedTokens: TokenInfo[] = []

      for (const token of tokens) {
        const balance = await fetchTokenBalance(token.address, walletAccount, currentChainId)
        updatedTokens.push({ ...token, balance })
      }
      
      setUserTokens(updatedTokens)
    } catch (error) {
      console.error("Error fetching balances:", error)
      setUserTokens(getTokensForChain(currentChainId))
    }
  }

  // Network change handler
  const handleNetworkChange = async (newChainId: number) => {
    setFromChain(newChainId)
    
    // Switch chain if connected to MetaMask
    if (!isDummy && isConnected) {
      try {
        await switchChain(`0x${newChainId.toString(16)}`)
      } catch (error) {
        console.error("Failed to switch chain:", error)
      }
    }
    
    // Fetch balances for new chain
    if (account) {
      await fetchBalances(newChainId, account)
    }
    
    // Update token selection
    const tokens = getTokensForChain(newChainId)
    if (tokens.length > 0) {
      setFromToken(tokens[0].symbol)
    }
  }

  // Initialize on wallet connection
  useEffect(() => {
    if (isConnected && chainId) {
      setFromChain(chainId)
      if (account) {
        fetchBalances(chainId, account)
      }
      const tokens = getTokensForChain(chainId)
      if (tokens.length > 0 && !fromToken) {
        setFromToken(tokens[0].symbol)
      }
    }
  }, [isConnected, chainId, account])

  // Calculate route using LI.FI
  const calculateRoute = async () => {
    if (!account || !amount || !recipient || !fromToken) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    const selectedToken = userTokens.find(t => t.symbol === fromToken)
    if (!selectedToken) {
      toast({
        title: "❌ Token Not Found",
        description: "Selected token not available",
        variant: "destructive",
      })
      return
    }

    // Check balance
    const balance = parseFloat(selectedToken.balance)
    const requestedAmount = parseFloat(amount)
    if (requestedAmount > balance) {
      toast({
        title: "❌ Insufficient Balance",
        description: `You only have ${balance} ${fromToken}`,
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)
    try {
      console.log('🔄 Calculating route with LI.FI...')
      
      // Calculate amount with decimals
      const amountWei = (parseFloat(amount) * 10**selectedToken.decimals).toString()
      
      const response = await fetch('/api/lifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromChain: fromChain.toString(),
          toChain: toChain.toString(),
          fromToken: selectedToken.address,
          toToken: "USDC",
          fromAmount: amountWei,
          fromAddress: account,
          toAddress: recipient,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate route')
      }

      const { route: lifiRoute, quote } = await response.json()
      
      if (lifiRoute) {
        setRoute({
          id: lifiRoute.id || Math.random().toString(),
          fromAmount: amount,
          toAmount: (parseFloat(lifiRoute.toAmount) / 10**6).toFixed(6), // USDC has 6 decimals
          fromToken: fromToken,
          toToken: "USDC",
          fromChain: fromChain.toString(),
          toChain: toChain.toString(),
          gasFee: lifiRoute.gasCostUSD || "0.05",
          duration: lifiRoute.steps?.[0]?.estimate?.executionDuration || 300,
          exchange: lifiRoute.steps?.[0]?.toolDetails?.name || "LI.FI Bridge",
          steps: lifiRoute.steps || [],
          lifiRoute: lifiRoute,
        })
        
        toast({
          title: "✅ Route Calculated",
          description: `Best route found via ${lifiRoute.steps?.[0]?.toolDetails?.name || 'LI.FI'}`,
        })
      } else {
        throw new Error('No route found')
      }
    } catch (error) {
      console.error("Route calculation failed:", error)
      
      toast({
        title: "❌ Route Calculation Failed",
        description: "Could not find a route for this transfer. Try different tokens or chains.",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  // Execute payment with delegation support
  const sendPayment = async () => {
    if (!route || !account) {
      toast({
        title: "❌ Error",
        description: "No route found or wallet not connected.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    setTxHash("")
    setTxStatus("pending")
    setStatusMessage("Preparing transaction...")

    try {
      if (isDummy) {
        // Demo mode simulation
        setStatusMessage("Processing demo transaction...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64)
        setTxHash(mockTxHash)
        setTxStatus("success")
        setStatusMessage("Demo transaction completed! ✅")

        toast({
          title: "Payment Sent! 🚀",
          description: `Demo transaction created. ${route.toAmount} USDC will arrive soon.`,
        })
      } else {
        // Real transaction execution
        toast({
          title: "Transaction Initiated! 🚀",
          description: "Please confirm the transaction in your wallet...",
        })

        if (useDelegation && delegationAddress) {
          // Use MetaMask Delegation Toolkit
          const provider = await metaMaskSDK.getProvider()
          await delegationToolkit.initialize(provider)
          
          const delegation = await delegationToolkit.createDelegation({
            delegate: delegationAddress,
            authority: account,
            caveats: [],
          })

          setStatusMessage("Executing delegated transaction...")
          
          const txHash = await delegationToolkit.executeDelegatedTransaction({
            to: route.lifiRoute.steps[0].transactionRequest.to,
            value: route.lifiRoute.steps[0].transactionRequest.value || "0",
            data: route.lifiRoute.steps[0].transactionRequest.data,
            delegationData: delegation,
          })

          setTxHash(txHash)
          setStatusMessage("Delegated transaction submitted!")
        } else {
          // Regular execution via LI.FI
          const signer = await metaMaskSDK.getProvider().then(p => p.getSigner())
          
          setStatusMessage("Executing route...")
          
          const result = await lifiSDK.executeRoute(signer, route.lifiRoute, {
            updateCallback: (updatedRoute) => {
              console.log("Route updated:", updatedRoute)
              
              if (updatedRoute.status === "DONE") {
                setTxStatus("success")
                setStatusMessage("Payment completed successfully! ✅")
                toast({
                  title: "Payment Sent Successfully! ✅",
                  description: `Transaction confirmed: ${updatedRoute.txHash}`,
                })
                setTxHash(updatedRoute.txHash || "")
              } else if (updatedRoute.status === "FAILED") {
                setTxStatus("failed")
                setStatusMessage("Transaction failed ❌")
                toast({
                  title: "Payment Failed",
                  description: updatedRoute.errorMessage || "Transaction failed.",
                  variant: "destructive",
                })
              } else {
                setStatusMessage(`Transaction ${updatedRoute.status.toLowerCase()}...`)
              }
            },
          })

          if (result.txHash) {
            setTxHash(result.txHash)
            setStatusMessage("Transaction submitted, waiting for confirmation...")
            toast({
              title: "Transaction Submitted! 🎉",
              description: `View on explorer: ${result.txHash.slice(0, 10)}...`,
            })
          }
        }
      }

      // Reset form after successful initiation
      setAmount("")
      setRecipient("")
      setRoute(null)
    } catch (error: any) {
      console.error("Error sending payment:", error)
      setTxStatus("failed")
      setStatusMessage("Transaction failed ❌")
      
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getExplorerUrl = (hash: string) => {
    const chainConfig = SUPPORTED_CHAINS[fromChain]
    if (!chainConfig) return ""
    return `${chainConfig.explorerUrl}/tx/${hash}`
  }

  const getStatusIcon = () => {
    switch (txStatus) {
      case "pending":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect MetaMask to start sending cross-chain payments</p>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Send Payment</h1>
              <p className="text-gray-600">Send any token, recipient gets USDC</p>
            </div>
          </div>
          <Badge variant="secondary">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            {isDummy && <span className="ml-1 text-yellow-500">(Demo)</span>}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Network Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Source Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(SUPPORTED_CHAINS)
                  .filter(chain => [11155111, 421614, 1, 42161].includes(chain.id)) // Show testnet + mainnet
                  .map((chain) => (
                  <Button
                    key={chain.id}
                    variant={fromChain === chain.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => handleNetworkChange(chain.id)}
                  >
                    <span className="font-medium">{chain.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {chain.symbol}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* From Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span>From</span>
                <Badge variant="outline" className="ml-2">
                  {SUPPORTED_CHAINS[fromChain]?.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token">Token</Label>
                  <Select value={fromToken} onValueChange={setFromToken}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTokens.map((token) => (
                        <SelectItem key={token.address} value={token.symbol}>
                          <div className="flex items-center space-x-2">
                            <span>{token.symbol}</span>
                            <span className="text-sm text-gray-500">
                              Balance: {Number.parseFloat(token.balance).toFixed(4)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* To Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span>To</span>
                <Badge variant="outline" className="ml-2">
                  {SUPPORTED_CHAINS[toChain]?.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Token</Label>
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium">USDC</span>
                    <Badge variant="secondary" className="ml-auto">
                      Stable
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="chain">Chain</Label>
                  <Select value={toChain.toString()} onValueChange={(value) => setToChain(Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(SUPPORTED_CHAINS)
                        .filter(chain => [11155111, 421614, 1, 42161].includes(chain.id))
                        .map((chain) => (
                        <SelectItem key={chain.id} value={chain.id.toString()}>
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delegation Option */}
          {!isDummy && delegationToolkit.isSupported() && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="delegation" 
                    checked={useDelegation}
                    onCheckedChange={(checked) => setUseDelegation(checked === true)}
                  />
                  <Label htmlFor="delegation">Use Delegated Signer</Label>
                </div>
                {useDelegation && (
                  <div>
                    <Label htmlFor="delegateAddress">Delegate Address</Label>
                    <Input
                      id="delegateAddress"
                      placeholder="0x... (address that can execute on your behalf)"
                      value={delegationAddress}
                      onChange={(e) => setDelegationAddress(e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Route Preview */}
          {route && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Route Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">You send</div>
                    <div className="font-bold">
                      {route.fromAmount} {route.fromToken}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Recipient gets</div>
                    <div className="font-bold">
                      {route.toAmount} {route.toToken}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Bridge</div>
                    <div className="font-medium">{route.exchange}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Est. Fee</div>
                    <div className="font-medium">${route.gasFee}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Est. Time</div>
                    <div className="font-medium">{Math.ceil(route.duration / 60)}min</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Status */}
          {txHash && (
            <Alert>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <AlertCircle className="h-4 w-4" />
              </div>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">{statusMessage}</div>
                  <div className="text-sm">
                    Transaction Hash: 
                    <a 
                      href={getExplorerUrl(txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:underline inline-flex items-center"
                    >
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!route ? (
              <Button 
                onClick={calculateRoute} 
                disabled={isCalculating || !amount || !recipient}
                className="w-full"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating Route...
                  </>
                ) : (
                  "Calculate Route"
                )}
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setRoute(null)}
                  disabled={isSending}
                >
                  Recalculate
                </Button>
                <Button 
                  onClick={sendPayment} 
                  disabled={isSending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Payment"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
