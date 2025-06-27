"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Wallet,
  Send,
  History,
  PieChart,
  CreditCard,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Play,
  BookOpen,
  Target,
  Zap,
} from "lucide-react"

export default function TutorialGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const tutorialSteps = [
    {
      id: 0,
      title: "Connect Your Wallet",
      icon: <Wallet className="w-6 h-6" />,
      duration: "1 min",
      difficulty: "Easy",
      description: "Connect MetaMask or use Demo Mode to get started",
      steps: [
        "Click 'Connect Wallet' button in top right corner",
        "If you have MetaMask: Click 'MetaMask' and approve connection",
        "If no MetaMask: App automatically enters Demo Mode with dummy wallet",
        "Verify connection - you should see your address in top right",
        "Demo Mode shows: 0xDemo...1234 with yellow indicator",
      ],
      tips: [
        "Demo Mode lets you test all features without real crypto",
        "Switch to Sepolia testnet for real blockchain testing",
        "Get free Sepolia ETH from faucets for testing",
      ],
    },
    {
      id: 1,
      title: "Send Your First Payment",
      icon: <Send className="w-6 h-6" />,
      duration: "3 min",
      difficulty: "Easy",
      description: "Send any token cross-chain, recipient gets USDC",
      steps: [
        "Navigate to 'Send' tab in main navigation",
        "Step 1: Select token (ETH, MATIC, ARB) and enter amount",
        "See real-time conversion rate to USDC",
        "Click 'Continue to Recipient'",
        "Step 2: Enter recipient address or select from Quick Contacts",
        "Add new contacts using the '+' button",
        "Review payment summary with fees and estimated time",
        "Click 'Create Payment' to initiate transaction",
        "Step 3: Payment created! Track status in next steps",
      ],
      tips: [
        "Recipients always receive stable USDC regardless of what you send",
        "Cross-chain routing is handled automatically",
        "Save frequent recipients as Quick Contacts",
      ],
    },
    {
      id: 2,
      title: "Track Payment Status",
      icon: <Target className="w-6 h-6" />,
      duration: "2 min",
      difficulty: "Easy",
      description: "Monitor your payment through the remittance pipeline",
      steps: [
        "After creating payment, click 'Track Payment' or go to 'Remittance' tab",
        "See payment status: Processing → Cross-chain Bridge → USDC Delivery",
        "View transaction timeline with estimated completion times",
        "Check recipient options: Auto-Claim vs Manual Claim",
        "Monitor real-time progress updates",
        "Payment completes when recipient receives USDC",
      ],
      tips: [
        "Most payments complete in 2-5 minutes",
        "Auto-claim means funds appear automatically in recipient wallet",
        "Manual claim requires recipient to visit OmniPay dashboard",
      ],
    },
    {
      id: 3,
      title: "View Transaction History",
      icon: <History className="w-6 h-6" />,
      duration: "2 min",
      difficulty: "Easy",
      description: "Track all your payments and transactions",
      steps: [
        "Go to 'History' tab to see all transactions",
        "View stats: Total Transactions, Total Sent, Total Received, Gas Fees",
        "Use search bar to find specific transactions",
        "Filter by Status: All, Completed, Pending, Failed",
        "Filter by Type: Send, Receive, Bridge, Swap, Yield, Payout",
        "Click 'Export CSV' to download transaction history",
        "Click 'View' on any transaction to see blockchain explorer",
      ],
      tips: [
        "Export CSV for tax reporting and accounting",
        "Search works on addresses, transaction IDs, and notes",
        "Refresh button updates with latest blockchain data",
      ],
    },
    {
      id: 4,
      title: "Manage Your Portfolio",
      icon: <PieChart className="w-6 h-6" />,
      duration: "3 min",
      difficulty: "Medium",
      description: "View assets across all chains in one dashboard",
      steps: [
        "Navigate to 'Portfolio' tab",
        "See total portfolio value across all chains",
        "View breakdown by chain: Ethereum, Polygon, Arbitrum, etc.",
        "Check individual token balances and USD values",
        "Use 'Hide Small Balances' to focus on major holdings",
        "Click 'Refresh Balances' to update from blockchain",
        "View performance metrics and allocation charts",
      ],
      tips: [
        "Portfolio aggregates balances from all connected chains",
        "USD values update with real-time price feeds",
        "Use this to track your multi-chain DeFi positions",
      ],
    },
    {
      id: 5,
      title: "Earn Yield on Treasury",
      icon: <Zap className="w-6 h-6" />,
      duration: "5 min",
      difficulty: "Medium",
      description: "Put your crypto to work with automated yield farming",
      steps: [
        "Go to 'Treasury' tab to access yield farming",
        "Overview shows: Total Portfolio, Total Earned, Active Positions",
        "Click 'Deposit' tab to create new yield position",
        "Select token (USDC, ETH, DAI) and enter amount",
        "Review estimated APY and monthly earnings",
        "Click 'Create Yield Position' to start earning",
        "Monitor positions in 'Positions' tab",
        "Claim rewards anytime with 'Claim Yield' button",
        "View analytics for performance tracking",
      ],
      tips: [
        "Start with stablecoins (USDC) for lower risk",
        "Compound rewards by re-investing claimed yields",
        "Diversify across multiple tokens for better risk management",
      ],
    },
    {
      id: 6,
      title: "Withdraw to Bank Account",
      icon: <CreditCard className="w-6 h-6" />,
      duration: "5 min",
      difficulty: "Advanced",
      description: "Convert crypto to fiat and withdraw to your bank",
      steps: [
        "Navigate to 'Payouts' tab",
        "First time: Go to 'Bank Accounts' tab",
        "Add bank account: Bank Name, Account Type, Routing Number, Account Number",
        "Wait for verification (usually instant in demo)",
        "Go to 'Request Payout' tab",
        "Select token to convert (USDC, DAI, USDT)",
        "Enter USD amount (minimum $10)",
        "Choose verified bank account",
        "Review fees (2.5%) and final amount you'll receive",
        "Click 'Request Payout' to initiate withdrawal",
        "Track status in 'Payout History' tab",
      ],
      tips: [
        "Bank verification may take 1-2 business days in production",
        "Payouts typically process in 1-3 business days",
        "Keep some crypto for gas fees on future transactions",
      ],
    },
  ]

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "Advanced":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-4 py-2 mb-4">
          <BookOpen className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Complete Tutorial Guide</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">OmniPay Tutorial A-Z</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Master cross-chain payments, yield farming, and crypto-to-fiat withdrawals. Follow this step-by-step guide to
          unlock all features.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Your Progress</h3>
            <Badge className="bg-purple-500/20 text-purple-400">
              {completedSteps.length}/{tutorialSteps.length} Complete
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{completedSteps.length}</div>
              <div className="text-sm text-gray-400">Steps Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round((completedSteps.length / tutorialSteps.length) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {tutorialSteps.reduce((sum, step) => sum + Number.parseInt(step.duration), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">7</div>
              <div className="text-sm text-gray-400">Core Features</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Steps */}
      <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(Number.parseInt(value))}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-gray-800/50 border border-gray-700/50 mb-8">
          {tutorialSteps.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id.toString()}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 relative"
            >
              <div className="flex items-center space-x-2">
                {completedSteps.includes(step.id) && (
                  <CheckCircle className="w-4 h-4 text-green-400 absolute -top-1 -right-1" />
                )}
                {step.icon}
                <span className="hidden lg:inline">{step.id + 1}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {tutorialSteps.map((step) => (
          <TabsContent key={step.id} value={step.id.toString()} className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {step.icon}
                    <div>
                      <CardTitle className="text-2xl text-white">{step.title}</CardTitle>
                      <p className="text-gray-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(step.difficulty)}>{step.difficulty}</Badge>
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {step.duration}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step Instructions */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Play className="w-5 h-5 mr-2 text-blue-400" />
                    Step-by-Step Instructions
                  </h4>
                  <div className="space-y-3">
                    {step.steps.map((instruction, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-300">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                    Pro Tips
                  </h4>
                  <div className="space-y-2">
                    {step.tips.map((tip, index) => (
                      <Alert key={index} className="border-yellow-500/50 bg-yellow-500/10">
                        <AlertDescription className="text-yellow-200">💡 {tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-600">
                  <div className="flex space-x-3">
                    {step.id > 0 && (
                      <Button
                        onClick={() => setCurrentStep(step.id - 1)}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Previous Step
                      </Button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => markStepComplete(step.id)}
                      disabled={completedSteps.includes(step.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {completedSteps.includes(step.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>

                    {step.id < tutorialSteps.length - 1 && (
                      <Button
                        onClick={() => setCurrentStep(step.id + 1)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Reference */}
      <Card className="bg-gray-800/50 border-gray-700/50 mt-8">
        <CardHeader>
          <CardTitle className="text-white">Quick Reference Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">🔗 Connect Wallet</h4>
              <p className="text-sm text-gray-300">MetaMask or Demo Mode → Sepolia testnet recommended</p>
            </div>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">💸 Send Payment</h4>
              <p className="text-sm text-gray-300">Any token → USDC for recipient, 2-5 min delivery</p>
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">📊 Track History</h4>
              <p className="text-sm text-gray-300">Search, filter, export CSV for all transactions</p>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">⚡ Earn Yield</h4>
              <p className="text-sm text-gray-300">8-12% APY on stablecoins and major tokens</p>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <h4 className="font-semibold text-orange-400 mb-2">🏦 Bank Payout</h4>
              <p className="text-sm text-gray-300">Crypto → USD, 2.5% fee, 1-3 business days</p>
            </div>
            <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
              <h4 className="font-semibold text-pink-400 mb-2">🌍 Multi-Chain</h4>
              <p className="text-sm text-gray-300">Ethereum, Polygon, Arbitrum, Base support</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
