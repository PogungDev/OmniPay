import RealTransactionHistory from "@/components/modules/real-transaction-history"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Transaction History | OmniPay",
  description: "View your payment history, cross-chain transfers, and MetaMask Card transactions"
}

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <RealTransactionHistory />
      </div>
    </div>
  )
}
