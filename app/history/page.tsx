"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Search } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { Transaction, TransactionStatus, TransactionType } from "@/types/payment"

const SUPPORTED_CHAINS: Record<number, { name: string; explorer: string }> = {
  1: { name: "Ethereum", explorer: "https://etherscan.io" },
  137: { name: "Polygon", explorer: "https://polygonscan.com" },
  42161: { name: "Arbitrum", explorer: "https://arbiscan.io" },
  10: { name: "Optimism", explorer: "https://optimistic.etherscan.io" },
  8453: { name: "Base", explorer: "https://basescan.org" },
  11155111: { name: "Sepolia", explorer: "https://sepolia.etherscan.io" },
  421614: { name: "Arbitrum Sepolia", explorer: "https://sepolia.arbiscan.io" },
}

export default function HistoryPage() {
  const { address, isConnected, isDummy } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")

  // Mock transaction data for demo/testing
  const mockTransactions: Transaction[] = [
    {
      id: "tx_1",
      hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      from: address || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
      to: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
      value: 250,
      token: "USDC",
      chainId: 11155111,
      status: TransactionStatus.CONFIRMED,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      type: TransactionType.SEND,
      blockNumber: 12345678,
      gasUsed: 0.025,
    },
    {
      id: "tx_2",
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      from: address || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
      to: "0x5555666677778888999900001111222233334444555566667777888899990000",
      value: 0.1,
      token: "ETH",
      chainId: 11155111,
      status: TransactionStatus.PENDING,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      type: TransactionType.BRIDGE,
    },
    {
      id: "tx_3",
      hash: "0x9999888877776666555544443333222211110000ffffeeeedddcccbbbaaa9999",
      from: "0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeefffff",
      to: address || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
      value: 500,
      token: "USDC",
      chainId: 421614,
      status: TransactionStatus.FAILED,
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      type: TransactionType.RECEIVE,
    },
    {
      id: "tx_4",
      hash: "0x7777666655554444333322221111000099998888aaaabbbbccccddddeeeeffff",
      from: address || "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7",
      to: "0x2222333344445555666677778888999900001111aaaabbbbccccddddeeeeffff",
      value: 1000,
      token: "USDC",
      chainId: 137,
      status: TransactionStatus.CONFIRMED,
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      type: TransactionType.SWAP,
      blockNumber: 87654321,
      gasUsed: 0.005,
    },
  ]

  // Filter transactions based on search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm.trim()) return mockTransactions

    return mockTransactions.filter(
      (tx) =>
        tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.token.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [mockTransactions, searchTerm])

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
        return "✅"
      case TransactionStatus.PENDING:
        return "⏳"
      case TransactionStatus.FAILED:
        return "❌"
      default:
        return "⏳"
    }
  }

  const getStatusColor = (status: TransactionStatus): string => {
    const variants = {
      [TransactionStatus.CONFIRMED]: "default",
      [TransactionStatus.PENDING]: "secondary",
      [TransactionStatus.FAILED]: "destructive",
    } as const

    return variants[status]
  }

  const formatTime = (timestamp: number | Date): string => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getExplorerUrl = (hash: string, chainId: number): string => {
    const chain = SUPPORTED_CHAINS[chainId]
    return chain ? `${chain.explorer}/tx/${hash}` : ""
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Transaction History</h1>
          <p className="text-gray-600 mb-8">
            Connect your wallet to view your transaction history
          </p>
          <Button>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Transaction History</h1>
          {isDummy && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Demo Mode
            </Badge>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by hash, address, or token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredTransactions.filter(tx => tx.status === TransactionStatus.CONFIRMED).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {filteredTransactions.filter(tx => tx.status === TransactionStatus.FAILED).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No transactions found matching your search.
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((tx) => (
              <Card key={tx.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getStatusIcon(tx.status)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {tx.value} {tx.token}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {SUPPORTED_CHAINS[tx.chainId]?.name || `Chain ${tx.chainId}`}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(tx.status) as any} className="capitalize">
                          {tx.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Transaction Hash</div>
                          <div className="font-mono">
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-10)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Time</div>
                          <div className="text-sm text-gray-500 mt-1">{formatTime(tx.timestamp)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">To Address</div>
                          <div className="font-mono">
                            {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Type</div>
                          <div className="capitalize">{tx.type}</div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {getExplorerUrl(tx.hash, tx.chainId) && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={getExplorerUrl(tx.hash, tx.chainId)} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
