"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, Wallet, Shield, Users, Zap, HelpCircle } from "lucide-react"
import Link from "next/link"

interface WalletConnector {
  name: string
  icon: string
  description: string
  features: string[]
  buttonText: string
  buttonColor: string
  connect: () => Promise<void>
}

export default function HomePage() {
  const [connectedAddress, setConnectedAddress] = useState<string>("")
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkExistingConnection()
  }, [])

  const checkExistingConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })
        if (accounts.length > 0) {
          setConnectedAddress(accounts[0])
        }
      } catch (error) {
        console.log("No existing connection found")
      }
    }
  }

  const connectMetaMask = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })
      
      if (accounts.length > 0) {
        setConnectedAddress(accounts[0])
        toast({
          title: "Connected successfully!",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (error) {
      console.error("MetaMask connection failed:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const connectCircleWallet = async () => {
    toast({
      title: "Coming Soon",
      description: "Circle Wallet integration is in development",
    })
  }

  const wallets: WalletConnector[] = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "The most popular Ethereum wallet for Web3",
      features: ["Fast & Secure", "Self-Custody", "100M+ Users"],
      buttonText: "Connect MetaMask",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      connect: connectMetaMask,
    },
    {
      name: "Circle Wallet",
      icon: "🔵",
      description: "Programmable wallets for seamless Web3 onboarding",
      features: ["No Seed Phrase", "Enterprise Grade", "Easy Onboarding"],
      buttonText: "Connect Circle Wallet",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      connect: connectCircleWallet,
    },
  ]

  if (connectedAddress) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="font-medium">OmniPay</span>
                <Badge className="bg-green-500 text-white text-xs px-2 py-1">HACKATHON</Badge>
              </div>
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">
              Wallet Connected Successfully!
            </h1>
            <p className="text-xl text-slate-300">
              Connected Address: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
            </p>
          </div>

          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                🎉 Welcome to OmniPay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-slate-300">
                <p>Your wallet is now connected! You can now:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/send">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💸</span>
                      <span className="font-medium">Send Payment</span>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/history">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📋</span>
                      <span className="font-medium">View History</span>
                    </div>
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => {
                    setConnectedAddress("")
                    toast({
                      title: "Disconnected",
                      description: "Wallet disconnected successfully",
                    })
                  }}
                >
                  Disconnect Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="font-medium">OmniPay</span>
                <Badge className="bg-green-500 text-white text-xs px-2 py-1">HACKATHON</Badge>
              </div>
            </Badge>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose your preferred wallet to start using OmniPay
          </p>

          <div className="flex justify-center">
            <Link href="/how-it-works">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                <HelpCircle className="w-4 h-4 mr-2" />
                How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Wallet Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {wallets.map((wallet) => (
            <Card key={wallet.name} className="bg-slate-800 border-slate-700 text-white hover:border-slate-600 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{wallet.icon}</div>
                <CardTitle className="text-2xl font-bold">{wallet.name}</CardTitle>
                <p className="text-slate-400 text-base">{wallet.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {wallet.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-green-400">
                        {feature === "Fast & Secure" && <Zap className="w-5 h-5" />}
                        {feature === "Self-Custody" && <Shield className="w-5 h-5" />}
                        {feature === "100M+ Users" && <Users className="w-5 h-5" />}
                        {feature === "No Seed Phrase" && <Zap className="w-5 h-5" />}
                        {feature === "Enterprise Grade" && <Shield className="w-5 h-5" />}
                        {feature === "Easy Onboarding" && <Users className="w-5 h-5" />}
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={wallet.connect}
                  disabled={isConnecting}
                  className={`w-full ${wallet.buttonColor} text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105`}
                >
                  {isConnecting && wallet.name === "MetaMask" ? "Connecting..." : wallet.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-slate-500 text-sm">
            Don&apos;t have a wallet?{" "}
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline"
            >
              Download MetaMask
            </a>{" "}
            to get started
          </p>
        </div>
      </div>
    </div>
  )
}
