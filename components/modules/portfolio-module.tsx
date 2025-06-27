"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, PieChart, BarChart3, ArrowUpRight, ArrowDownRight, Wallet, RefreshCw } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"

interface TokenBalance {
  symbol: string
  name: string
  balance: string
  value: number
  change24h: number
  chain: string
  logo: string
}

interface ChainData {
  name: string
  symbol: string
  totalValue: number
  tokens: TokenBalance[]
}

export default function PortfolioModule() {
  const { account, isConnected, isDummy } = useWallet()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock portfolio data
  const portfolioData: ChainData[] = [
    {
      name: "Ethereum",
      symbol: "ETH",
      totalValue: 2450.75,
      tokens: [
        {
          symbol: "USDC",
          name: "USD Coin",
          balance: "1,250.00",
          value: 1250.0,
          change24h: 0.01,
          chain: "Ethereum",
          logo: "/placeholder.svg?height=32&width=32",
        },
        {
          symbol: "ETH",
          name: "Ethereum",
          balance: "0.75",
          value: 1200.75,
          change24h: 2.45,
          chain: "Ethereum",
          logo: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      name: "Polygon",
      symbol: "MATIC",
      totalValue: 850.25,
      tokens: [
        {
          symbol: "USDC",
          name: "USD Coin",
          balance: "500.00",
          value: 500.0,
          change24h: 0.01,
          chain: "Polygon",
          logo: "/placeholder.svg?height=32&width=32",
        },
        {
          symbol: "MATIC",
          name: "Polygon",
          balance: "425.50",
          value: 350.25,
          change24h: -1.25,
          chain: "Polygon",
          logo: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      name: "Arbitrum",
      symbol: "ARB",
      totalValue: 675.5,
      tokens: [
        {
          symbol: "USDC",
          name: "USD Coin",
          balance: "400.00",
          value: 400.0,
          change24h: 0.01,
          chain: "Arbitrum",
          logo: "/placeholder.svg?height=32&width=32",
        },
        {
          symbol: "ARB",
          name: "Arbitrum",
          balance: "150.75",
          value: 275.5,
          change24h: 3.75,
          chain: "Arbitrum",
          logo: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
  ]

  const totalPortfolioValue = portfolioData.reduce((sum, chain) => sum + chain.totalValue, 0)
  const totalChange24h = 2.15 // Mock overall change

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-slate-400">Connect your wallet to view your portfolio</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalPortfolioValue.toLocaleString()}</div>
            <div className={`flex items-center text-xs ${totalChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalChange24h >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {Math.abs(totalChange24h)}% (24h)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Active Chains</CardTitle>
            <PieChart className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{portfolioData.length}</div>
            <p className="text-xs text-slate-400">Multi-chain portfolio</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Assets</CardTitle>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {portfolioData.reduce((sum, chain) => sum + chain.tokens.length, 0)}
            </div>
            <p className="text-xs text-slate-400">Across all chains</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Details */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Portfolio Details</CardTitle>
          <div className="flex items-center space-x-2">
            {isDummy && (
              <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                Demo Mode
              </Badge>
            )}
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="chains" className="data-[state=active]:bg-slate-600">
                By Chain
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4">
                {portfolioData.flatMap((chain) =>
                  chain.tokens.map((token) => (
                    <div
                      key={`${chain.name}-${token.symbol}`}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={token.logo || "/placeholder.svg"}
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-white">{token.symbol}</div>
                          <div className="text-sm text-slate-400">
                            {token.name} • {chain.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {token.balance} {token.symbol}
                        </div>
                        <div className="text-sm text-slate-400">${token.value.toLocaleString()}</div>
                      </div>
                      <div className={`text-sm ${token.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {token.change24h >= 0 ? "+" : ""}
                        {token.change24h}%
                      </div>
                    </div>
                  )),
                )}
              </div>
            </TabsContent>

            <TabsContent value="chains" className="space-y-4">
              {portfolioData.map((chain) => (
                <Card key={chain.name} className="bg-slate-700/30 border-slate-600">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">{chain.name}</CardTitle>
                      <div className="text-right">
                        <div className="font-medium text-white">${chain.totalValue.toLocaleString()}</div>
                        <div className="text-sm text-slate-400">
                          {((chain.totalValue / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
                        </div>
                      </div>
                    </div>
                    <Progress value={(chain.totalValue / totalPortfolioValue) * 100} className="h-2 bg-slate-600" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {chain.tokens.map((token) => (
                      <div key={token.symbol} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={token.logo || "/placeholder.svg"}
                            alt={token.symbol}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-white">{token.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{token.balance}</div>
                          <div className="text-sm text-slate-400">${token.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
