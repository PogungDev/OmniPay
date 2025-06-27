"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Zap,
  ExternalLink,
  History,
  Users,
  CreditCard,
  TrendingUp,
} from "lucide-react"
import { ReceiptText } from "lucide-react"
import { SUPPORTED_CHAINS } from "@/config/chains"
import { getStoredTransactions, type Transaction } from "@/lib/transaction-utils"

export default function HistoryModule() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")

  // Load transactions on mount
  useEffect(() => {
    setTransactions(getStoredTransactions())
  }, [])

  // Listen for new transactions
  useEffect(() => {
    const handleNewTransaction = () => {
      setTransactions(getStoredTransactions())
    }

    window.addEventListener('omnipay_transaction_added', handleNewTransaction)
    return () => window.removeEventListener('omnipay_transaction_added', handleNewTransaction)
  }, [])

  const filteredTxLogs = transactions.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.chain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "All" || log.status === filterStatus
    const matchesType = filterType === "All" || log.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case "Processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "Failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Payment Sent":
        return <ArrowUpRight className="w-4 h-4 text-orange-400" />
      case "Remittance Sent":
        return <Users className="w-4 h-4 text-purple-400" />
      case "USDC Received":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />
      case "Yield Claimed":
        return <Zap className="w-4 h-4 text-yellow-400" />
      case "Payout Request":
        return <CreditCard className="w-4 h-4 text-purple-400" />
      case "Treasury Rebalance":
        return <TrendingUp className="w-4 h-4 text-yellow-400" />
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getExplorerUrl = (chain: string) => {
    const chainInfo = Object.values(SUPPORTED_CHAINS).find((c) => c.name === chain || c.symbol === chain)
    return chainInfo?.explorerUrl || null
  }

  const openExplorer = (txHash: string, chain: string) => {
    if (txHash === "pending..." || txHash === "failed") {
      alert(`Transaction ${txHash === "failed" ? "failed" : "still processing"} - no explorer link available`)
      return
    }
    
    const explorerUrl = getExplorerUrl(chain)
    if (explorerUrl) {
      window.open(`${explorerUrl}/tx/${txHash}`, "_blank")
    } else {
      alert(`Transaction Hash: ${txHash}\nChain: ${chain}\n(Explorer URL not configured for this chain)`)
    }
  }

  const clearAllTransactions = () => {
    if (confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) {
      localStorage.removeItem('omnipay_transactions')
      setTransactions([])
    }
  }

  const exportTransactions = () => {
    if (transactions.length === 0) {
      alert('No transactions to export')
      return
    }

    const csv = [
      ['Date', 'Type', 'Status', 'Amount', 'Token', 'USD Value', 'From', 'To', 'Chain', 'TX Hash', 'Details'].join(','),
      ...transactions.map(tx => [
        tx.date,
        tx.type,
        tx.status,
        tx.amount,
        tx.token,
        tx.usdValue,
        tx.from,
        tx.to,
        tx.chain,
        tx.txHash,
        tx.details
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `omnipay-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-4 py-2 mb-4">
          <History className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Live Transaction History</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Transaction History</h1>
        <p className="text-lg text-slate-400">Track all your real cross-chain payments and blockchain activity</p>
      </div>

      {/* Search and Filter Controls */}
      <Card className="bg-slate-800 border-slate-700 text-white card-glow max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <ReceiptText className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Payment Sent">Payment Sent</SelectItem>
                  <SelectItem value="Remittance Sent">Remittance Sent</SelectItem>
                  <SelectItem value="USDC Received">USDC Received</SelectItem>
                  <SelectItem value="Yield Claimed">Yield Claimed</SelectItem>
                  <SelectItem value="Payout Request">Payout Request</SelectItem>
                  <SelectItem value="Treasury Rebalance">Treasury Rebalance</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setTransactions(getStoredTransactions())}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                title="Refresh transactions"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={exportTransactions}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Log Table */}
      <Card className="bg-slate-800 border-slate-700 text-white card-glow max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-300 flex items-center justify-between">
            <span>Live Transactions ({filteredTxLogs.length})</span>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                Real-time Tracking
              </Badge>
              {transactions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllTransactions}
                  className="text-red-400 border-red-400 hover:bg-red-400/10"
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTxLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(log.type)}
                    {getStatusIcon(log.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-white">{log.type}</h3>
                      <Badge
                        variant={log.status === "Completed" ? "default" : log.status === "Processing" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {log.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {log.amount} {log.token} • ${log.usdValue.toLocaleString()} • {log.chain}
                    </p>
                    <p className="text-xs text-slate-500">{log.date}</p>
                    <p className="text-xs text-slate-400 truncate max-w-96">{log.details}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">
                    {log.amount} {log.token}
                  </div>
                  <div className="text-sm text-slate-400">
                    ${log.usdValue.toLocaleString()}
                  </div>
                  {log.txHash !== "pending..." && log.txHash !== "failed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openExplorer(log.txHash, log.chain)}
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto text-xs"
                    >
                      View on Explorer <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                  {log.status === "Processing" && (
                    <div className="text-xs text-blue-400">Processing...</div>
                  )}
                  {log.status === "Failed" && (
                    <div className="text-xs text-red-400">Failed</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTxLogs.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-400 mb-2">No transactions yet</h3>
              <p className="text-slate-500 mb-4">Start by testing the Send, Remittance, Payouts, or Treasury features!</p>
              <div className="text-sm text-slate-400">
                💡 <strong>Live Testing:</strong> All transactions you make will appear here in real-time with actual blockchain links
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Testing Instructions */}
      <Card className="mt-8 bg-slate-800 border-slate-700 text-white card-glow max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-300 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-400" /> Live Testing Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>
            **🧪 Test Send Feature:** Use the Send tab to create a real testnet transaction - it will appear here with actual Etherscan link!
          </p>
          <p>
            **👨‍👩‍👧‍👦 Test Remittance:** Send money to family using Remittance tab - track the cross-chain payment in real-time.
          </p>
          <p>
            **💳 Test Payouts:** Request withdrawal using Payouts tab - monitor the off-chain processing status.
          </p>
          <p>
            **🏦 Test Treasury:** Rebalance liquidity using Treasury tab - see USDC movements between chains.
          </p>
          <p>
            **🔗 Real Explorer Links:** All completed testnet transactions will have working blockchain explorer links for verification.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
