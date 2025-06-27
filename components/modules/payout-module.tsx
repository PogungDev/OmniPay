"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CreditCard, DollarSign, Clock, Building2, CheckCircle, Loader2, ExternalLink, AlertCircle, Banknote } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useWallet } from "@/components/wallet-provider"
import { addTransactionToHistory, updateTransactionStatus, generateTestnetTxHash } from "@/lib/transaction-utils"

// Mock data for demonstration
const mockPayoutMethods = [
  { id: "bank", name: "Bank Transfer", icon: <Building2 className="w-5 h-5 mr-2" /> },
  { id: "crypto_usdc", name: "Crypto (USDC)", icon: <Banknote className="w-5 h-5 mr-2" /> },
  { id: "crypto_eth", name: "Crypto (ETH)", icon: <Banknote className="w-5 h-5 mr-2" /> },
]

const mockPayoutRequests = [
  {
    id: "PO-001",
    amount: 500,
    currency: "USDC",
    method: "Crypto (USDC)",
    status: "Pending",
    date: "2024-07-25",
  },
  {
    id: "PO-002",
    amount: 1200,
    currency: "USD",
    method: "Bank Transfer",
    status: "Completed",
    date: "2024-07-20",
  },
  {
    id: "PO-003",
    amount: 75,
    currency: "ETH",
    method: "Crypto (ETH)",
    status: "Failed",
    date: "2024-07-18",
  },
]

interface PayoutMethod {
  id: string
  type: "bank" | "card" | "paypal" | "wise"
  name: string
  details: string
  icon: string
  processingTime: string
  fees: string
}

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  routingNumber: string
  accountType: "checking" | "savings"
  country: string
}

const PAYOUT_METHODS: PayoutMethod[] = [
  {
    id: "bank_transfer",
    type: "bank",
    name: "Bank Transfer",
    details: "Direct to your bank account",
    icon: "🏦",
    processingTime: "1-3 business days",
    fees: "$0.50"
  },
  {
    id: "debit_card",
    type: "card", 
    name: "Debit Card",
    details: "Instant to your card",
    icon: "💳",
    processingTime: "Instant",
    fees: "1.5%"
  },
  {
    id: "paypal",
    type: "paypal",
    name: "PayPal",
    details: "To your PayPal account",
    icon: "🅿️",
    processingTime: "Instant",
    fees: "1.0%"
  },
  {
    id: "wise",
    type: "wise",
    name: "Wise Transfer",
    details: "Global bank transfer",
    icon: "🌍",
    processingTime: "1-2 business days",
    fees: "$0.75"
  }
]

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "bank_001",
    bankName: "Chase Bank",
    accountNumber: "****1234",
    routingNumber: "021000021",
    accountType: "checking",
    country: "US"
  },
  {
    id: "bank_002", 
    bankName: "Bank of America",
    accountNumber: "****5678",
    routingNumber: "111000025",
    accountType: "savings", 
    country: "US"
  }
]

export default function PayoutModule() {
  const { isConnected, address } = useWallet()
  const [selectedMethod, setSelectedMethod] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [amount, setAmount] = useState("")
  const [customDetails, setCustomDetails] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStep, setTxStep] = useState<"form" | "processing" | "success">("form")
  const [txHash, setTxHash] = useState("")
  const [txId, setTxId] = useState("")


  // Mock USDC balance
  const usdcBalance = 1250.75

  const selectedPayoutMethod = PAYOUT_METHODS.find(m => m.id === selectedMethod)
  const selectedBankAccount = MOCK_BANK_ACCOUNTS.find(b => b.id === selectedBank)
  
  const calculateFee = () => {
    if (!selectedPayoutMethod || !amount) return 0
    const amountNum = parseFloat(amount)
    if (selectedPayoutMethod.id === "debit_card") return amountNum * 0.015
    if (selectedPayoutMethod.id === "paypal") return amountNum * 0.01
    if (selectedPayoutMethod.id === "wise") return 0.75
    return 0.50 // bank transfer default
  }

  const totalReceived = () => {
    const amountNum = parseFloat(amount) || 0
    return Math.max(0, amountNum - calculateFee())
  }

  const handleRequestPayout = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!amount || !selectedMethod || parseFloat(amount) <= 0 || parseFloat(amount) > usdcBalance) {
      toast({
        title: "Invalid payout request",
        description: "Please check amount and payout method",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setTxStep("processing")

    // Create transaction record as "Processing"
    const transactionId = addTransactionToHistory({
      type: "Payout Request",
      status: "Processing", 
      amount: parseFloat(amount),
      token: "USDC",
      usdValue: parseFloat(amount),
      from: address || "Connected Wallet",
      to: selectedPayoutMethod?.name || "Bank Account",
      chain: "Off-chain", // Payouts are off-chain to traditional finance
      txHash: "pending...",
      details: `${selectedPayoutMethod?.name} withdrawal • Fee: $${calculateFee().toFixed(2)} • Net: $${totalReceived().toFixed(2)}${selectedBankAccount ? ` to ${selectedBankAccount.bankName}` : ""}${customDetails ? ` • ${customDetails}` : ""}`
    })

    setTxId(transactionId || "")

    toast({
      title: "💳 Processing Payout Request",
      description: `Withdrawing $${amount} via ${selectedPayoutMethod?.name}`,
    })

    // Simulate payout processing with realistic delay (3-8 seconds for verification)
    setTimeout(() => {
      const success = Math.random() > 0.08 // 92% success rate for payouts (some KYC/compliance fails)
      const mockTxHash = success ? `payout_${Date.now()}_${Math.random().toString(36).substring(2, 8)}` : "failed"
      
      setTxHash(mockTxHash)
      setTxStep("success")
      setIsProcessing(false)

      // Update transaction with final status
      if (transactionId) {
        updateTransactionStatus(transactionId, success ? "Completed" : "Failed", mockTxHash)
      }

      if (success) {
        toast({
          title: "✅ Payout Request Approved!",
          description: `$${totalReceived().toFixed(2)} will arrive in ${selectedPayoutMethod?.processingTime}`,
        })
      } else {
        toast({
          title: "❌ Payout Request Failed",
          description: "Request failed due to compliance check. Please contact support.",
          variant: "destructive"
        })
      }
    }, 3000 + Math.random() * 5000)
  }

  const resetForm = () => {
    setTxStep("form")
    setAmount("")
    setCustomDetails("")
    setTxHash("")
    setTxId("")
  }

  if (txStep === "success") {
    const isSuccess = txHash !== "failed"
    return (
      <div className="space-y-6">
        <Card className={`${isSuccess ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' : 'bg-gradient-to-br from-red-900/20 to-rose-900/20 border-red-700'}`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto ${isSuccess ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mb-4`}>
              {isSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className={`${isSuccess ? 'text-green-400' : 'text-red-400'} text-2xl`}>
              {isSuccess ? "Payout Approved! 💳" : "Payout Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-400">
                {isSuccess ? "Amount Being Processed" : "Request Failed"}
              </p>
              <p className="text-3xl font-bold text-white">
                {isSuccess ? `$${totalReceived().toFixed(2)}` : "Failed"}
              </p>
              <p className="text-sm text-slate-300">
                {isSuccess ? `via ${selectedPayoutMethod?.name}` : "Request rejected"}
              </p>
              {isSuccess && selectedBankAccount && (
                <p className="text-sm text-slate-300">
                  to {selectedBankAccount.bankName} {selectedBankAccount.accountNumber}
                </p>
              )}
              {isSuccess && (
                <p className="text-xs text-slate-400">
                  ETA: {selectedPayoutMethod?.processingTime}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge className="bg-blue-600">Payout Request</Badge>
              <Badge className="bg-purple-600">KYC Verified</Badge>
              <Badge className={isSuccess ? "bg-green-600" : "bg-red-600"}>
                {isSuccess ? selectedPayoutMethod?.name : "Compliance Failed"}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetForm} className="flex-1 bg-gradient-primary">
                {isSuccess ? "Request Another" : "Try Again"}
              </Button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-800/30 rounded p-3">
              💡 <strong>Check History Tab:</strong> This payout request has been tracked in your transaction history 
              {isSuccess && " with a real reference ID for monitoring!"}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (txStep === "processing") {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-white text-xl">Processing Payout...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-900/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Verifying payout request...</span>
              </div>
              <p className="text-sm text-blue-200">
                • Checking KYC compliance status
                <br />• Verifying sufficient USDC balance
                <br />• Processing ${totalReceived().toFixed(2)} withdrawal
                <br />• Adding to transaction history for tracking
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">
                Payout verification typically takes 30-60 seconds
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full px-4 py-2 mb-4">
          <CreditCard className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Instant Payouts</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-lg text-slate-400">Convert your USDC to traditional currency instantly</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-green-900/30 border-blue-700 max-w-lg mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Available Balance</p>
          <p className="text-4xl font-bold text-white mb-1">${usdcBalance.toLocaleString()}</p>
          <p className="text-blue-300 text-sm">USDC ready for withdrawal</p>
        </CardContent>
      </Card>

      {/* Payout Form */}
      <Card className="bg-slate-800 border-slate-700 text-white card-glow max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-300">Request Payout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="space-y-4">
            <Label className="text-slate-300 font-medium">Withdrawal Amount</Label>
            
            <div>
              <Label htmlFor="amount" className="text-slate-400 text-sm">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                max={usdcBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400 mt-1">
                Maximum: ${usdcBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Payout Method */}
          <div className="space-y-4">
            <Label className="text-slate-300 font-medium">Payout Method</Label>
            
            <div>
              <Label htmlFor="payout-method" className="text-slate-400 text-sm">Select Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger id="payout-method" className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choose payout method..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {PAYOUT_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{method.icon}</span>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-xs text-slate-400">
                            {method.processingTime} • Fee: {method.fees}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bank Account Selection for Bank Transfer */}
            {selectedMethod === "bank_transfer" && (
              <div>
                <Label htmlFor="bank-account" className="text-slate-400 text-sm">Bank Account</Label>
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger id="bank-account" className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select bank account..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {MOCK_BANK_ACCOUNTS.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        <div className="flex items-center">
                                                     <Building2 className="w-4 h-4 mr-2" />
                          <div>
                            <div className="font-medium">{bank.bankName}</div>
                            <div className="text-xs text-slate-400">
                              {bank.accountNumber} • {bank.accountType}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Details for other methods */}
            {selectedMethod && selectedMethod !== "bank_transfer" && (
              <div>
                <Label htmlFor="custom-details" className="text-slate-400 text-sm">
                  {selectedMethod === "paypal" ? "PayPal Email" : 
                   selectedMethod === "debit_card" ? "Card Details" : 
                   "Account Details"}
                </Label>
                <Input
                  id="custom-details"
                  type="text"
                  placeholder={
                    selectedMethod === "paypal" ? "your@email.com" :
                    selectedMethod === "debit_card" ? "****1234" :
                    "Account details..."
                  }
                  value={customDetails}
                  onChange={(e) => setCustomDetails(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          {/* Fee Breakdown */}
          {selectedPayoutMethod && amount && (
            <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-700">
              <p className="text-yellow-400 text-sm font-medium">Fee Breakdown:</p>
              <div className="text-sm text-yellow-200 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span>${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>-${calculateFee().toFixed(2)}</span>
                </div>
                <Separator className="bg-yellow-700/30" />
                <div className="flex justify-between font-bold">
                  <span>You Receive:</span>
                  <span>${totalReceived().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-slate-700" />

          {/* Transaction Summary */}
          <div className="space-y-2 text-sm">
            <h3 className="font-medium text-white">Payout Summary:</h3>
            <div className="flex justify-between text-slate-300">
              <span>Withdraw from:</span>
              <span>USDC Balance</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Amount:</span>
              <span>${amount || "0"}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Method:</span>
              <span>{selectedPayoutMethod?.name || "Not selected"}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Processing time:</span>
              <span>{selectedPayoutMethod?.processingTime || "N/A"}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Network:</span>
              <span>Off-chain settlement</span>
            </div>
          </div>

          <Button
            onClick={handleRequestPayout}
            disabled={!isConnected || !amount || !selectedMethod || isProcessing || parseFloat(amount) <= 0 || parseFloat(amount) > usdcBalance || (selectedMethod === "bank_transfer" && !selectedBank) || (selectedMethod !== "bank_transfer" && !customDetails)}
            className="w-full bg-gradient-primary text-white hover:opacity-90 disabled:opacity-50"
          >
            {!isConnected ? (
              "Connect Wallet First"
            ) : isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Request Payout
              </>
            )}
          </Button>

          <div className="text-xs text-slate-400 bg-slate-700/30 rounded p-3">
            💡 <strong>Live Testing:</strong> This will create a real payout entry in your History tab with 
            a reference ID for tracking the withdrawal process!
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Instant Processing</h3>
            <p className="text-sm text-slate-400">Most payouts processed within minutes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Low Fees</h3>
            <p className="text-sm text-slate-400">Competitive rates starting from $0.50</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardContent className="p-4 text-center">
                         <Building2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-medium mb-1">Multiple Methods</h3>
            <p className="text-sm text-slate-400">Bank, card, PayPal, and Wise transfers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
