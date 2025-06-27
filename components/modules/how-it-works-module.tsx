"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Send,
  History,
  Users,
  CreditCard,
  Zap,
  PieChart,
  Wallet,
  Globe,
  Shield,
  Clock,
  DollarSign,
  Target,
  Sparkles,
  CheckCircle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react"

interface HowItWorksModuleProps {
  onTabChange: (tab: string) => void
}

export default function HowItWorksModule({ onTabChange }: HowItWorksModuleProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-medium mb-4">
          🏆 MetaMask Hackathon Project
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">How OmniPay Works</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          The complete guide to cross-chain payments for MetaMask users. Send any token from any chain → recipient gets
          USDC instantly.
        </p>
      </div>

      {/* Problem & Solution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-red-900/20 border-red-700">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              The Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-200 space-y-3">
            <p>
              ❌ <strong>Complex Multi-Chain UX:</strong> Users struggle with different chains, bridges, and tokens
            </p>
            <p>
              ❌ <strong>Merchant Friction:</strong> Businesses can't easily accept crypto payments
            </p>
            <p>
              ❌ <strong>Fragmented Liquidity:</strong> Assets scattered across multiple chains
            </p>
            <p>
              ❌ <strong>Technical Barriers:</strong> Regular users intimidated by DeFi complexity
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-900/20 border-green-700">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              OmniPay Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-200 space-y-3">
            <p>
              ✅ <strong>One-Click Payments:</strong> Send any token, recipient gets USDC
            </p>
            <p>
              ✅ <strong>Stripe-like Checkout:</strong> Embed payments in any website
            </p>
            <p>
              ✅ <strong>Unified Liquidity:</strong> Smart treasury management across chains
            </p>
            <p>
              ✅ <strong>MetaMask Native:</strong> Built specifically for MetaMask users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Journey Flow */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">🚀 Complete User Journey for MetaMask Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Step 1: Send */}
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  1
                </div>
                <Send className="w-5 h-5 text-green-400 mr-2" />
                <h3 className="text-green-400 font-semibold">SEND</h3>
              </div>
              <p className="text-green-200 text-sm mb-3">
                <strong>Entry Point:</strong> Connect MetaMask, send any token from any chain. LI.FI finds best route,
                Circle CCTP bridges USDC.
              </p>
              <Button
                size="sm"
                onClick={() => onTabChange("send")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Try Send <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Step 2: History */}
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  2
                </div>
                <History className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-blue-400 font-semibold">HISTORY</h3>
              </div>
              <p className="text-blue-200 text-sm mb-3">
                <strong>Tracking:</strong> All cross-chain transactions logged. Export for taxes, view on explorers,
                track payment status.
              </p>
              <Button
                size="sm"
                onClick={() => onTabChange("history")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View History <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Step 3: Remittance */}
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  3
                </div>
                <Users className="w-5 h-5 text-purple-400 mr-2" />
                <h3 className="text-purple-400 font-semibold">REMITTANCE</h3>
              </div>
              <p className="text-purple-200 text-sm mb-3">
                <strong>Family & Friends:</strong> Preset addresses for recurring payments. Perfect for sending money
                home globally.
              </p>
              <Button
                size="sm"
                onClick={() => onTabChange("remittance")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Send to Family <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Step 4: Payouts */}
            <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  4
                </div>
                <CreditCard className="w-5 h-5 text-orange-400 mr-2" />
                <h3 className="text-orange-400 font-semibold">PAYOUTS</h3>
              </div>
              <p className="text-orange-200 text-sm mb-3">
                <strong>Business Receiving:</strong> Merchants receive payments, withdraw to bank accounts or crypto
                wallets.
              </p>
              <Button
                size="sm"
                onClick={() => onTabChange("payouts")}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Merchant Tools <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Step 5: Treasury */}
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  5
                </div>
                <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                <h3 className="text-yellow-400 font-semibold">TREASURY</h3>
              </div>
              <p className="text-yellow-200 text-sm mb-3">
                <strong>Liquidity Management:</strong> Backend system maintains USDC pools across chains for instant
                settlements.
              </p>
              <Button
                size="sm"
                onClick={() => onTabChange("treasury")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Manage Liquidity <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Step 6: Portfolio */}
            <div className="bg-pink-900/20 rounded-lg p-4 border border-pink-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  6
                </div>
                <PieChart className="w-5 h-5 text-pink-400 mr-2" />
                <h3 className="text-pink-400 font-semibold">PORTFOLIO</h3>
              </div>
              <p className="text-pink-200 text-sm mb-3">
                <strong>Unified View:</strong> Aggregate all assets across chains. MetaMask shows individual chains,
                this shows everything.
              </p>
              <Button
                size="sm"
                onClick={() => onTabChange("portfolio")}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                View Portfolio <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">🏗️ Technical Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-orange-500 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-orange-400 font-semibold mb-2">MetaMask SDK</h3>
              <p className="text-slate-300 text-sm">
                Native wallet integration for seamless user experience. Handle transactions, signatures, and chain
                switching.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-500 rounded-full flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-purple-400 font-semibold mb-2">LI.FI SDK</h3>
              <p className="text-slate-300 text-sm">
                Cross-chain routing and bridging. Finds optimal paths for any token to any chain with best rates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-blue-400 font-semibold mb-2">Circle CCTP</h3>
              <p className="text-slate-300 text-sm">
                Native USDC bridging for instant, low-cost transfers between supported chains with guaranteed liquidity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">🎯 Real-World Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-green-400 font-semibold text-lg flex items-center">
                <ArrowUpRight className="w-5 h-5 mr-2" />
                For Individual Users
              </h3>
              <div className="space-y-3 text-slate-300">
                <p>
                  💸 <strong>Global Remittances:</strong> Send money to family overseas instantly
                </p>
                <p>
                  🛒 <strong>E-commerce Payments:</strong> Pay for goods/services with any crypto
                </p>
                <p>
                  💰 <strong>DeFi Simplified:</strong> Move assets between chains without complexity
                </p>
                <p>
                  📱 <strong>Mobile Payments:</strong> QR code payments for in-person transactions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-blue-400 font-semibold text-lg flex items-center">
                <ArrowDownRight className="w-5 h-5 mr-2" />
                For Businesses
              </h3>
              <div className="space-y-3 text-slate-300">
                <p>
                  🏪 <strong>Merchant Checkout:</strong> Accept crypto payments like Stripe
                </p>
                <p>
                  💼 <strong>B2B Payments:</strong> Pay suppliers/contractors globally
                </p>
                <p>
                  🎮 <strong>Gaming/NFTs:</strong> In-game purchases and marketplace transactions
                </p>
                <p>
                  📊 <strong>SaaS Subscriptions:</strong> Recurring crypto payments for services
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl text-center">✨ Why OmniPay for MetaMask Users?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-green-400 mb-3" />
              <h4 className="text-green-400 font-semibold mb-2">Secure</h4>
              <p className="text-slate-300 text-sm">
                Non-custodial, your keys your crypto. Built on battle-tested protocols.
              </p>
            </div>

            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto text-blue-400 mb-3" />
              <h4 className="text-blue-400 font-semibold mb-2">Fast</h4>
              <p className="text-slate-300 text-sm">
                Seconds to minutes for cross-chain transfers. No more waiting hours.
              </p>
            </div>

            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
              <h4 className="text-yellow-400 font-semibold mb-2">Cheap</h4>
              <p className="text-slate-300 text-sm">
                Optimal routing finds lowest fees. Often cheaper than traditional methods.
              </p>
            </div>

            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto text-purple-400 mb-3" />
              <h4 className="text-purple-400 font-semibold mb-2">Simple</h4>
              <p className="text-slate-300 text-sm">
                One-click payments. No need to understand bridges, swaps, or chains.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700">
          <CardContent className="py-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Try OmniPay?</h2>
            <p className="text-slate-300 mb-6 text-lg">
              Experience the future of cross-chain payments built specifically for MetaMask users.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                onClick={() => onTabChange("send")}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3"
              >
                <Send className="w-5 h-5 mr-2" />
                Start Sending
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onTabChange("home")}
                className="border-slate-600 text-slate-300 px-8 py-3"
              >
                View Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
