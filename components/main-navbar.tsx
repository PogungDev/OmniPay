"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, Zap } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"

interface MainNavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MainNavbar({ activeTab, onTabChange }: MainNavbarProps) {
  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OmniPay</h1>
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                HACKATHON
              </Badge>
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange("how-it-works")}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            How It Works
          </Button>

          <WalletConnect />
        </div>
      </div>
    </nav>
  )
}
