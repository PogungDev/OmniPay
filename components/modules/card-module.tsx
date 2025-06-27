"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/components/wallet-provider"
import { 
  CreditCard, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Settings, 
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  PlusCircle
} from "lucide-react"

interface CardProfile {
  owner: string
  creditLimit: number
  currentBalance: number
  availableCredit: number
  isActive: boolean
  cardId: string
}

interface CreditLine {
  collateralToken: string
  collateralAmount: number
  creditAmount: number
  interestRate: number
  isActive: boolean
}

interface AutoRepay {
  sourceToken: string
  sourceChain: number
  repayAmount: number
  frequency: number
  isActive: boolean
}

export default function CardModule() {
  const [cardProfile, setCardProfile] = useState<CardProfile | null>(null)
  const [creditLines, setCreditLines] = useState<CreditLine[]>([])
  const [autoRepaySettings, setAutoRepaySettings] = useState<AutoRepay | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "credit" | "settings">("overview")
  
  // Form states
  const [collateralToken, setCollateralToken] = useState("ETH")
  const [collateralAmount, setCollateralAmount] = useState("")
  const [autoRepayEnabled, setAutoRepayEnabled] = useState(false)
  const [repayFrequency, setRepayFrequency] = useState("weekly")

  const { walletState, metaMaskSDK, circleWallets } = useWallet()
  const { toast } = useToast()

  // Mock data for demo
  useEffect(() => {
    if (walletState.isConnected) {
      setCardProfile({
        owner: walletState.address || "",
        creditLimit: 5000,
        currentBalance: 1250,
        availableCredit: 3750,
        isActive: true,
        cardId: "OMNIPAY-" + walletState.address?.slice(-6).toUpperCase()
      })

      setCreditLines([
        {
          collateralToken: "ETH",
          collateralAmount: 2.5,
          creditAmount: 3500,
          interestRate: 850, // 8.5% APR
          isActive: true
        },
        {
          collateralToken: "MATIC",
          collateralAmount: 2000,
          creditAmount: 1500,
          interestRate: 1200, // 12% APR  
          isActive: true
        }
      ])

      setAutoRepaySettings({
        sourceToken: "USDC",
        sourceChain: 137, // Polygon
        repayAmount: 500,
        frequency: 604800, // 1 week in seconds
        isActive: true
      })
    }
  }, [walletState])

  const handleCreateCard = async () => {
    setLoading(true)
    try {
      const cardId = `OMNIPAY-${Date.now()}`
      
      // In real implementation, call smart contract
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate transaction
      
      setCardProfile({
        owner: walletState.address || "",
        creditLimit: 0,
        currentBalance: 0,
        availableCredit: 0,
        isActive: true,
        cardId
      })

      toast({
        title: "✅ MetaMask Card Created!",
        description: `Card ID: ${cardId}`,
      })
    } catch (error) {
      toast({
        title: "❌ Card Creation Failed",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddCreditLine = async () => {
    if (!collateralAmount || !collateralToken) {
      toast({
        title: "❌ Invalid Input",
        description: "Please enter collateral amount and select token",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Calculate credit amount (70% LTV)
      const tokenPrices: Record<string, number> = {
        "ETH": 2000,
        "MATIC": 0.75,
        "USDC": 1,
        "BTC": 25000
      }
      
      const collateralValue = parseFloat(collateralAmount) * tokenPrices[collateralToken]
      const creditAmount = collateralValue * 0.7 // 70% LTV

      if (walletState.isDemo) {
        // Demo mode - simulate contract interaction
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        // Real contract interaction
        try {
          let txHash: string;
          
          if (walletState.provider === 'metamask') {
            txHash = await metaMaskSDK.sendTransaction({
              to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7", // OmniPayCard contract
              value: "0", // No ETH needed for contract call
              data: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock contract call data
            })
          } else if (walletState.provider === 'circle') {
            const wallets = await circleWallets.getUserWallets()
            if (wallets.length > 0) {
              const transaction = await circleWallets.transferTokens({
                walletId: wallets[0].id,
                destinationAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
                amount: "0", // Contract interaction
              })
              txHash = transaction.txHash || transaction.id
            } else {
              throw new Error('No Circle wallet found')
            }
          } else {
            throw new Error('Unsupported wallet provider')
          }
          
          console.log('✅ Contract interaction successful:', txHash)
          
          toast({
            title: "🔗 Transaction Submitted",
            description: `View on explorer: ${txHash.slice(0, 10)}... via ${walletState.provider}`,
          })
          
          // Wait for confirmation (simplified)
          await new Promise(resolve => setTimeout(resolve, 3000))
        } catch (error) {
          console.error('Contract interaction failed:', error)
          throw new Error('Failed to interact with MetaMask Card contract')
        }
      }

      const newCreditLine: CreditLine = {
        collateralToken,
        collateralAmount: parseFloat(collateralAmount),
        creditAmount,
        interestRate: collateralToken === "ETH" ? 850 : 1200,
        isActive: true
      }

      setCreditLines([...creditLines, newCreditLine])
      
      // Update card profile
      if (cardProfile) {
        setCardProfile({
          ...cardProfile,
          creditLimit: cardProfile.creditLimit + creditAmount,
          availableCredit: cardProfile.availableCredit + creditAmount
        })
      }

      setCollateralAmount("")
      
      toast({
        title: "✅ Credit Line Added!",
        description: `$${creditAmount.toFixed(2)} USDC credit unlocked via ${walletState.isDemo ? 'Demo' : 'MetaMask Card Contract'}`,
      })
    } catch (error) {
      toast({
        title: "❌ Failed to Add Credit Line",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAutoRepay = async () => {
    setLoading(true)
    try {
      if (walletState.isDemo) {
        // Demo mode - simulate contract interaction
        await new Promise(resolve => setTimeout(resolve, 1500))
      } else {
        // Real contract interaction for auto-repay settings
        try {
          const txHash = await metaMaskSDK.sendTransaction({
            to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7", // OmniPayCard contract
            value: "0",
            data: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock setAutoRepay(bool) call
          })
          
          console.log('✅ Auto-repay settings updated:', txHash)
          
          toast({
            title: "🔗 Transaction Submitted",
            description: `Auto-repay settings transaction: ${txHash.slice(0, 10)}...`,
          })
          
          // Wait for confirmation
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error) {
          console.error('Auto-repay contract interaction failed:', error)
          throw new Error('Failed to update auto-repay settings')
        }
      }
      
      setAutoRepayEnabled(!autoRepayEnabled)
      
      if (autoRepaySettings) {
        setAutoRepaySettings({
          ...autoRepaySettings,
          isActive: !autoRepayEnabled
        })
      }

      toast({
        title: autoRepayEnabled ? "🔴 Auto-Repay Disabled" : "✅ Auto-Repay Enabled",
        description: autoRepayEnabled 
          ? "Manual repayment required" 
          : `Automatic repayment every ${repayFrequency} via ${walletState.isDemo ? 'Demo' : 'Smart Contract'}`,
      })
    } catch (error) {
      toast({
        title: "❌ Failed to Update Settings",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const cardUtilization = cardProfile 
    ? (cardProfile.currentBalance / cardProfile.creditLimit) * 100 
    : 0

  if (!walletState.isConnected) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400">Connect your wallet to access MetaMask Card features</p>
        </div>
      </div>
    )
  }

  if (!cardProfile?.isActive) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-20 h-20 mx-auto mb-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Create Your MetaMask Card</h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Get instant USDC credit backed by your cross-chain crypto assets. 
              Spend anywhere MetaMask Card is accepted.
            </p>
            <Button 
              onClick={handleCreateCard}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
              size="lg"
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Creating Card...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create MetaMask Card
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Card Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-primary rounded-full px-4 py-2 mb-4">
          <CreditCard className="w-5 h-5 text-white" />
          <span className="text-white font-medium">MetaMask Card Dashboard</span>
        </div>
        <h2 className="text-3xl font-bold text-gradient-primary mb-2">Cross-Chain Credit Card</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Your crypto assets working as collateral for instant USDC spending power
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-800/50 rounded-lg p-1 inline-flex">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "credit", label: "Credit Lines", icon: Coins },
            { id: "settings", label: "Auto-Pay", icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "ghost"}
              className={`px-6 py-2 ${
                activeTab === id 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(id as any)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Virtual Card Display */}
          <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <Badge className="bg-green-600 mb-2">ACTIVE</Badge>
                  <h3 className="text-xl font-bold text-white">MetaMask Card</h3>
                  <p className="text-gray-400 text-sm">{cardProfile.cardId}</p>
                </div>
                <CreditCard className="w-12 h-12 text-blue-400" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Available Credit</span>
                    <span className="text-green-400">${cardProfile.availableCredit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Credit Limit</span>
                    <span className="text-white">${cardProfile.creditLimit.toLocaleString()}</span>
                  </div>
                  <Progress value={100 - cardUtilization} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{cardUtilization.toFixed(1)}% utilized</p>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Balance</span>
                    <span className="text-orange-400">${cardProfile.currentBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Collateral</p>
                    <p className="text-xl font-bold text-white">
                      ${creditLines.reduce((sum, line) => sum + (line.creditAmount / 0.7), 0).toLocaleString()}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Credit Lines</p>
                    <p className="text-xl font-bold text-white">{creditLines.filter(line => line.isActive).length}</p>
                  </div>
                  <Coins className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Auto-Repay Status</p>
                    <p className="text-xl font-bold text-white flex items-center">
                      {autoRepaySettings?.isActive ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-400 mr-2" />
                          Inactive
                        </>
                      )}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Credit Lines Tab */}
      {activeTab === "credit" && (
        <div className="space-y-6">
          {/* Add New Credit Line */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PlusCircle className="w-5 h-5 mr-2 text-green-400" />
                Add Credit Line
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Collateral Token</Label>
                  <Select value={collateralToken} onValueChange={setCollateralToken}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH - $2,000</SelectItem>
                      <SelectItem value="MATIC">MATIC - $0.75</SelectItem>
                      <SelectItem value="BTC">BTC - $25,000</SelectItem>
                      <SelectItem value="USDC">USDC - $1.00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={collateralAmount}
                    onChange={(e) => setCollateralAmount(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleAddCreditLine}
                    disabled={loading || !collateralAmount}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Processing..." : "Add Credit Line"}
                  </Button>
                </div>
              </div>

              {collateralAmount && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    💡 You'll receive ~${((parseFloat(collateralAmount) || 0) * 
                    (collateralToken === "ETH" ? 2000 : collateralToken === "MATIC" ? 0.75 : collateralToken === "BTC" ? 25000 : 1) * 0.7).toLocaleString()} USDC credit (70% LTV)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Credit Lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditLines.map((line, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{line.collateralToken} Collateral</h4>
                      <p className="text-sm text-gray-400">{line.collateralAmount} {line.collateralToken}</p>
                    </div>
                    <Badge className={line.isActive ? "bg-green-600" : "bg-red-600"}>
                      {line.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Credit Amount</span>
                      <span className="text-white">${line.creditAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Interest Rate</span>
                      <span className="text-yellow-400">{(line.interestRate / 100).toFixed(1)}% APR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">LTV Ratio</span>
                      <span className="text-blue-400">70%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Repay Settings Tab */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Auto-Repay Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Enable Auto-Repay</h4>
                  <p className="text-sm text-gray-400">Automatically repay your card balance using cross-chain assets</p>
                </div>
                <Switch 
                  checked={autoRepayEnabled}
                  onCheckedChange={handleToggleAutoRepay}
                  disabled={loading}
                />
              </div>

              {autoRepayEnabled && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Repay Frequency</Label>
                    <Select value={repayFrequency} onValueChange={setRepayFrequency}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {autoRepaySettings && (
                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h5 className="font-medium text-green-400 mb-2">Current Auto-Repay Setup</h5>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-300">Source: {autoRepaySettings.sourceToken} (Chain {autoRepaySettings.sourceChain})</p>
                        <p className="text-gray-300">Amount: ${autoRepaySettings.repayAmount}</p>
                        <p className="text-gray-300">Frequency: {repayFrequency}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 