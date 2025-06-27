"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowDown, ArrowLeft, Zap, Clock, DollarSign, AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import { WalletConnect } from "@/components/wallet-connect"
import { SUPPORTED_CHAINS, USDC_ADDRESSES, TOKEN_ADDRESSES } from "@/config/chains"
import type { PaymentRoute, TokenInfo } from "@/types/payment"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
// Remove LiFi SDK direct import, use our API instead
// Will use real LI.FI API through our backend endpoint

export default function SendPage() {
  const { walletState, metaMaskSDK } = useWallet()
  const { address: account, chainId, isConnected, isDemo: isDummy } = walletState
  const { toast } = useToast()

  const [fromToken, setFromToken] = useState("")
  const [fromChain, setFromChain] = useState<number>(42161) // Default to Arbitrum
  const [toChain, setToChain] = useState<number>(137) // Default to Polygon
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [route, setRoute] = useState<PaymentRoute | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [userTokens, setUserTokens] = useState<TokenInfo[]>([])
  const [txHash, setTxHash] = useState<string>("")

  // Get available tokens for current chain
  const getTokensForChain = (chainId: number): TokenInfo[] => {
    const tokens: TokenInfo[] = [
      {
        address: "0x0000000000000000000000000000000000000000", // Native token
        symbol: SUPPORTED_CHAINS[chainId]?.symbol || "ETH",
        name: SUPPORTED_CHAINS[chainId]?.name || "Ethereum",
        decimals: 18,
        chainId: chainId,
        logo: `/tokens/${SUPPORTED_CHAINS[chainId]?.symbol.toLowerCase()}.svg`,
        balance: isDummy ? "2.5" : "0", // Placeholder, will be updated by fetchBalance
      },
    ]

    // Add tokens specific to each chain from TOKEN_ADDRESSES
    if (TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES]) {
      const chainTokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES]
      Object.entries(chainTokens).forEach(([symbol, address]) => {
        // Avoid adding native token again if it's already there
        if (address === "0x0000000000000000000000000000000000000000") return

        tokens.push({
          address,
          symbol,
          name: symbol === "WETH" ? "Wrapped Ethereum" : symbol === "WMATIC" ? "Wrapped MATIC" : symbol,
          decimals: symbol === "USDC" ? 6 : 18, // USDC typically has 6 decimals
          chainId: chainId,
          logo: `/tokens/${symbol.toLowerCase()}.svg`,
          balance: isDummy ? "1000" : "0", // Placeholder, will be updated by fetchBalance
        })
      })
    }

    return tokens
  }

  // Fetch real token balances
  const fetchBalances = async (currentChainId: number, walletAccount: string) => {
    if (!walletAccount || isDummy) return

    const tokens = getTokensForChain(currentChainId)
    const updatedTokens: TokenInfo[] = []

    for (const token of tokens) {
      let balance = "0"
      try {
        // For now, set demo balances
        // TODO: Add real balance fetching with MetaMask SDK
        balance = isDummy ? "1000" : "0"
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol} on chain ${currentChainId}:`, error)
        balance = "0" // Default to 0 on error
      }
      updatedTokens.push({ ...token, balance })
    }
    setUserTokens(updatedTokens)
  }

  useEffect(() => {
    if (isConnected && chainId) {
      setFromChain(chainId)
      fetchBalances(chainId, account || "") // Fetch real balances
      const tokens = getTokensForChain(chainId)
      setUserTokens(tokens) // Set initial tokens, balances will be updated by fetchBalances
      if (tokens.length > 0 && !fromToken) {
        setFromToken(tokens[0].symbol)
      }
    }
  }, [isConnected, chainId, isDummy, account]) // Remove provider dependency

  // Calculate route using REAL LI.FI API integration
  const calculateRoute = async () => {
    if (!account || !amount || !recipient || !fromToken) {
      toast({
        title: "❌ Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)
    try {
      console.log('🔄 Calculating route with LI.FI...')
      
      const response = await fetch('/api/lifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromChain: fromChain.toString(),
          toChain: toChain.toString(),
          fromToken: fromToken,
          toToken: "USDC", // Always target USDC for cross-chain payments
          fromAmount: (parseFloat(amount) * 10**18).toString(),
          fromAddress: account,
          toAddress: recipient,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate route')
      }

      const { route: lifiRoute, quote } = await response.json()
      
      if (lifiRoute) {
        // Convert LI.FI route to our PaymentRoute format
        setRoute({
          id: lifiRoute.id || Math.random().toString(),
          fromAmount: amount,
          toAmount: (parseFloat(lifiRoute.toAmount) / 10**6).toFixed(6), // USDC has 6 decimals
          fromToken: fromToken,
          toToken: "USDC",
          fromChain: fromChain.toString(),
          toChain: toChain.toString(),
          gasFee: lifiRoute.gasCostUSD || "0.05",
          duration: lifiRoute.steps?.[0]?.estimate?.executionDuration || 300, // 5 minutes default
          exchange: lifiRoute.steps?.[0]?.toolDetails?.name || "LI.FI Bridge",
          steps: lifiRoute.steps || [],
          lifiRoute: lifiRoute, // Store original route for execution
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

  const sendPayment = async () => {
    if (!route || !account || !metaMaskSDK) {
      toast({
        title: "Error",
        description: "No route found or wallet not connected.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    setTxHash("") // Clear previous hash

    try {
      if (isDummy) {
        // Demo mode simulation
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64)
        setTxHash(mockTxHash)

        toast({
          title: "Payment initiated! 🚀",
          description: `Demo transaction created. ${route.usdcAmount} USDC will arrive soon.`,
        })
      } else {
        // Real transaction execution using LI.FI SDK
        toast({
          title: "Transaction initiated! 🚀",
          description: "Please confirm the transaction in your wallet...",
        })

        const signer = await metaMaskSDK.getSigner()

        // Execute the route using LiFi SDK
        const result = await lifi.executeRoute(signer, route.route, {
          updateCallback: (updatedRoute) => {
            console.log("Route updated:", updatedRoute)
            // You can update UI based on route status here
            if (updatedRoute.status === "DONE") {
              toast({
                title: "Payment Sent Successfully! ✅",
                description: `Transaction confirmed: ${updatedRoute.txHash}`,
              })
              setTxHash(updatedRoute.txHash || "")
            } else if (updatedRoute.status === "FAILED") {
              toast({
                title: "Payment Failed",
                description: updatedRoute.errorMessage || "Transaction failed.",
                variant: "destructive",
              })
            }
          },
        })

        if (result.txHash) {
          setTxHash(result.txHash)
          toast({
            title: "Transaction Submitted! 🎉",
            description: `View on explorer: ${result.txHash.slice(0, 10)}...`,
          })
        } else {
          throw new Error("Transaction failed to return a hash.")
        }
      }

      // Reset form after successful initiation (or completion in demo)
      setAmount("")
      setRecipient("")
      setRoute(null)
    } catch (error: any) {
      console.error("Error sending payment:", error)
      toast({
        title: "Payment failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const getExplorerUrl = (hash: string) => {
    if (!chainId || !SUPPORTED_CHAINS[chainId]) return ""
    return `${SUPPORTED_CHAINS[chainId].explorerUrl}/tx/${hash}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect MetaMask to start sending cross-chain payments</p>
            <WalletConnect size="lg" className="w-full" />
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
              <CardTitle>Select Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(SUPPORTED_CHAINS).map((chain) => (
                  <Button
                    key={chain.id}
                    variant={fromChain === chain.id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => {
                      setFromChain(chain.id)
                      fetchBalances(chain.id, account || "") // Fetch balances for new chain
                      const tokens = getTokensForChain(chain.id)
                      setUserTokens(tokens)
                      if (tokens.length > 0) {
                        setFromToken(tokens[0].symbol)
                      }
                    }}
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
                      {Object.values(SUPPORTED_CHAINS).map((chain) => (
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
                      {amount} {fromToken}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">They receive</div>
                    <div className="font-bold text-green-600">{route.usdcAmount} USDC</div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>~{Math.floor(route.estimatedTime / 60)} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-gray-500" />
                    <span>Gas: ~{route.estimatedGas} ETH</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Hash */}
          {txHash && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Transaction Submitted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Transaction Hash</div>
                    <div className="font-mono text-sm">{txHash.slice(0, 20)}...</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={getExplorerUrl(txHash)} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Explorer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!route ? (
              <Button
                onClick={calculateRoute}
                disabled={!amount || !fromToken || !recipient || isCalculating}
                className="w-full"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Calculating best route...
                  </>
                ) : (
                  "Calculate Route"
                )}
              </Button>
            ) : (
              <Button onClick={sendPayment} disabled={isSending} className="w-full" size="lg">
                {isSending ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Sending payment...
                  </>
                ) : (
                  `Send ${route.usdcAmount} USDC`
                )}
              </Button>
            )}

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span>Powered by LI.FI cross-chain routing</span>
            </div>
            {isDummy && (
              <div className="flex items-center justify-center space-x-2 text-sm text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span>Demo mode: All blockchain interactions are simulated.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
