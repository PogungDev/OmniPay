"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Shield, TrendingDown, Clock, Zap } from "lucide-react"

interface CommunityRoute {
  id: string
  poolName: string
  members: number
  avgSavings: number
  trustScore: number
  estimatedFee: string
  estimatedTime: string
  communityBenefit: string
}

export function CommunitySend() {
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<CommunityRoute | null>(null)

  const communityRoutes: CommunityRoute[] = [
    {
      id: "1",
      poolName: "Filipino Workers UAE",
      members: 2847,
      avgSavings: 94,
      trustScore: 96,
      estimatedFee: "$0.12",
      estimatedTime: "45 seconds",
      communityBenefit: "$2.40",
    },
    {
      id: "2",
      poolName: "Dubai Tech Workers",
      members: 156,
      avgSavings: 91,
      trustScore: 93,
      estimatedFee: "$0.18",
      estimatedTime: "1.2 minutes",
      communityBenefit: "$1.80",
    },
    {
      id: "3",
      poolName: "Direct Route",
      members: 1,
      avgSavings: 85,
      trustScore: 87,
      estimatedFee: "$0.35",
      estimatedTime: "2.1 minutes",
      communityBenefit: "$0.00",
    },
  ]

  const frequentPartners = [
    { name: "Maria Santos", country: "Philippines", avatar: "/avatars/maria.jpg" },
    { name: "Ahmed Hassan", country: "UAE", avatar: "/avatars/ahmed.jpg" },
    { name: "Rosa Martinez", country: "Mexico", avatar: "/avatars/rosa.jpg" },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Send to Partners */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Quick Send to Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            {frequentPartners.map((partner, i) => (
              <Button
                key={i}
                variant="outline"
                className="flex-col h-auto p-3 border-slate-600 hover:border-blue-500"
                onClick={() => setRecipient(partner.name)}
              >
                <Avatar className="mb-2">
                  <AvatarImage src={partner.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {partner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-slate-300">{partner.name}</span>
                <span className="text-xs text-slate-500">{partner.country}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Send USDC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Amount (USDC)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Recipient</Label>
              <Input
                placeholder="Partner name or address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Chain</Label>
              <Select>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select destination chain" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="polygon" className="text-white">
                    Polygon
                  </SelectItem>
                  <SelectItem value="ethereum" className="text-white">
                    Ethereum
                  </SelectItem>
                  <SelectItem value="arbitrum" className="text-white">
                    Arbitrum
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Community Routes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {communityRoutes.map((route) => (
              <div
                key={route.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedRoute?.id === route.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 hover:border-slate-500"
                }`}
                onClick={() => setSelectedRoute(route)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">{route.poolName}</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">-{route.avgSavings}%</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <TrendingDown className="w-3 h-3 text-green-400" />
                    <span className="text-slate-300">Fee: {route.estimatedFee}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-300">{route.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span className="text-slate-300">Trust: {route.trustScore}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-orange-400" />
                    <span className="text-slate-300">{route.members} partners</span>
                  </div>
                </div>

                {route.communityBenefit !== "$0.00" && (
                  <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/30">
                    <span className="text-xs text-green-400">
                      Community Benefit: +{route.communityBenefit} shared with network
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Send Button */}
      <Button
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        size="lg"
        disabled={!amount || !recipient || !selectedRoute}
      >
        <Zap className="w-4 h-4 mr-2" />
        Send via {selectedRoute?.poolName || "Community Network"}
      </Button>
    </div>
  )
}
