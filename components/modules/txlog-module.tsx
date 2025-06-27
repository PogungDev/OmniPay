"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ReceiptText,
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
  Zap,
  DollarSign,
  LinkIcon,
} from "lucide-react"

// Mock data for demonstration
const mockTxLogs = [
  {
    id: "log_001",
    type: "Payment Sent",
    status: "Completed",
    amount: 0.5,
    token: "ETH",
    usdValue: 1500,
    from: "0xSender...1234",
    to: "0xRecipient...5678",
    date: "2024-07-20 10:30 AM",
    chain: "Ethereum",
    txHash: "0xabc123def4567890123456789012345678901234567890123456789012345678",
    details: "Cross-chain payment via Li.Fi",
  },
  {
    id: "log_002",
    type: "USDC Received",
    status: "Completed",
    amount: 100,
    token: "USDC",
    usdValue: 100,
    from: "0xBridge...ABCD",
    to: "0xMyWallet...EFGH",
    date: "2024-07-19 03:15 PM",
    chain: "Polygon",
    txHash: "0xdef456ghi78901234567890123456789012345678901234567890123456789012",
    details: "Received from OmniPay payment",
  },
  {
    id: "log_003",
    type: "Yield Claimed",
    status: "Completed",
    amount: 5.23,
    token: "USDC",
    usdValue: 5.23,
    from: "0xTreasury...IJKL",
    to: "0xMyWallet...EFGH",
    date: "2024-07-18 09:00 AM",
    chain: "Arbitrum",
    txHash: "0xghi789jkl01234567890123456789012345678901234567890123456789012345",
    details: "Claimed from USDC Stable Yield",
  },
  {
    id: "log_004",
    type: "Payout Request",
    status: "Processing",
    amount: 500,
    token: "USDC",
    usdValue: 500,
    from: "0xMyWallet...EFGH",
    to: "Bank ABC",
    date: "2024-07-17 01:00 PM",
    chain: "Off-chain",
    txHash: "N/A",
    details: "Withdrawal to bank account",
  },
  {
    id: "log_005",
    type: "Payment Failed",
    status: "Failed",
    amount: 0.1,
    token: "ETH",
    usdValue: 300,
    from: "0xSender...1234",
    to: "0xInvalid...Addr",
    date: "2024-07-16 11:45 AM",
    chain: "Ethereum",
    txHash: "0xpqr345stu67890123456789012345678901234567890123456789012345678901",
    details: "Invalid recipient address",
  },
]

export default function TxLogModule() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")

  const filteredTxLogs = mockTxLogs.filter((log) => {
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
      case "USDC Received":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />
      case "Yield Claimed":
        return <Zap className="w-4 h-4 text-yellow-400" />
      case "Payout Request":
        return <DollarSign className="w-4 h-4 text-purple-400" />
      default:
        return null
    }
  }

  const openExplorer = (txHash: string, chain: string) => {
    if (txHash === "N/A") return
    let explorerUrl = ""
    switch (chain) {
      case "Ethereum":
        explorerUrl = `https://etherscan.io/tx/${txHash}`
        break
      case "Polygon":
        explorerUrl = `https://polygonscan.com/tx/${txHash}`
        break
      case "Arbitrum":
        explorerUrl = `https://arbiscan.io/tx/${txHash}`
        break
      default:
        explorerUrl = `https://etherscan.io/tx/${txHash}`
    }
    window.open(explorerUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-white card-glow">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-300">Transaction Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by ID, address, hash, details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-white">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px] bg-slate-700 border-slate-600 text-white">
                <ReceiptText className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filter Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Payment Sent">Payment Sent</SelectItem>
                <SelectItem value="USDC Received">USDC Received</SelectItem>
                <SelectItem value="Yield Claimed">Yield Claimed</SelectItem>
                <SelectItem value="Payout Request">Payout Request</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>

          <Separator className="bg-slate-700 mb-4" />

          {filteredTxLogs.length === 0 ? (
            <div className="text-center text-slate-400 py-8">No log entries found matching your criteria.</div>
          ) : (
            <div className="space-y-4">
              {filteredTxLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    {getTypeIcon(log.type)}
                    <div>
                      <div className="font-medium text-white">{log.type}</div>
                      <div className="text-sm text-slate-400">{log.date}</div>
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <div className="font-bold text-white">
                      {log.amount} {log.token}
                    </div>
                    <div className="text-sm text-slate-300">
                      ${log.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                      USD
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    {getStatusIcon(log.status)}
                    <Badge
                      variant="outline"
                      className={`text-xs ${log.status === "Completed" ? "border-emerald-500 text-emerald-400" : log.status === "Processing" ? "border-blue-500 text-blue-400" : "border-red-500 text-red-400"}`}
                    >
                      {log.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openExplorer(log.txHash, log.chain)}
                      className="text-slate-400 hover:text-white"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutorial Tips Card */}
      <Card className="mt-8 bg-slate-800 border-slate-700 text-white card-glow max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-300 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-400" /> TX Log Module Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-4">
          <p>
            **1. Comprehensive Record:** The TX Log provides a granular view of every single operation, including
            internal swaps and bridge transfers that happen behind the scenes.
          </p>
          <p>
            **2. Debugging & Auditing:** This log is invaluable for debugging issues, auditing your activities, or
            understanding the exact flow of funds.
          </p>
          <p>
            **3. Direct Explorer Links:** Easily jump to the blockchain explorer for any on-chain transaction to verify
            its details directly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
