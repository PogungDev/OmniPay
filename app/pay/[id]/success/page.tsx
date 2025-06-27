"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, ArrowLeft, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SuccessPageProps {
  params: {
    id: string
  }
}

export default function PaymentSuccessPage({ params }: SuccessPageProps) {
  const { toast } = useToast()

  // Mock payment data
  const paymentData = {
    id: params.id,
    businessName: "Bali Coffee Co",
    productName: "Premium Coffee",
    amount: "5",
    txHash: "0xabc123def456789012345678901234567890abcdef123456789012345678901234",
    customerPaid: "0.002 ETH",
    merchantReceived: "$5 USDC",
    chain: "Polygon",
    explorerUrl: "https://polygonscan.com/tx/0xabc123def456789012345678901234567890abcdef123456789012345678901234",
  }

  const copyTxHash = () => {
    navigator.clipboard.writeText(paymentData.txHash)
    toast({
      title: "Copied!",
      description: "Transaction hash copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-12 text-center space-y-8">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">🎉 Payment Successful!</h1>
            <p className="text-xl text-white/80">
              You've successfully paid <span className="text-green-400 font-semibold">${paymentData.amount} USDC</span>{" "}
              to <span className="text-blue-400 font-semibold">{paymentData.businessName}</span>
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Payment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <p className="text-white/60 text-sm">Product</p>
                <p className="text-white font-medium">{paymentData.productName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-white/60 text-sm">Merchant</p>
                <p className="text-white font-medium">{paymentData.businessName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-white/60 text-sm">You Paid</p>
                <p className="text-white font-medium">{paymentData.customerPaid}</p>
              </div>

              <div className="space-y-2">
                <p className="text-white/60 text-sm">Merchant Received</p>
                <p className="text-green-400 font-medium">{paymentData.merchantReceived}</p>
              </div>

              <div className="space-y-2">
                <p className="text-white/60 text-sm">Network</p>
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  {paymentData.chain}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-white/60 text-sm">Status</p>
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Confirmed
                </Badge>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="space-y-2">
              <p className="text-white/60 text-sm">Transaction Hash</p>
              <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                <code className="text-green-400 text-sm flex-1 truncate">{paymentData.txHash}</code>
                <Button variant="ghost" size="sm" onClick={copyTxHash} className="text-white hover:bg-white/10">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link href={paymentData.explorerUrl} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Link>
            </Button>

            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Merchant
              </Link>
            </Button>
          </div>

          {/* Thank You Message */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-white/60">Thank you for using OmniPay! Your payment has been processed securely.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
