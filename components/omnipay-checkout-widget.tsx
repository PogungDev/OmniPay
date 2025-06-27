"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Wallet, Shield, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface OmniPayCheckoutWidgetProps {
  merchant?: string
  amount?: string
  toChain?: string
  integrator?: string
  className?: string
}

export function OmniPayCheckoutWidget({
  merchant = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
  amount = "25",
  toChain = "arbitrum",
  integrator = "OmniPay",
  className = "",
}: OmniPayCheckoutWidgetProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"select" | "confirm" | "success">("select")

  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentStep("confirm")

    // Simulate MetaMask popup
    setTimeout(() => {
      setPaymentStep("success")
      setIsProcessing(false)
      toast({
        title: "✅ Payment Successful!",
        description: `${amount} USDC sent to merchant on ${toChain}`,
      })
    }, 2000)
  }

  if (paymentStep === "success") {
    return (
      <Card
        className={`w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 ${className}`}
      >
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-white/80 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">Amount Sent</p>
            <p className="text-2xl font-bold text-green-700">{amount} USDC</p>
            <p className="text-sm text-gray-500">
              to {merchant.slice(0, 6)}...{merchant.slice(-4)}
            </p>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {toChain.charAt(0).toUpperCase() + toChain.slice(1)}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPaymentStep("select")} className="w-full">
            Make Another Payment
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`w-full max-w-md mx-auto bg-white border-slate-200 shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">OmniPay Checkout</span>
          <Badge variant="secondary" className="text-xs">
            Powered by {integrator}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">Pay with any token, merchant receives USDC</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {paymentStep === "select" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input id="amount" value={amount} readOnly className="text-lg font-semibold" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant Address</Label>
              <Input id="merchant" value={merchant} readOnly className="font-mono text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chain">Receive on Chain</Label>
              <Select value={toChain} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <Zap className="w-4 h-4" />
                Smart Routing Active
              </div>
              <p className="text-xs text-blue-600">
                • Auto-detect your tokens across all chains
                <br />• Find best swap routes via <strong>LI.FI SDK</strong>
                <br />• Cross-chain USDC delivery via <strong>Circle CCTP</strong>
              </p>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Pay with MetaMask
            </Button>

            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                MetaMask SDK
              </div>
              <div className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                LI.FI SDK
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Circle CCTP
              </div>
            </div>
          </>
        )}

        {paymentStep === "confirm" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Confirm in MetaMask</h3>
              <p className="text-sm text-gray-600 mt-1">Please confirm the transaction in your MetaMask wallet</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                🔄 <strong>LI.FI</strong> is finding the best route...
                <br />🌉 <strong>Circle CCTP</strong> will bridge USDC to {toChain}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Export for SDK usage
export const createOmniPayCheckout = (config: OmniPayCheckoutWidgetProps) => {
  return <OmniPayCheckoutWidget {...config} />
}

// Widget configuration for embedding
export const OmniPaySDK = {
  createCheckout: createOmniPayCheckout,
  version: "1.0.0",
  integrations: ["MetaMask SDK", "LI.FI SDK", "Circle CCTP"],
}
