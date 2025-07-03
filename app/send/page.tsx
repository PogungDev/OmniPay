import RealPaymentSender from "@/components/modules/real-payment-sender"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Send Payment | OmniPay",
  description: "Send payments using OmniPay smart contracts - Regular, Cross-chain CCTP, and MetaMask Card"
}

export default function SendPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <RealPaymentSender />
      </div>
    </div>
  )
}
