"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { toast } from "@/hooks/use-toast"

export function WalletConnect() {
  const { address, chainId, isConnected, isDemoMode, connect, disconnect, switchChain } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      toast({
        title: "Wallet Connected!",
        description: "Successfully connected to MetaMask",
      })
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Could not connect to MetaMask. Please make sure it's installed and try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      })
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const viewOnExplorer = () => {
    if (address && chainId) {
      const explorerUrls: Record<number, string> = {
        1: "https://etherscan.io",
        137: "https://polygonscan.com",
        42161: "https://arbiscan.io",
        10: "https://optimistic.etherscan.io",
        8453: "https://basescan.org",
        11155111: "https://sepolia.etherscan.io",
      }

      const explorerUrl = explorerUrls[chainId]
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, "_blank")
      }
    }
  }

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      42161: "Arbitrum",
      10: "Optimism",
      8453: "Base",
      11155111: "Sepolia",
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  const getChainColor = (chainId: number): string => {
    const chainColors: Record<number, string> = {
      1: "bg-blue-500",
      137: "bg-purple-500",
      42161: "bg-blue-400",
      10: "bg-red-500",
      8453: "bg-blue-600",
      11155111: "bg-yellow-500",
    }
    return chainColors[chainId] || "bg-gray-500"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${chainId ? getChainColor(chainId) : "bg-gray-500"}`} />
            <span className="font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            {isDemoMode && (
              <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300">
                DEMO
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 bg-slate-800 border-slate-700 text-white">
        <div className="px-3 py-2 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Connected to</span>
            {isDemoMode && (
              <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300">
                DEMO MODE
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-3 h-3 rounded-full ${chainId ? getChainColor(chainId) : "bg-gray-500"}`} />
            <span className="font-medium">{chainId ? getChainName(chainId) : "Unknown"}</span>
          </div>
        </div>

        <div className="px-3 py-2 border-b border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Wallet Address</div>
          <div className="font-mono text-sm text-white break-all">{address}</div>
        </div>

        <DropdownMenuItem onClick={copyAddress} className="hover:bg-slate-700">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem onClick={viewOnExplorer} className="hover:bg-slate-700">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>

        {isDemoMode && (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <div className="px-3 py-2">
              <div className="flex items-center text-yellow-400 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Demo Mode Active
              </div>
              <div className="text-xs text-slate-400 mt-1">Connect MetaMask for real transactions</div>
            </div>
          </>
        )}

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem onClick={handleDisconnect} className="text-red-400 hover:bg-slate-700 hover:text-red-300">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
