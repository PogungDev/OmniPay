"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Shield, HelpCircle, Zap, Clock, CheckCircle } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { WalletConnect } from "@/components/wallet-connect"
import { SUPPORTED_CHAINS } from "@/config/chains"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface CheckoutPageProps {
  params: {
    id: string
  }
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { account, chainId, isConnected, isDummy } = useWallet()
  const { toast } = useToast()
  const router = useRouter()

  // Mock checkout data
  const [checkoutData] = useState({
    id: params.id,
    businessName: "Bali Coffee Co",
    productName: "Premium Coffee",
    amount: "5",
    targetChain: 137, // Polygon
    merchantAddress: "0x742d35Cc6634C0532925a3b8D0C9964E5Bfe8b4C",
  })

  const [fromToken, setFromToken] = useState("ETH")
  const [fromChain, setFromChain] = useState<number>(1)
  const [isPaying, setIsPaying] = useState(false)

  const handlePayment = async () => {
    if (!account || !fromToken) {
      toast({
        title: "Error",
        description: "Please connect wallet and select token",
        variant: "destructive",
      })
      return
    }

    setIsPaying(true)
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast({
        title: "Payment Successful!",
        description: `${checkoutData.amount} USDC sent to ${checkoutData.businessName}`,
      })

      // Redirect to success page
      router.push(`/pay/${params.id}/success`)
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      {/* Customer Checkout Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Link>
            </Button>

            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Secure Checkout</span>
            </div>

            <Button variant="ghost" className="text-white hover:bg-white/10">
              <HelpCircle className="w-4 h-4 mr-2" />
              Need Help?
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {!isConnected ? (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-white">🛍️ Secure Checkout</h2>
              <p className="text-white/70 mb-8">Connect your wallet to complete payment</p>
              <WalletConnect size="lg" className="w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-white mb-2">🛍️ OmniPay Checkout</CardTitle>
              <p className="text-white/60">Powered by MetaMask + LI.FI + Circle</p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Payment Details */}
              <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-2">{checkoutData.businessName}</h3>
                <p className="text-white/60 mb-4">{checkoutData.productName}</p>

                <div className="text-5xl font-bold text-green-400 mb-4">${checkoutData.amount} USDC</div>

                <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
                  <span>Merchant receives on</span>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {SUPPORTED_CHAINS[checkoutData.targetChain]?.name}
                  </Badge>
                </div>

                <p className="text-xs text-white/40 mt-2">
                  To: {checkoutData.merchantAddress.slice(0, 8)}...{checkoutData.merchantAddress.slice(-6)}
                </p>
              </div>

              <Separator className="bg-white/10" />

              {/* Payment Method Selection */}
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-white mb-2">Choose how to pay:</h4>
                  <p className="text-white/60">Pay with any token, merchant gets USDC</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Pay with</Label>
                    <Select value={fromToken} onValueChange={setFromToken}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        <SelectItem value="ETH" className="text-white">
                          ETH (2.5 available)
                        </SelectItem>
                        <SelectItem value="MATIC" className="text-white">
                          MATIC (1000 available)
                        </SelectItem>
                        <SelectItem value="USDT" className="text-white">
                          USDT (50 available)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">From chain</Label>
                    <Select
                      value={fromChain.toString()}
                      onValueChange={(value) => setFromChain(Number.parseInt(value))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        {Object.values(SUPPORTED_CHAINS).map((chain) => (
                          <SelectItem key={chain.id} value={chain.id.toString()} className="text-white">
                            {chain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Preview */}
                <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center justify-between text-lg mb-2">
                    <span className="text-white/80">You pay approximately:</span>
                    <span className="text-white font-bold">0.002 {fromToken}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-white/80">Merchant receives:</span>
                    <span className="text-green-400 font-bold">${checkoutData.amount} USDC</span>
                  </div>
                  <div className="text-center mt-4 text-sm text-white/60">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Best route automatically selected by LI.FI
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={!fromToken || isPaying}
                className="w-full h-16 text-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isPaying ? (
                  <>
                    <Clock className="w-6 h-6 mr-3 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    Pay ${checkoutData.amount} USDC Now
                  </>
                )}
              </Button>

              {/* Security Footer */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-white/60">
                  <Shield className="w-4 h-4" />
                  <span>Secured by MetaMask • LI.FI • Circle USDC</span>
                </div>
                {isDummy && <div className="text-yellow-400 text-sm">Demo mode: All transactions are simulated</div>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
