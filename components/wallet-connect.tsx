"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Zap, Shield, Users } from "lucide-react"
import { useWallet } from "./wallet-provider"

export function WalletConnect() {
  const { connectWallet, walletState } = useWallet()

  const handleConnect = async () => {
    try {
      await connectWallet('metamask')
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  const handleCircleConnect = async () => {
    try {
      await connectWallet('circle')
    } catch (error) {
      console.error('Circle connection failed:', error)
    }
  }

  if (walletState.isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            {walletState.provider === 'metamask' && "MetaMask"}
            {walletState.provider === 'circle' && "Circle Wallet"}
            {walletState.provider === 'demo' && "Demo Mode"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="font-mono text-sm">
              {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
            </div>
            <div className="text-lg font-semibold">
              {walletState.balance} ETH
            </div>
            {walletState.isDemo && (
              <Badge variant="secondary" className="mt-2">
                Demo Mode
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
        <p className="text-muted-foreground">
          Choose your preferred wallet to start using OmniPay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MetaMask Card */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              MetaMask
            </CardTitle>
            <CardDescription>
              The most popular Ethereum wallet for Web3
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Fast & Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Self-Custody</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-500" />
                <span>100M+ Users</span>
              </div>
            </div>
            <Button 
              onClick={handleConnect}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Connect MetaMask
            </Button>
          </CardContent>
        </Card>

        {/* Circle Wallets Card */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              Circle Wallet
            </CardTitle>
            <CardDescription>
              Programmable wallets for seamless Web3 onboarding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>No Seed Phrase</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Enterprise Grade</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-500" />
                <span>Easy Onboarding</span>
              </div>
            </div>
            <Button 
              onClick={handleCircleConnect}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Connect Circle Wallet
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have a wallet? Download{" "}
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            MetaMask
          </a>{" "}
          to get started
        </p>
      </div>
    </div>
  )
}
