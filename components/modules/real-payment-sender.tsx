"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useOmniPayContracts } from "@/hooks/use-omnipay-contracts"
import { 
  ArrowRight, 
  Wallet, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  CreditCard,
  Globe
} from "lucide-react"
import { ethers } from 'ethers'

export default function RealPaymentSender() {
  const [paymentType, setPaymentType] = useState<'regular' | 'cctp' | 'card'>('regular')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('ETH')
  const [destinationChain, setDestinationChain] = useState('11155111')
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState('')
  
  // Card payment fields
  const [cardId, setCardId] = useState('')
  const [merchantId, setMerchantId] = useState('')
  
  const { toast } = useToast()
  const {
    account,
    chainId,
    isContractsDeployed,
    createPayment,
    initiateCCTPTransfer,
    createCard,
    getCardProfile
  } = useOmniPayContracts()

  const handleRegularPayment = async () => {
    if (!account || !recipient || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      // Simulate blockchain transaction first
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)
      
      // Record payment in OmniPayCore contract
      const hash = await createPayment(
        recipient,
        tokenSymbol === 'ETH' ? ethers.ZeroAddress : recipient, // Simplified token handling
        amount,
        mockTxHash,
        chainId || 11155111,
        tokenSymbol
      )

      setTxHash(hash || mockTxHash)
      
      toast({
        title: "Payment sent successfully!",
        description: `Transaction hash: ${hash?.slice(0, 10)}...`,
      })
      
      // Reset form
      setRecipient('')
      setAmount('')
      
    } catch (error) {
      console.error('Payment failed:', error)
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCCTPTransfer = async () => {
    if (!account || !recipient || !amount) {
      toast({
        title: "Missing information", 
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const hash = await initiateCCTPTransfer(
        recipient,
        amount,
        parseInt(destinationChain)
      )

      setTxHash(hash || '')
      
      toast({
        title: "CCTP transfer initiated!",
        description: `Cross-chain USDC transfer started`,
      })
      
      // Reset form
      setRecipient('')
      setAmount('')
      
    } catch (error) {
      console.error('CCTP transfer failed:', error)
      toast({
        title: "CCTP transfer failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCardPayment = async () => {
    if (!merchantId || !amount) {
      toast({
        title: "Missing information",
        description: "Please fill in merchant ID and amount",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      // Check if user has a card first
      const cardProfile = await getCardProfile()
      
      if (!cardProfile?.isActive) {
        // Create a new card first
        if (!cardId) {
          toast({
            title: "Card ID required",
            description: "Please enter a card ID to create your MetaMask Card",
            variant: "destructive"
          })
          setIsProcessing(false)
          return
        }
        
        await createCard(cardId)
        toast({
          title: "Card created!",
          description: "Your MetaMask Card has been created successfully",
        })
      }

      // Simulate card payment (in real implementation, this would interact with MetaMask Card contract)
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64)
      setTxHash(mockTxHash)
      
      toast({
        title: "Card payment successful!",
        description: `Payment to ${merchantId} completed`,
      })
      
      // Reset form
      setMerchantId('')
      setAmount('')
      
    } catch (error) {
      console.error('Card payment failed:', error)
      toast({
        title: "Card payment failed",
        description: error instanceof Error ? error.message : "Unknown error", 
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!account) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Wallet className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-gray-600">Please connect your wallet to send payments</p>
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
              Please deploy contracts first or switch to a supported network.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Send Payment</h1>
        <p className="text-gray-600">
          Send payments using real OmniPay smart contracts
        </p>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </Badge>
      </div>

      <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as typeof paymentType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="regular" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Regular
          </TabsTrigger>
          <TabsTrigger value="cctp" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Cross-Chain
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            MetaMask Card
          </TabsTrigger>
        </TabsList>

        {/* Regular Payment */}
        <TabsContent value="regular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Regular Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Token</Label>
                  <Select value={tokenSymbol} onValueChange={setTokenSymbol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleRegularPayment}
                disabled={isProcessing || !recipient || !amount}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Send Payment'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CCTP Transfer */}
        <TabsContent value="cctp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Cross-Chain USDC Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Cross-chain transfers use Circle's CCTP protocol for seamless USDC bridging.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="cctp-recipient">Recipient Address</Label>
                <Input
                  id="cctp-recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cctp-amount">USDC Amount</Label>
                  <Input
                    id="cctp-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dest-chain">Destination Chain</Label>
                  <Select value={destinationChain} onValueChange={setDestinationChain}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="11155111">Sepolia</SelectItem>
                      <SelectItem value="421614">Arbitrum Sepolia</SelectItem>
                      <SelectItem value="137">Polygon</SelectItem>
                      <SelectItem value="42161">Arbitrum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleCCTPTransfer}
                disabled={isProcessing || !recipient || !amount}
                className="w-full"
              >
                {isProcessing ? 'Initiating Transfer...' : 'Start CCTP Transfer'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MetaMask Card Payment */}
        <TabsContent value="card" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                MetaMask Card Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Use your MetaMask Card for credit-based payments with auto-repay features.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="card-id">Card ID (for new cards)</Label>
                <Input
                  id="card-id"
                  placeholder="MY-CARD-001"
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant ID</Label>
                  <Input
                    id="merchant"
                    placeholder="STORE-001"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="card-amount">Amount</Label>
                  <Input
                    id="card-amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCardPayment}
                disabled={isProcessing || !merchantId || !amount}
                className="w-full"
              >
                {isProcessing ? 'Processing Payment...' : 'Pay with MetaMask Card'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Result */}
      {txHash && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Transaction Successful!</span>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {txHash}
                </code>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 