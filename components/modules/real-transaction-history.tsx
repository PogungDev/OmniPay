"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useOmniPayContracts, Payment, CCTPTransfer, CardProfile } from "@/hooks/use-omnipay-contracts"
import { 
  ArrowRight, 
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Globe,
  Wallet,
  AlertCircle
} from "lucide-react"

export default function RealTransactionHistory() {
  const [activeTab, setActiveTab] = useState<'payments' | 'cctp' | 'card'>('payments')
  const [payments, setPayments] = useState<Payment[]>([])
  const [transfers, setTransfers] = useState<CCTPTransfer[]>([])
  const [cardProfile, setCardProfile] = useState<CardProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { toast } = useToast()
  const {
    account,
    chainId,
    isContractsDeployed,
    getUserPayments,
    getUserProfile,
    getCardProfile
  } = useOmniPayContracts()

  // Load transaction data
  const loadData = async () => {
    if (!account || !isContractsDeployed) return

    setIsLoading(true)
    try {
      // Load regular payments
      const userPayments = await getUserPayments()
      setPayments(userPayments)

      // Load card profile
      const userCardProfile = await getCardProfile()
      setCardProfile(userCardProfile)

      // For demo, add some mock CCTP transfers
      setTransfers([
        {
          transferId: '0x' + Math.random().toString(16).substr(2, 64),
          sender: account,
          recipient: '0x742d35Cc66C4C27bb6e6A83b5C3A1F97b07A6C3E',
          amount: '100.0',
          destinationDomain: 1,
          sourceDomain: 0,
          nonce: '123',
          burnTxHash: '0x' + Math.random().toString(16).substr(2, 64),
          attestation: '0x' + Math.random().toString(16).substr(2, 64),
          status: 2, // completed
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
      ])

      toast({
        title: "Data loaded",
        description: "Transaction history updated"
      })
    } catch (error) {
      console.error('Failed to load data:', error)
      toast({
        title: "Failed to load data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on component mount and account change
  useEffect(() => {
    loadData()
  }, [account, isContractsDeployed])

  const getStatusIcon = (status: string | number) => {
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'completed':
          return <CheckCircle className="w-4 h-4 text-green-500" />
        case 'pending':
          return <Clock className="w-4 h-4 text-yellow-500" />
        case 'failed':
          return <XCircle className="w-4 h-4 text-red-500" />
        default:
          return <Clock className="w-4 h-4 text-gray-500" />
      }
    } else {
      // CCTP status (number)
      switch (status) {
        case 2:
          return <CheckCircle className="w-4 h-4 text-green-500" />
        case 1:
          return <Clock className="w-4 h-4 text-yellow-500" />
        case 0:
          return <Clock className="w-4 h-4 text-blue-500" />
        case 3:
          return <XCircle className="w-4 h-4 text-red-500" />
        default:
          return <Clock className="w-4 h-4 text-gray-500" />
      }
    }
  }

  const getStatusText = (status: string | number) => {
    if (typeof status === 'string') {
      return status.charAt(0).toUpperCase() + status.slice(1)
    } else {
      switch (status) {
        case 0: return 'Pending'
        case 1: return 'Attested'
        case 2: return 'Completed'
        case 3: return 'Failed'
        default: return 'Unknown'
      }
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!account) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wallet className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-gray-600">Please connect your wallet to view transaction history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isContractsDeployed) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              OmniPay contracts are not deployed on this network. 
              Transaction history is not available.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-gray-600">
            View your payments, cross-chain transfers, and card transactions
          </p>
          <Badge variant="secondary" className="mt-2">
            Connected: {formatAddress(account)}
          </Badge>
        </div>
        <Button 
          onClick={loadData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Regular Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="cctp" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Cross-Chain ({transfers.length})
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            MetaMask Card
          </TabsTrigger>
        </TabsList>

        {/* Regular Payments */}
        <TabsContent value="payments" className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Wallet className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="font-semibold">No payments yet</h3>
                    <p className="text-gray-600 text-sm">Your payment history will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(payment.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {payment.sender === account ? 'Sent' : 'Received'}
                            </span>
                            <Badge variant="outline">
                              {payment.tokenSymbol}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.sender === account ? 'To' : 'From'}: {formatAddress(
                              payment.sender === account ? payment.recipient : payment.sender
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {payment.sender === account ? '-' : '+'}
                          {payment.amount} {payment.tokenSymbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(payment.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {getStatusText(payment.status)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CCTP Transfers */}
        <TabsContent value="cctp" className="space-y-4">
          {transfers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Globe className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="font-semibold">No cross-chain transfers</h3>
                    <p className="text-gray-600 text-sm">Your CCTP transfers will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transfers.map((transfer, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(transfer.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Cross-Chain Transfer</span>
                            <Badge variant="outline">USDC</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            To: {formatAddress(transfer.recipient)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          -{transfer.amount} USDC
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(transfer.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={transfer.status === 2 ? 'default' : 'secondary'}>
                          {getStatusText(transfer.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Domain {transfer.sourceDomain} → {transfer.destinationDomain}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* MetaMask Card */}
        <TabsContent value="card" className="space-y-4">
          {cardProfile?.isActive ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    MetaMask Card Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Credit Limit</div>
                      <div className="font-semibold">${cardProfile.creditLimit}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Available Credit</div>
                      <div className="font-semibold text-green-600">${cardProfile.availableCredit}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Current Balance</div>
                      <div className="font-semibold text-red-600">${cardProfile.currentBalance}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Card ID</div>
                      <div className="font-semibold">{cardProfile.cardId}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Created: {formatDate(cardProfile.createdAt)}
                  </div>
                </CardContent>
              </Card>

              {/* Mock card transactions */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-4">
                    <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <h3 className="font-semibold">No card transactions</h3>
                      <p className="text-gray-600 text-sm">Your MetaMask Card transactions will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="font-semibold">No MetaMask Card</h3>
                    <p className="text-gray-600 text-sm">Create a MetaMask Card to see transactions here</p>
                  </div>
                  <Button size="sm">Create Card</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 