"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Handshake, TrendingUp, Shield, Globe, Star } from "lucide-react"

interface Partner {
  id: string
  name: string
  country: string
  reputation: number
  totalSent: string
  relationship: "family" | "business" | "community"
  trustLevel: number
  avatar?: string
}

interface CommunityPool {
  id: string
  name: string
  members: number
  totalVolume: string
  avgSavings: number
  trustScore: number
  category: "family" | "business" | "regional"
}

export function PartnershipNetwork() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [communityPools, setCommunityPools] = useState<CommunityPool[]>([])
  const [userReputation, setUserReputation] = useState(0)

  // Mock data
  useEffect(() => {
    setPartners([
      {
        id: "1",
        name: "Maria Santos",
        country: "Philippines",
        reputation: 95,
        totalSent: "$12,500",
        relationship: "family",
        trustLevel: 98,
        avatar: "/avatars/maria.jpg",
      },
      {
        id: "2",
        name: "Ahmed Hassan",
        country: "UAE",
        reputation: 87,
        totalSent: "$8,200",
        relationship: "business",
        trustLevel: 89,
        avatar: "/avatars/ahmed.jpg",
      },
      {
        id: "3",
        name: "Rosa Martinez",
        country: "Mexico",
        reputation: 92,
        totalSent: "$15,800",
        relationship: "community",
        trustLevel: 94,
        avatar: "/avatars/rosa.jpg",
      },
    ])

    setCommunityPools([
      {
        id: "1",
        name: "Filipino Workers UAE",
        members: 2847,
        totalVolume: "$2.4M",
        avgSavings: 94,
        trustScore: 96,
        category: "regional",
      },
      {
        id: "2",
        name: "Santos Family Network",
        members: 12,
        totalVolume: "$45K",
        avgSavings: 97,
        trustScore: 99,
        category: "family",
      },
      {
        id: "3",
        name: "Dubai Tech Workers",
        members: 156,
        totalVolume: "$890K",
        avgSavings: 91,
        trustScore: 93,
        category: "business",
      },
    ])

    setUserReputation(87)
  }, [])

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "family":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "business":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "community":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "family":
        return <Users className="w-4 h-4" />
      case "business":
        return <Handshake className="w-4 h-4" />
      case "regional":
        return <Globe className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* User Reputation Dashboard */}
      <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Your Partnership Reputation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{userReputation}/100</p>
              <p className="text-sm text-slate-300">Trusted Partner Status</p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <p className="text-xs text-slate-400 mt-1">Since March 2024</p>
            </div>
          </div>
          <Progress value={userReputation} className="h-3" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-white">47</p>
              <p className="text-xs text-slate-400">Successful Partnerships</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">$23.5K</p>
              <p className="text-xs text-slate-400">Total Volume</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">98.7%</p>
              <p className="text-xs text-slate-400">Success Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Partners */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Handshake className="w-5 h-5 mr-2" />
              Trusted Partners
            </span>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              Add Partner
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={partner.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {partner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{partner.name}</p>
                  <p className="text-sm text-slate-400">{partner.country}</p>
                </div>
                <Badge className={getRelationshipColor(partner.relationship)}>{partner.relationship}</Badge>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{partner.totalSent}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Shield className="w-3 h-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">{partner.trustLevel}%</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Community Pools */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Community Partnership Pools
            </span>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              Join Pool
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {communityPools.map((pool) => (
            <div key={pool.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    {getCategoryIcon(pool.category)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{pool.name}</p>
                    <p className="text-sm text-slate-400">{pool.members} active partners</p>
                  </div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{pool.category}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-sm text-slate-400">Total Volume</p>
                  <p className="font-bold text-white">{pool.totalVolume}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Avg Savings</p>
                  <p className="font-bold text-green-400">{pool.avgSavings}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Trust Score</p>
                  <p className="font-bold text-blue-400">{pool.trustScore}/100</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">+12% this month</span>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Partnership Benefits */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white">Partnership Benefits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Fee Sharing from Network</span>
            <span className="font-bold text-green-400">+$127.50</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Community Pool Rewards</span>
            <span className="font-bold text-blue-400">+$89.20</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Reputation Bonus</span>
            <span className="font-bold text-purple-400">+$45.80</span>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">Total Monthly Benefits</span>
              <span className="font-bold text-xl text-green-400">+$262.50</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
