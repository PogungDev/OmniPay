"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, DollarSign, Sparkles, Users, Building, Heart, Calculator, Zap } from "lucide-react"

interface CheckoutModuleProps {
  transactionData: any
  onTransactionUpdate: (data: any) => void
  onNavigate: (tab: string) => void
}

export default function CheckoutModule({ transactionData, onTransactionUpdate, onNavigate }: CheckoutModuleProps) {
  const [amount, setAmount] = useState(transactionData.amount || "")
  const [token, setToken] = useState(transactionData.token || "ETH")
  const [recipient, setRecipient] = useState(transactionData.recipient || "")
  const [targetChain, setTargetChain] = useState("arbitrum")
  const [isCalculating, setIsCalculating] = useState(false)
  const [exchangeRates] = useState({
    ETH: 2000,
    MATIC: 0.75,
    BTC: 25000,
    USDT: 1,
  })
  const { toast } = useToast()

  // Real-time calculation
  useEffect(() => {
    if (amount && token) {
      setIsCalculating(true)
      const timer = setTimeout(() => {
        const rate = exchangeRates[token as keyof typeof exchangeRates] || 1
        const usdcEquivalent = Number.parseFloat(amount) * rate
        onTransactionUpdate({
          amount,
          token,
          recipient,
          targetChain,
          usdcEquivalent,
          estimatedFee: usdcEquivalent * 0.005, // 0.5% fee
          processingTime: token === "ETH" ? "2-3 min" : token === "MATIC" ? "1-2 min" : "5-8 min",
        })
        setIsCalculating(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [amount, token, recipient, targetChain])

  const handleAmountChange = (value: string) => {
    setAmount(value)
    if (value && !isNaN(Number(value))) {
      toast({
        title: "Amount Updated",
        description: `${value} ${token} will be converted to USDC`,
        duration: 2000,
      })
    }
  }

  const handleTokenChange = (value: string) => {
    setToken(value)
    toast({
      title: "Token Selected",
      description: `Using ${value} for payment`,
      duration: 2000,
    })
  }

  const handleRecipientChange = (value: string) => {
    setRecipient(value)
    if (value.length > 10) {
      toast({
        title: "Recipient Set",
        description: "Address validated successfully",
        duration: 2000,
      })
    }
  }

  const handleProceed = () => {
    if (amount && recipient) {
      toast({
        title: "Payment Initiated! 🚀",
        description: "Proceeding to route optimization...",
        duration: 3000,
      })
      setTimeout(() => onNavigate("route"), 1000)
    }
  }

  const useCases = [
    {
      title: "Freelance Payment",
      desc: "Pay contractors globally",
      icon: Users,
      example: "Send ETH → Receive USDC",
      gradient: "from-vibrant-purple to-vibrant-pink",
      amount: "0.5",
      token: "ETH",
      recipient: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    },
    {
      title: "Family Remittance",
      desc: "Send money to family abroad",
      icon: Heart,
      example: "Send MATIC → Receive USDC",
      gradient: "from-vibrant-green to-vibrant-teal",
      amount: "1000",
      token: "MATIC",
      recipient: "0x853d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    },
    {
      title: "Business Payment",
      desc: "Pay suppliers or partners",
      icon: Building,
      example: "Send BTC → Receive USDC",
      gradient: "from-vibrant-coral to-vibrant-orange",
      amount: "0.025",
      token: "BTC",
      recipient: "0x964d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    },
  ]

  const usdcEquivalent =
    amount && token ? Number.parseFloat(amount) * exchangeRates[token as keyof typeof exchangeRates] : 0
  const estimatedFee = usdcEquivalent * 0.005

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-primary rounded-full px-4 py-2 mb-4">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Step 1: Payment Setup</span>
        </div>
        <h2 className="text-3xl font-bold text-gradient-primary mb-2">Start a Universal Payment</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Initiate a payment to anyone, anywhere, with any token. OmniPay handles the complexity.
        </p>
      </div>

      {/* Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card className="bg-gray-800/50 border-gray-700/50 card-glow">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-vibrant-orange" />
              <span>Payment Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">Amount to Pay</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-500 h-12 text-lg pr-16"
                />
                {isCalculating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Calculator className="w-4 h-4 text-vibrant-orange animate-pulse" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">Your Token</Label>
              <Select value={token} onValueChange={handleTokenChange}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">ETH (Ethereum) - $2,000</SelectItem>
                  <SelectItem value="MATIC">MATIC (Polygon) - $0.75</SelectItem>
                  <SelectItem value="BTC">BTC (Bitcoin) - $25,000</SelectItem>
                  <SelectItem value="USDT">USDT (Multi-chain) - $1.00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">Target Chain</Label>
              <Select value={targetChain} onValueChange={setTargetChain}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600/50 text-white h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum (Low fees)</SelectItem>
                  <SelectItem value="polygon">Polygon (Fastest)</SelectItem>
                  <SelectItem value="arbitrum">Arbitrum (Recommended)</SelectItem>
                  <SelectItem value="base">Base (Cheapest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 font-medium">Recipient Address</Label>
              <Input
                placeholder="0x... or ENS name"
                value={recipient}
                onChange={(e) => handleRecipientChange(e.target.value)}
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-500 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Preview */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-vibrant-green/30 card-glow-vibrant">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-vibrant-green" />
              <span>Live Payment Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gradient-success rounded-xl">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {isCalculating ? (
                    <div className="flex items-center space-x-2">
                      <span>Calculating...</span>
                      <Zap className="w-4 h-4 animate-pulse" />
                    </div>
                  ) : (
                    `${usdcEquivalent.toFixed(2)} USDC`
                  )}
                </div>
                <div className="text-sm text-white/80">Recipient will receive stable USDC</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-gray-300">Exchange Rate</span>
                <span className="text-white font-medium">
                  1 {token} = ${exchangeRates[token as keyof typeof exchangeRates]?.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-gray-300">Target Chain</span>
                <Badge className="bg-vibrant-purple text-white capitalize">{targetChain}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-gray-300">Estimated Fee</span>
                <span className="text-white font-medium">${estimatedFee.toFixed(2)} (0.5%)</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-gray-300">Processing Time</span>
                <span className="text-vibrant-green font-medium">{transactionData.processingTime || "2-3 min"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Use Cases */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Quick Start Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`
                    h-auto p-6 border-gray-600/50 hover:border-transparent
                    bg-gradient-to-br ${useCase.gradient} hover:shadow-lg
                    transition-all duration-300 transform hover:scale-105
                    text-left group
                  `}
                  onClick={() => {
                    setAmount(useCase.amount)
                    setToken(useCase.token)
                    setRecipient(useCase.recipient)
                    toast({
                      title: `${useCase.title} Template Applied! ✨`,
                      description: `Using ${useCase.amount} ${useCase.token} example`,
                      duration: 3000,
                    })
                  }}
                >
                  <div className="w-full">
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="w-6 h-6 text-white" />
                      <span className="font-semibold text-white">{useCase.title}</span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">{useCase.desc}</p>
                    <p className="text-xs text-white/60">{useCase.example}</p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Proceed Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleProceed}
          disabled={!amount || !recipient || isCalculating}
          className={`
            px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300
            ${
              amount && recipient && !isCalculating
                ? "bg-gradient-primary hover:shadow-lg transform hover:scale-105 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }
          `}
          size="lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          {isCalculating ? "Calculating..." : "Proceed to Route Optimization"}
        </Button>
      </div>
    </div>
  )
}
