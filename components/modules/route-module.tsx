"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

interface RouteModuleProps {
  transactionData: any
  onTransactionUpdate: (data: any) => void
  onNavigate: (tab: string) => void
}

export default function RouteModule({ transactionData, onTransactionUpdate, onNavigate }: RouteModuleProps) {
  const { amount, token, recipient, usdcEquivalent } = transactionData

  const routes = [
    {
      name: "LI.FI Optimized",
      time: "2 min",
      fee: "$0.85",
      recommended: true,
      description: "Best overall route with optimal gas and speed",
      gradient: "from-vibrant-green to-vibrant-teal",
    },
    {
      name: "Direct Bridge",
      time: "5 min",
      fee: "$1.20",
      recommended: false,
      description: "Direct cross-chain bridge, higher fee",
      gradient: "from-vibrant-purple to-vibrant-pink",
    },
    {
      name: "Multi-hop Route",
      time: "8 min",
      fee: "$0.65",
      recommended: false,
      description: "Cheapest option, longer processing time",
      gradient: "from-vibrant-coral to-vibrant-orange",
    },
  ]

  const handleExecutePayment = () => {
    onNavigate("remittance")
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-secondary rounded-full px-4 py-2 mb-4">
          <Zap className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Step 2: Route Optimization</span>
        </div>
        <h2 className="text-3xl font-bold text-gradient-secondary mb-2">Optimal Route & Swap</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          OmniPay finds the fastest and cheapest path for your cross-chain payment.
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-vibrant-purple/30 card-glow-vibrant">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-lg">Payment Summary</h3>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">
                  {amount || "0.0"} {token}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <span className="text-2xl font-bold text-vibrant-green">
                  {usdcEquivalent?.toFixed(2) || "0.00"} USDC
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                To: {recipient ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : "recipient address"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gradient-success">${usdcEquivalent?.toFixed(2) || "0.00"}</div>
              <div className="text-sm text-vibrant-green">USDC Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Routes */}
      <Card className="bg-gray-800/50 border-gray-700/50 card-glow">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-vibrant-yellow" />
            <span>Available Routes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routes.map((route, index) => (
              <div
                key={index}
                className={`
                  p-6 rounded-xl border transition-all duration-300 hover:shadow-lg
                  ${
                    route.recommended
                      ? "border-vibrant-green/50 bg-gradient-to-r from-vibrant-green/10 to-vibrant-teal/10"
                      : "border-gray-600/50 bg-gray-700/30 hover:border-gray-500/50"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-r ${route.gradient} flex items-center justify-center`}
                    >
                      {route.recommended ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Clock className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white font-semibold text-lg">{route.name}</span>
                        {route.recommended && <Badge className="bg-vibrant-green text-white">Recommended</Badge>}
                      </div>
                      <div className="text-sm text-gray-400 mb-1">
                        {route.time} • {route.fee} fee
                      </div>
                      <div className="text-xs text-gray-500">{route.description}</div>
                    </div>
                  </div>
                  <Button
                    variant={route.recommended ? "default" : "outline"}
                    className={
                      route.recommended
                        ? "bg-gradient-success hover:shadow-lg"
                        : "border-gray-600 hover:border-gray-500"
                    }
                  >
                    Select Route
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <span className="text-gray-300 text-sm">
          Powered by LI.FI cross-chain infrastructure for seamless swaps & bridges with optimal routing.
        </span>
      </div>

      {/* Execute Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleExecutePayment}
          disabled={!amount || !recipient}
          className={`
            px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300
            ${
              amount && recipient
                ? "bg-gradient-secondary hover:shadow-lg transform hover:scale-105 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }
          `}
          size="lg"
        >
          <Zap className="w-5 h-5 mr-2" />
          Execute Payment
        </Button>
      </div>
    </div>
  )
}
