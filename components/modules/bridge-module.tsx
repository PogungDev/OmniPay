"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, AlertCircle } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/config/chains"

export function BridgeModule() {
  const [fromChain, setFromChain] = useState("1")
  const [toChain, setToChain] = useState("137")
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState("ETH")

  const bridgeRoutes = [
    {
      name: "Fast Route",
      time: "2-5 minutes",
      fee: "0.1%",
      security: "High",
      recommended: true,
    },
    {
      name: "Cheap Route",
      time: "10-15 minutes",
      fee: "0.05%",
      security: "High",
      recommended: false,
    },
    {
      name: "Ultra Fast",
      time: "30 seconds",
      fee: "0.2%",
      security: "Medium",
      recommended: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Bridge Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* From */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">From</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Source Chain</Label>
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Object.values(SUPPORTED_CHAINS).map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()} className="text-white">
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="ETH" className="text-white">
                    ETH
                  </SelectItem>
                  <SelectItem value="USDC" className="text-white">
                    USDC
                  </SelectItem>
                  <SelectItem value="DAI" className="text-white">
                    DAI
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Amount</Label>
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* To */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Destination Chain</Label>
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Object.values(SUPPORTED_CHAINS).map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()} className="text-white">
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">You'll Receive</Label>
              <div className="p-3 bg-slate-900/50 border border-slate-600 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    {amount || "0.0"} {token}
                  </span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Same Token
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Estimated Time</Label>
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="w-4 h-4" />
                <span>2-5 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bridge Routes */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Available Routes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bridgeRoutes.map((route, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                route.recommended
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-slate-600 bg-slate-900/30 hover:bg-slate-900/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{route.name}</span>
                      {route.recommended && <Badge className="bg-blue-600 text-white">Recommended</Badge>}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                      <span>⏱️ {route.time}</span>
                      <span>💰 {route.fee}</span>
                      <span>🔒 {route.security}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant={route.recommended ? "default" : "outline"}
                  className={route.recommended ? "bg-blue-600 hover:bg-blue-700" : "border-slate-600 text-slate-300"}
                >
                  Select
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Bridge Action */}
      <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-2">Ready to Bridge?</h3>
              <p className="text-slate-300 text-sm">
                Bridge {amount || "0.0"} {token} from {SUPPORTED_CHAINS[Number(fromChain)]?.name} to{" "}
                {SUPPORTED_CHAINS[Number(toChain)]?.name}
              </p>
            </div>
            <Button
              disabled={!amount}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Bridge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <AlertCircle className="w-4 h-4" />
        <span>Bridging powered by LI.FI cross-chain infrastructure</span>
      </div>
    </div>
  )
}
