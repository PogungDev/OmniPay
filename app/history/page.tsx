"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import type { Transaction } from "@/types/payment"
import { SUPPORTED_CHAINS } from "@/config/chains"

export default function HistoryPage() {
  const { account, isConnected, isDummy } = useWallet() // Get isDummy
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Mock transaction data
  const mockTransactions: Transaction[] = [
    {
      id: "tx_1",
      hash: "0x1234567890abcdef1234567890abcdef12345678",
      status: "success",
      fromToken: "ETH",
      fromChain: 1,
      toChain: 137,
      amount: "0.5",
      usdcAmount: "1000.00",
      recipient: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
      timestamp: Date.now() - 3600000, // 1 hour ago
      gasUsed: "0.025",
      explorerUrl: "https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef12345678",
    },
    {
      id: "tx_2",
      hash: "0xabcdef1234567890abcdef1234567890abcdef12",
      status: "pending",
      fromToken: "MATIC",
      fromChain: 137,
      toChain: 42161,
      amount: "2000",
      usdcAmount: "1500.00",
      recipient: "0x853d45Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
      timestamp: Date.now() - 300000, // 5 minutes ago
      explorerUrl: "https://polygonscan.com/tx/0xabcdef1234567890abcdef1234567890abcdef12",
    },
    {
      id: "tx_3",
      hash: "0x9876543210fedcba9876543210fedcba98765432",
      status: "failed",
      fromToken: "WBTC",
      fromChain: 1,
      toChain: 10,
      amount: "0.05",
      usdcAmount: "2000.00",
      recipient: "0x964d46Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
      timestamp: Date.now() - 7200000, // 2 hours ago
      explorerUrl: "https://etherscan.io/tx/0x9876543210fedcba9876543210fedcba98765432",
    },
    {
      id: "tx_4",
      hash: "0xdeadbeef1234567890abcdef1234567890abcdef",
      status: "success",
      fromToken: "ETH",
      fromChain: 11155111, // Sepolia
      toChain: 137, // Polygon
      amount: "0.1",
      usdcAmount: "200.00",
      recipient: "0xDemoRecipientAddress1234567890abcdef",
      timestamp: Date.now() - 120000, // 2 minutes ago
      gasUsed: "0.005",
      explorerUrl: "https://sepolia.etherscan.io/tx/0xdeadbeef1234567890abcdef1234567890abcdef",
    },
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTransactions(mockTransactions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromToken.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    )
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to view transaction history</p>
            <Button asChild>
              <Link href="/">Go Back</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Transaction History</h1>
              <p className="text-gray-600">Track your cross-chain payments</p>
            </div>
          </div>
          <Badge variant="secondary">
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            {isDummy && <span className="ml-1 text-yellow-500">(Demo)</span>}
          </Badge>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by hash, recipient, or token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Clock className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Start by sending your first payment"}
                </p>
                <Button asChild>
                  <Link href="/send">Send First Payment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((tx) => (
              <Card key={tx.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <div className="font-semibold">
                          {tx.amount} {tx.fromToken} → {tx.usdcAmount} USDC
                        </div>
                        <div className="text-sm text-gray-600">
                          {SUPPORTED_CHAINS[tx.fromChain]?.name} → {SUPPORTED_CHAINS[tx.toChain]?.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(tx.status)}
                      <div className="text-sm text-gray-500 mt-1">{formatTime(tx.timestamp)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Recipient</div>
                      <div className="font-mono">
                        {tx.recipient.slice(0, 6)}...{tx.recipient.slice(-4)}
                      </div>
                    </div>
                    {tx.hash && (
                      <div>
                        <div className="text-gray-600">Transaction Hash</div>
                        <div className="font-mono">
                          {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                        </div>
                      </div>
                    )}
                  </div>

                  {tx.explorerUrl && (
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" asChild>
                        <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Explorer
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
