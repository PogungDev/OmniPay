"use client"

import TutorialGuide from "@/components/tutorial-guide"
import { WalletProvider } from "@/components/wallet-provider"

export default function TutorialPage() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <TutorialGuide />
      </div>
    </WalletProvider>
  )
}
