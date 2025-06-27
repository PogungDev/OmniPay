"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, ArrowUpRight, Globe, Zap, Users, Clock, CheckCircle } from "lucide-react"

export function DashboardModule() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to OmniPay AI</h2>
              <p className="text-slate-300">
                Your universal cross-chain payment dashboard. Send any token, receive USDC anywhere.
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              Send Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Sent</p>
                <p className="text-2xl font-bold text-white">$12,450</p>
                <p className="text-xs text-green-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Transactions</p>
                <p className="text-2xl font-bold text-white">47</p>
                <p className="text-xs text-green-400 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +8.2%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Chains Used</p>
                <p className="text-2xl font-bold text-white">6</p>
                <p className="text-xs text-slate-400">Networks</p>
              </div>
              <Globe className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Speed</p>
                <p className="text-2xl font-bold text-white">2.3m</p>
                <p className="text-xs text-blue-400">Per transaction</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Recent Transactions
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { token: "ETH", amount: "0.5", usd: "1,000", status: "success", time: "2m ago", recipient: "0x742d..." },
              {
                token: "MATIC",
                amount: "2000",
                usd: "1,500",
                status: "pending",
                time: "5m ago",
                recipient: "0x853d...",
              },
              { token: "DAI", amount: "500", usd: "500", status: "success", time: "1h ago", recipient: "0x964d..." },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    {tx.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {tx.amount} {tx.token} → USDC
                    </p>
                    <p className="text-sm text-slate-400">
                      To {tx.recipient} • {tx.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">${tx.usd}</p>
                  <Badge
                    variant={tx.status === "success" ? "default" : "secondary"}
                    className={
                      tx.status === "success" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-16">
              <div className="text-center">
                <Zap className="w-6 h-6 mx-auto mb-1" />
                <div>
                  <div className="font-semibold">Send Payment</div>
                  <div className="text-xs opacity-80">Any token → USDC</div>
                </div>
              </div>
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-slate-600 text-slate-300 h-16">
                <div className="text-center">
                  <Globe className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">Bridge</div>
                </div>
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 h-16">
                <div className="text-center">
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm">Portfolio</div>
                </div>
              </Button>
            </div>

            {/* Network Status */}
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">All Networks Operational</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">6 chains connected • Average speed: 2.3 minutes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Network Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { chain: "Ethereum", speed: "3.2m", success: 98.5, volume: "$2.1M" },
              { chain: "Polygon", speed: "1.8m", success: 99.2, volume: "$1.8M" },
              { chain: "Arbitrum", speed: "2.1m", success: 97.8, volume: "$1.2M" },
            ].map((network, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{network.chain}</span>
                  <Badge variant="outline" className="border-green-500/30 text-green-400">
                    {network.success}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Avg Speed</span>
                    <span className="text-white">{network.speed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">24h Volume</span>
                    <span className="text-white">{network.volume}</span>
                  </div>
                </div>
                <Progress value={network.success} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
