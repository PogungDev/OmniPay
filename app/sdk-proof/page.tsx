import SDKProofModule from "@/components/modules/sdk-proof-module"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "SDK Integration Proof | OmniPay",
  description: "Live demonstration of MetaMask SDK, LI.FI SDK, and Circle Wallets integration"
}

export default function SDKProofPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <SDKProofModule />
      </div>
    </div>
  )
} 