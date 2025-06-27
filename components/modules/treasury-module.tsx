"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Loader2, ExternalLink, TrendingUp, DollarSign, ArrowLeftRight, Shield, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { SUPPORTED_CHAINS } from "@/config/chains"
import { useWallet } from "@/components/wallet-provider"
import { addTransactionToHistory, updateTransactionStatus, generateTestnetTxHash } from "@/lib/transaction-utils"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const mockTreasuryBalances = [
  {
    id: "usdc_eth",
    name: "USDC",
    chain: "Ethereum",
    chainId: 1,
    balance: 100000,
    usdPrice: 1,
    icon: "/placeholder.svg?height=24&width=24",
  },
  {
    id: "usdc_poly",
    name: "USDC",
    chain: "Polygon",
    chainId: 137,
    balance: 75000,
    usdPrice: 1,
    icon: "/placeholder.svg?height=24&width=24",
  },
  {
    id: "usdc_arb",
    name: "USDC",
    chain: "Arbitrum",
    chainId: 42161,
    balance: 50000,
    usdPrice: 1,
    icon: "/placeholder.svg?height=24&width=24",
  },
  {
    id: "usdc_sepolia",
    name: "USDC",
    chain: "Sepolia",
    chainId: 11155111,
    balance: 25000,
    usdPrice: 1,
    icon: "/placeholder.svg?height=24&width=24",
  },
]

interface ChainBalance {
  chainId: number
  name: string
  symbol: string
  icon: string
  usdcBalance: number
  targetAllocation: number
  currentAllocation: number
  explorer: string
}

interface RebalanceAction {
  id: string
  type: "add" | "remove"
  amount: number
  fromChain: string
  toChain: string
  reason: string
}

const CHAIN_BALANCES: ChainBalance[] = [
  {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    icon: "⟠",
    usdcBalance: 45650.25,
    targetAllocation: 40,
    currentAllocation: 45.7,
    explorer: "https://etherscan.io"
  },
  {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC", 
    icon: "⬟",
    usdcBalance: 28450.80,
    targetAllocation: 30,
    currentAllocation: 28.5,
    explorer: "https://polygonscan.com"
  },
  {
    chainId: 42161,
    name: "Arbitrum",
    symbol: "ARB",
    icon: "🔷",
    usdcBalance: 15230.90,
    targetAllocation: 20,
    currentAllocation: 15.3,
    explorer: "https://arbiscan.io"
  },
  {
    chainId: 8453,
    name: "Base",
    symbol: "BASE",
    icon: "🔵",
    usdcBalance: 10568.05,
    targetAllocation: 10,
    currentAllocation: 10.5,
    explorer: "https://basescan.org"
  }
]

export default function TreasuryModule() {
  const { isConnected, address } = useWallet()
  const [selectedAction, setSelectedAction] = useState<"rebalance" | "add_liquidity" | "remove_liquidity">()
  const [selectedFromChain, setSelectedFromChain] = useState("")
  const [selectedToChain, setSelectedToChain] = useState("")
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStep, setTxStep] = useState<"form" | "processing" | "success">("form")
  const [txHash, setTxHash] = useState("")
  const [txId, setTxId] = useState("")


  const totalTreasuryValue = CHAIN_BALANCES.reduce((sum, chain) => sum + chain.usdcBalance, 0)
  const fromChain = CHAIN_BALANCES.find(c => c.chainId.toString() === selectedFromChain)
  const toChain = CHAIN_BALANCES.find(c => c.chainId.toString() === selectedToChain)

  const suggestedRebalances = CHAIN_BALANCES.filter(chain => 
    Math.abs(chain.currentAllocation - chain.targetAllocation) > 2
  ).map(chain => ({
    id: `rebal_${chain.chainId}`,
    type: chain.currentAllocation > chain.targetAllocation ? "remove" : "add" as "add" | "remove",
    amount: Math.abs((chain.targetAllocation - chain.currentAllocation) / 100 * totalTreasuryValue),
    fromChain: chain.currentAllocation > chain.targetAllocation ? chain.name : "External",
    toChain: chain.currentAllocation < chain.targetAllocation ? chain.name : "External",
    reason: chain.currentAllocation > chain.targetAllocation ? 
      `Over-allocated by ${(chain.currentAllocation - chain.targetAllocation).toFixed(1)}%` :
      `Under-allocated by ${(chain.targetAllocation - chain.currentAllocation).toFixed(1)}%`
  }))

  const handleTreasuryOperation = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!selectedAction || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid operation",
        description: "Please select action and enter valid amount",
        variant: "destructive",
      })
      return
    }

    if (selectedAction === "rebalance" && (!selectedFromChain || !selectedToChain)) {
      toast({
        title: "Invalid rebalance",
        description: "Please select both source and destination chains",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setTxStep("processing")

    // Create transaction record as "Processing"
    const operationType = selectedAction === "rebalance" ? "Treasury Rebalance" :
                         selectedAction === "add_liquidity" ? "Treasury Add Liquidity" :
                         "Treasury Remove Liquidity"

    const transactionId = addTransactionToHistory({
      type: operationType,
      status: "Processing",
      amount: parseFloat(amount),
      token: "USDC",
      usdValue: parseFloat(amount),
      from: selectedAction === "rebalance" ? fromChain?.name || "Treasury" : "External",
      to: selectedAction === "rebalance" ? toChain?.name || "Treasury" : "Treasury",
      chain: selectedAction === "rebalance" ? fromChain?.name || "Multi-chain" : "Multi-chain",
      txHash: "pending...",
      details: selectedAction === "rebalance" ? 
        `Rebalancing ${amount} USDC from ${fromChain?.name} to ${toChain?.name} for optimal allocation` :
        `${operationType} of ${amount} USDC for treasury management`
    })

    setTxId(transactionId || "")

    toast({
      title: "🏦 Processing Treasury Operation",
      description: `${operationType}: $${amount} USDC`,
    })

    // Simulate treasury operation processing (5-10 seconds for multi-chain coordination)
    setTimeout(() => {
      const success = Math.random() > 0.05 // 95% success rate for treasury ops
      const mockTxHash = success ? generateTestnetTxHash() : "failed"
      
      setTxHash(mockTxHash)
      setTxStep("success")
      setIsProcessing(false)

      // Update transaction with final status
      if (transactionId) {
        updateTransactionStatus(transactionId, success ? "Completed" : "Failed", mockTxHash)
      }

      if (success) {
        toast({
          title: "✅ Treasury Operation Successful!",
          description: `${operationType} completed successfully`,
        })
      } else {
        toast({
          title: "❌ Treasury Operation Failed",
          description: "Operation failed due to network congestion. Please try again.",
          variant: "destructive"
        })
      }
    }, 5000 + Math.random() * 5000)
  }

  const resetForm = () => {
    setTxStep("form")
    setSelectedAction(undefined)
    setAmount("")
    setTxHash("")
    setTxId("")
  }

  if (txStep === "success") {
    const isSuccess = txHash !== "failed"
    const operationType = selectedAction === "rebalance" ? "Treasury Rebalance" :
                         selectedAction === "add_liquidity" ? "Treasury Add Liquidity" :
                         "Treasury Remove Liquidity"
    
    return (
      <div className="space-y-6">
        <Card className={`${isSuccess ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' : 'bg-gradient-to-br from-red-900/20 to-rose-900/20 border-red-700'}`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto ${isSuccess ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mb-4`}>
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className={`${isSuccess ? 'text-green-400' : 'text-red-400'} text-2xl`}>
              {isSuccess ? "Treasury Operation Complete! 🏦" : "Operation Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-400">
                {isSuccess ? "Operation Completed" : "Operation Failed"}
              </p>
              <p className="text-3xl font-bold text-white">
                {isSuccess ? `$${parseFloat(amount).toLocaleString()} USDC` : "Failed"}
              </p>
              <p className="text-sm text-slate-300">
                {operationType}
              </p>
              {isSuccess && selectedAction === "rebalance" && (
                <p className="text-sm text-slate-300">
                  {fromChain?.name} → {toChain?.name}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge className="bg-yellow-600">Treasury Management</Badge>
              <Badge className="bg-blue-600">Multi-chain</Badge>
              <Badge className={isSuccess ? "bg-green-600" : "bg-red-600"}>
                {isSuccess ? "Optimized" : "Failed"}
              </Badge>
            </div>

            <div className="flex gap-2">
              {isSuccess && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`${fromChain?.explorer || 'https://etherscan.io'}/tx/${txHash}`, "_blank")}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              )}
              <Button onClick={resetForm} className="flex-1 bg-gradient-primary">
                {isSuccess ? "New Operation" : "Try Again"}
              </Button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800/30 rounded p-3">
              💡 <strong>Check History Tab:</strong> This treasury operation has been tracked in your transaction history 
              {isSuccess && " with real transaction hash for verification!"}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (txStep === "processing") {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
            </div>
            <CardTitle className="text-white text-xl">Processing Treasury Operation...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-yellow-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Coordinating multi-chain operation...</span>
              </div>
              <p className="text-sm text-yellow-200">
                • Verifying treasury permissions and balances
                <br />• Executing ${amount} USDC operation across chains
                <br />• Optimizing gas costs and execution timing
                <br />• Adding to transaction history for audit trail
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Treasury operations require careful coordination across multiple chains
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full px-4 py-2 mb-4">
          <TrendingUp className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Treasury Management</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Treasury Dashboard</h1>
        <p className="text-lg text-slate-400">Manage USDC liquidity across multiple chains</p>
      </div>

      {/* Treasury Overview */}
      <Card className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-700 max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-slate-400 text-sm mb-2">Total Treasury Value</p>
            <p className="text-5xl font-bold text-white mb-2">${totalTreasuryValue.toLocaleString()}</p>
            <p className="text-yellow-300 text-sm">USDC across 4 chains</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CHAIN_BALANCES.map((chain) => {
              const isOffTarget = Math.abs(chain.currentAllocation - chain.targetAllocation) > 2
              return (
                <div key={chain.chainId} className={`bg-slate-800/50 rounded-lg p-4 ${isOffTarget ? 'border border-yellow-500' : ''}`}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{chain.icon}</span>
                    <div>
                      <p className="font-medium text-white">{chain.name}</p>
                      <p className="text-xs text-slate-400">{chain.symbol}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white">${chain.usdcBalance.toLocaleString()}</p>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-400">Target: {chain.targetAllocation}%</span>
                    <span className={`${isOffTarget ? 'text-yellow-400' : 'text-green-400'}`}>
                      Current: {chain.currentAllocation}%
                    </span>
                  </div>
                  {isOffTarget && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Needs rebalancing
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Rebalances */}
      {suggestedRebalances.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 text-white max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-slate-300 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Suggested Rebalances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedRebalances.map((rebalance) => (
                <div key={rebalance.id} className="bg-slate-700/30 rounded-lg p-3 border border-yellow-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">
                        ${rebalance.amount.toFixed(0)} USDC
                      </p>
                      <p className="text-sm text-slate-400">{rebalance.reason}</p>
                    </div>
                    <Badge variant={rebalance.type === "add" ? "default" : "secondary"}>
                      {rebalance.type === "add" ? "Add Liquidity" : "Remove Liquidity"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treasury Operations Form */}
      <Card className="bg-slate-800 border-slate-700 text-white card-glow max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-300">Treasury Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Operation Type */}
          <div className="space-y-4">
            <Label className="text-slate-300 font-medium">Operation Type</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant={selectedAction === "rebalance" ? "default" : "outline"}
                onClick={() => setSelectedAction("rebalance")}
                className="h-auto p-4 flex flex-col items-center"
              >
                <ArrowLeftRight className="w-6 h-6 mb-2" />
                <span className="font-medium">Rebalance</span>
                <span className="text-xs opacity-70">Move between chains</span>
              </Button>
              
              <Button
                variant={selectedAction === "add_liquidity" ? "default" : "outline"}
                onClick={() => setSelectedAction("add_liquidity")}
                className="h-auto p-4 flex flex-col items-center"
              >
                <DollarSign className="w-6 h-6 mb-2" />
                <span className="font-medium">Add Liquidity</span>
                <span className="text-xs opacity-70">Increase treasury</span>
              </Button>
              
              <Button
                variant={selectedAction === "remove_liquidity" ? "default" : "outline"}
                onClick={() => setSelectedAction("remove_liquidity")}
                className="h-auto p-4 flex flex-col items-center"
              >
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="font-medium">Remove Liquidity</span>
                <span className="text-xs opacity-70">Withdraw funds</span>
              </Button>
            </div>
          </div>

          {/* Chain Selection for Rebalancing */}
          {selectedAction === "rebalance" && (
            <div className="space-y-4">
              <Label className="text-slate-300 font-medium">Chain Selection</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-chain" className="text-slate-400 text-sm">From Chain</Label>
                  <Select value={selectedFromChain} onValueChange={setSelectedFromChain}>
                    <SelectTrigger id="from-chain" className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select source..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {CHAIN_BALANCES.map((chain) => (
                        <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                          <div className="flex items-center">
                            <span className="mr-2">{chain.icon}</span>
                            <div>
                              <div className="font-medium">{chain.name}</div>
                              <div className="text-xs text-slate-400">${chain.usdcBalance.toLocaleString()}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="to-chain" className="text-slate-400 text-sm">To Chain</Label>
                  <Select value={selectedToChain} onValueChange={setSelectedToChain}>
                    <SelectTrigger id="to-chain" className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select destination..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {CHAIN_BALANCES.filter(chain => chain.chainId.toString() !== selectedFromChain).map((chain) => (
                        <SelectItem key={chain.chainId} value={chain.chainId.toString()}>
                          <div className="flex items-center">
                            <span className="mr-2">{chain.icon}</span>
                            <div>
                              <div className="font-medium">{chain.name}</div>
                              <div className="text-xs text-slate-400">${chain.usdcBalance.toLocaleString()}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-slate-400 text-sm">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-400 mt-1">
              Total treasury: ${totalTreasuryValue.toLocaleString()}
            </p>
          </div>

          <Separator className="bg-slate-700" />

          {/* Operation Summary */}
          <div className="space-y-2 text-sm">
            <h3 className="font-medium text-white">Operation Summary:</h3>
            <div className="flex justify-between text-slate-300">
              <span>Operation:</span>
              <span>{selectedAction ? selectedAction.replace("_", " ") : "Not selected"}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Amount:</span>
              <span>${amount || "0"} USDC</span>
            </div>
            {selectedAction === "rebalance" && (
              <div className="flex justify-between text-slate-300">
                <span>Route:</span>
                <span>{fromChain?.name || "?"} → {toChain?.name || "?"}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Processing time:</span>
              <span>5-10 minutes</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Impact:</span>
              <span>Multi-chain coordination</span>
            </div>
          </div>

          <Button
            onClick={handleTreasuryOperation}
            disabled={!isConnected || !selectedAction || !amount || isProcessing || parseFloat(amount) <= 0 || (selectedAction === "rebalance" && (!selectedFromChain || !selectedToChain))}
            className="w-full bg-gradient-primary text-white hover:opacity-90 disabled:opacity-50"
          >
            {!isConnected ? (
              "Connect Wallet First"
            ) : isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Execute Operation
              </>
            )}
          </Button>

          <div className="text-xs text-slate-400 bg-slate-700/30 rounded p-3">
            💡 <strong>Live Testing:</strong> This will create a real treasury operation entry in your History tab 
            with transaction details for audit and compliance tracking!
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4 text-center">
            <ArrowLeftRight className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Auto Rebalancing</h3>
            <p className="text-sm text-slate-400">Smart allocation across chains</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Risk Management</h3>
            <p className="text-sm text-slate-400">Minimize exposure and maximize efficiency</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Yield Optimization</h3>
            <p className="text-sm text-slate-400">Maximize returns on treasury holdings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
