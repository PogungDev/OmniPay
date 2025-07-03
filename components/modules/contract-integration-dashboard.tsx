"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useOmniPayContracts, UserProfile } from "@/hooks/use-omnipay-contracts"
import { 
  Wallet, 
  Send, 
  History, 
  CreditCard, 
  Globe, 
  Shield, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Settings,
  Info
} from "lucide-react"
import Link from "next/link"

export default function ContractIntegrationDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  
  const { toast } = useToast()
  const {
    account,
    chainId,
    isContractsDeployed,
    registerUser,
    getUserProfile,
    getUserPayments,
    getCardProfile
  } = useOmniPayContracts()

  // Load user profile
  const loadProfile = async () => {
    if (!account) return
    
    setIsLoading(true)
    try {
      const profile = await getUserProfile()
      setUserProfile(profile)
      
      if (profile && profile.name) {
        setShowProfile(true)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Register new user
  const handleRegisterUser = async () => {
    const name = prompt("Enter your name:")
    const email = prompt("Enter your email:")
    
    if (!name || !email) return
    
    setIsLoading(true)
    try {
      await registerUser(name, email)
      await loadProfile() // Reload profile after registration
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load profile on account change
  useEffect(() => {
    loadProfile()
  }, [account])

  const contractFeatures = [
    {
      title: "OmniPayCore",
      description: "User registration, payment creation, and basic payment tracking",
      address: process.env.NEXT_PUBLIC_OMNIPAY_CORE,
      icon: <Shield className="w-5 h-5" />,
      status: isContractsDeployed ? "deployed" : "mock",
      features: ["User Registration", "Payment Creation", "Quick Send Contacts", "Payment History"]
    },
    {
      title: "OmniPayCCTP", 
      description: "Cross-chain USDC transfers using Circle's CCTP protocol",
      address: process.env.NEXT_PUBLIC_OMNIPAY_CCTP,
      icon: <Globe className="w-5 h-5" />,
      status: isContractsDeployed ? "deployed" : "mock",
      features: ["Cross-Chain USDC", "Circle CCTP Integration", "Multi-Chain Support", "Attestation Tracking"]
    },
    {
      title: "OmniPayCard",
      description: "MetaMask Card integration with credit and auto-repay features",
      address: process.env.NEXT_PUBLIC_OMNIPAY_CARD,
      icon: <CreditCard className="w-5 h-5" />,
      status: isContractsDeployed ? "deployed" : "mock",
      features: ["Card Creation", "Credit Lines", "Auto-Repay", "Cross-Chain Balances"]
    }
  ]

  const dashboardStats = [
    {
      title: "Total Sent",
      value: userProfile?.totalSent || "0",
      unit: "ETH",
      icon: <Send className="w-4 h-4" />,
      color: "text-blue-600"
    },
    {
      title: "Total Received", 
      value: userProfile?.totalReceived || "0",
      unit: "ETH",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-green-600"
    },
    {
      title: "Transactions",
      value: userProfile?.transactionCount || "0",
      unit: "",
      icon: <History className="w-4 h-4" />,
      color: "text-purple-600"
    },
    {
      title: "Network",
      value: chainId?.toString() || "Unknown",
      unit: "",
      icon: <Globe className="w-4 h-4" />,
      color: "text-orange-600"
    }
  ]

  const quickActions = [
    {
      title: "Send Payment",
      description: "Send payments using real smart contracts",
      href: "/send",
      icon: <Send className="w-5 h-5" />,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "View History",
      description: "Check your transaction history", 
      href: "/history",
      icon: <History className="w-5 h-5" />,
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "MetaMask Card",
      description: "Manage your MetaMask Card",
      href: "/send?tab=card",
      icon: <CreditCard className="w-5 h-5" />,
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Cross-Chain",
      description: "Transfer USDC across chains",
      href: "/send?tab=cctp", 
      icon: <Globe className="w-5 h-5" />,
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ]

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="text-center p-8">
          <CardContent>
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect MetaMask to start using OmniPay smart contracts
            </p>
            <Button size="lg">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">OmniPay Dashboard</h1>
          <p className="text-gray-600">Smart Contract Integration Demo</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </Badge>
          {isContractsDeployed ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Contracts Deployed
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="w-3 h-3 mr-1" />
              Mock Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Network Alert */}
      {!isContractsDeployed && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Demo Mode:</strong> Contracts are not deployed on this network. 
            The interface will simulate contract interactions for demonstration purposes.
            Add your private key and deploy to Sepolia for real functionality.
          </AlertDescription>
        </Alert>
      )}

      {/* User Profile Section */}
      {!showProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Register your profile to start using OmniPay smart contracts
              </p>
              <Button 
                onClick={handleRegisterUser}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? 'Registering...' : 'Register Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showProfile && userProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Welcome, {userProfile.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboardStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`${stat.color} mb-1`}>
                    {stat.icon}
                  </div>
                  <div className="font-semibold">
                    {stat.value} {stat.unit}
                  </div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={action.href}>
              <CardContent className="p-6 text-center">
                <div className={`${action.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Smart Contract Overview */}
      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contractFeatures.map((contract, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {contract.icon}
                    {contract.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{contract.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Status:</span>
                      <Badge variant={contract.status === 'deployed' ? 'default' : 'secondary'}>
                        {contract.status}
                      </Badge>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500">Address:</span>
                      <div className="font-mono mt-1 break-all">
                        {contract.address?.slice(0, 10)}...{contract.address?.slice(-8)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Features:</h4>
                    <ul className="text-xs space-y-1">
                      {contract.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View on Explorer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>✅ Implemented Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Smart Contract Integration Hooks
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time Contract State Reading
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Transaction Broadcasting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Multi-Chain Support Configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Circle CCTP Integration Framework
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    MetaMask Card Integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🚀 Ready for Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Environment Configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Deployment Scripts Ready
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Frontend Contract Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Error Handling & Fallbacks
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Transaction History Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    Real-time Updates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🛠️ Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">1. Deploy Smart Contracts</h4>
                  <p className="text-sm text-gray-600">
                    Add your private key to `.env.local` and run deployment script to Sepolia testnet
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                    npx hardhat run scripts/deploy-full-stack.js --network sepolia
                  </code>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">2. Update Environment Variables</h4>
                  <p className="text-sm text-gray-600">
                    Copy deployed addresses to your `.env.local` file
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                    NEXT_PUBLIC_OMNIPAY_CORE=0x...
                  </code>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">3. Test Integration</h4>
                  <p className="text-sm text-gray-600">
                    Use the Send Payment and History pages to test real contract interactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 