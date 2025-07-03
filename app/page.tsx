import ContractIntegrationDashboard from "@/components/modules/contract-integration-dashboard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "OmniPay | Smart Contract Integration",
  description: "Experience real blockchain payments with integrated smart contracts, cross-chain transfers, and MetaMask Card support"
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <ContractIntegrationDashboard />
      </div>
    </div>
  )
}
