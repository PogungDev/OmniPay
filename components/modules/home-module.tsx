"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  Send,
  History,
  DollarSign,
  Target,
  Zap,
  Info,
  Code,
  QrCode,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { OmniPayCheckoutWidget } from "@/components/omnipay-checkout-widget"
import { toast } from "@/hooks/use-toast"

interface HomeModuleProps {
  onTabChange: (tab: string) => void
}

export default function HomeModule({ onTabChange }: HomeModuleProps) {
  const [widgetConfig, setWidgetConfig] = useState({
    merchant: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
    amount: "25",
    toChain: "arbitrum",
  })

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const checkoutUrl = `https://omnipay.xyz/checkout?merchant=${widgetConfig.merchant}&amount=${widgetConfig.amount}&chain=${widgetConfig.toChain}`

  const embedCode = `import { OmniPayCheckoutWidget } from '@omnipay/sdk'

<OmniPayCheckoutWidget
  merchant="${widgetConfig.merchant}"
  amount="${widgetConfig.amount}"
  toChain="${widgetConfig.toChain}"
  integrator="YourApp"
/>`

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-medium">
            🏆 Built for MetaMask Hackathon
          </Badge>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          The Stripe Checkout for Web3
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
          Pay with any token on any chain — merchants receive USDC on their chosen chain. Powered by{" "}
          <strong>MetaMask SDK</strong>, <strong>LI.FI SDK</strong>, and <strong>Circle CCTP</strong>.
        </p>

        {/* Sponsor Badges */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-slate-300 text-sm font-medium">MetaMask SDK</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-300 text-sm font-medium">LI.FI SDK</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-slate-300 text-sm font-medium">Circle CCTP</span>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => onTabChange("send")}
            className="bg-gradient-primary text-white text-lg px-8 py-6 rounded-lg shadow-lg hover:opacity-90 transition-all duration-300"
          >
            <Send className="w-6 h-6 mr-3" /> Try Demo - Send Payment
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 bg-transparent text-lg px-8 py-6 rounded-lg shadow-lg hover:bg-slate-700/50 transition-all duration-300"
            onClick={() => document.getElementById("sdk-demo")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Code className="w-5 h-5 mr-3" /> View SDK Demo
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white card-glow">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-slate-300 flex items-center">
              <Send className="w-5 h-5 mr-2 text-blue-400" /> Cross-Chain Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            Send any token from any chain, recipient automatically receives USDC on their preferred chain.
            <Button
              variant="link"
              className="p-0 h-auto text-blue-400 hover:text-blue-300 mt-2"
              onClick={() => onTabChange("send")}
            >
              Try Send Module <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white card-glow">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-slate-300 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-400" /> Global Remittance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            Send money to family worldwide with preset addresses and simplified UX.
            <Button
              variant="link"
              className="p-0 h-auto text-blue-400 hover:text-blue-300 mt-2"
              onClick={() => onTabChange("remittance")}
            >
              Send to Family <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white card-glow">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-slate-300 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-400" /> Merchant Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            Embed OmniPay checkout in your website or dApp for seamless crypto payments.
            <Button
              variant="link"
              className="p-0 h-auto text-blue-400 hover:text-blue-300 mt-2"
              onClick={() => onTabChange("payouts")}
            >
              View Checkout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white card-glow">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-slate-300 flex items-center">
              <History className="w-5 h-5 mr-2 text-green-400" /> Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            Track all cross-chain payments with detailed transaction logs and status updates.
            <Button
              variant="link"
              className="p-0 h-auto text-blue-400 hover:text-blue-300 mt-2"
              onClick={() => onTabChange("history")}
            >
              View History <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white card-glow">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-slate-300 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-red-400" /> Treasury Management
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            Rebalance USDC liquidity across multiple blockchains for optimal operations.
            <Button
              variant="link"
              className="p-0 h-auto text-blue-400 hover:text-blue-300 mt-2"
              onClick={() => onTabChange("treasury")}
            >
              Manage Treasury <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 text-white card-glow">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-slate-300 flex items-center">
              <Info className="w-5 h-5 mr-2 text-cyan-400" /> Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300">
            Unified view of crypto assets and financial activity across all integrated chains.
            <Button
              variant="link"
              className="p-0 h-auto text-blue-400 hover:text-blue-300 mt-2"
              onClick={() => onTabChange("portfolio")}
            >
              View Portfolio <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SDK Demo Section */}
      <div id="sdk-demo" className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Embeddable SDK - Bonus Track 5
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4">OmniPay Checkout Widget</h2>
          <p className="text-slate-300 text-lg">
            Embed our checkout widget in any website or dApp. Developers can integrate OmniPay in minutes.
          </p>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="demo" className="data-[state=active]:bg-slate-700">
              Live Demo
            </TabsTrigger>
            <TabsTrigger value="embed" className="data-[state=active]:bg-slate-700">
              Embed Code
            </TabsTrigger>
            <TabsTrigger value="share" className="data-[state=active]:bg-slate-700">
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Widget Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="merchant-config" className="text-slate-300">
                        Merchant Address
                      </Label>
                      <Input
                        id="merchant-config"
                        value={widgetConfig.merchant}
                        onChange={(e) => setWidgetConfig((prev) => ({ ...prev, merchant: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount-config" className="text-slate-300">
                        Amount (USDC)
                      </Label>
                      <Input
                        id="amount-config"
                        value={widgetConfig.amount}
                        onChange={(e) => setWidgetConfig((prev) => ({ ...prev, amount: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chain-config" className="text-slate-300">
                        Target Chain
                      </Label>
                      <Input
                        id="chain-config"
                        value={widgetConfig.toChain}
                        onChange={(e) => setWidgetConfig((prev) => ({ ...prev, toChain: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center justify-center">
                <OmniPayCheckoutWidget {...widgetConfig} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  React/Next.js Integration
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(embedCode, "Embed code")}
                    className="border-slate-600 text-slate-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm text-slate-300">
                  <code>{embedCode}</code>
                </pre>
                <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                  <h4 className="text-blue-300 font-medium mb-2">Installation</h4>
                  <code className="text-blue-200 text-sm">npm install @omnipay/sdk</code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Shareable Checkout Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-300 text-sm font-mono break-all">{checkoutUrl}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(checkoutUrl, "Checkout URL")}
                      className="border-slate-600 text-slate-300 flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(checkoutUrl, "_blank")}
                      className="border-slate-600 text-slate-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">QR Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                  <p className="text-slate-400 text-sm">Scan to open checkout</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300 mt-2 bg-transparent"
                    onClick={() =>
                      toast({ title: "QR Code", description: "QR code functionality would generate actual QR here" })
                    }
                  >
                    Generate QR
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="text-center mt-16 text-slate-400 text-sm space-y-4">
        <Separator className="bg-slate-700" />
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <Link
            href="https://metamask.io/sdk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            MetaMask SDK
          </Link>
          <Link
            href="https://li.fi/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <Zap className="w-5 h-5 text-purple-500" />
            LI.FI SDK
          </Link>
          <Link
            href="https://www.circle.com/en/usdc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            Circle CCTP
          </Link>
        </div>
        <p className="text-slate-500">
          Built for MetaMask Hackathon • Helping MetaMask users navigate multi-chain payments with ease
        </p>
      </div>
    </div>
  )
}
