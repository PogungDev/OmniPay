"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Wallet, 
  Send, 
  Eye, 
  PieChart, 
  Zap, 
  CreditCard, 
  CheckCircle, 
  Play, 
  Baby, 
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Users,
  Shield,
  Globe,
  Target,
  Gift,
  TrendingUp,
  Heart
} from "lucide-react"

export default function SimpleTutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const babySteps = [
    {
      id: 0,
      emoji: "🦊",
      title: "Connect with MetaMask",
      subtitle: "Your gateway to Web3 payments",
      icon: <Wallet className="w-8 h-8" />,
      color: "from-orange-400 to-orange-600",
      bgColor: "bg-orange-500/10 border-orange-500/30",
      difficulty: "Super Easy",
      time: "30 seconds",
      simple: [
        "Click the 'Connect Wallet' button in the top right corner",
        "If you have MetaMask 🦊 → Click 'MetaMask' and approve",
        "If you don't have MetaMask → App automatically enters Demo Mode",
        "You'll see your wallet address appear - You're connected! 🎉"
      ],
      analogy: "Think of it like logging into Netflix with your Google account - one click and you're in!",
      tips: [
        "MetaMask is like your digital wallet - but for crypto instead of cash",
        "Demo Mode lets you try everything without spending real money",
        "Your wallet address is like your crypto bank account number"
      ],
      nextAction: "Click 'Send' tab to make your first payment"
    },
    {
      id: 1,
      emoji: "💸",
      title: "Send Any Token → Get USDC",
      subtitle: "The magic of cross-chain conversion",
      icon: <Send className="w-8 h-8" />,
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      difficulty: "Easy",
      time: "2 minutes",
      simple: [
        "Navigate to the 'Send' tab in the top menu",
        "Choose any crypto you have (ETH, MATIC, ARB, etc.)",
        "Enter the amount you want to send",
        "Paste the recipient's wallet address",
        "Click 'Create Payment' - that's it! 🚀"
      ],
      analogy: "Like sending money via PayPal, but the recipient ALWAYS gets stable dollars (USDC) no matter what you send!",
      tips: [
        "The recipient gets USDC (digital dollars) even if you send ETH or any other token",
        "This protects them from crypto price swings",
        "All conversions happen automatically behind the scenes"
      ],
      nextAction: "Track your payment in the 'Remittance' tab"
    },
    {
      id: 2,
      emoji: "👀",
      title: "Track Payment Like a Package",
      subtitle: "Real-time status monitoring",
      icon: <Eye className="w-8 h-8" />,
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-500/10 border-purple-500/30",
      difficulty: "Easy",
      time: "1 minute",
      simple: [
        "Go to the 'Remittance' tab to track your payment",
        "See live progress: Processing → Bridge → Delivered ✅",
        "Watch the countdown timer (usually 2-5 minutes)",
        "Green checkmark = money successfully delivered!"
      ],
      analogy: "Exactly like tracking a JNE package - you can see where your money is at every step!",
      tips: [
        "Cross-chain payments take a few minutes (not instant like regular transfers)",
        "Each step is verified on the blockchain for maximum security",
        "You can share the tracking link with the recipient"
      ],
      nextAction: "Check your transaction history in the 'History' tab"
    },
    {
      id: 3,
      emoji: "📊",
      title: "View Complete Transaction History",
      subtitle: "Your personal crypto activity log",
      icon: <Eye className="w-8 h-8" />,
      color: "from-green-400 to-green-600",
      bgColor: "bg-green-500/10 border-green-500/30",
      difficulty: "Easy",
      time: "1 minute",
      simple: [
        "Click the 'History' tab to see ALL your transactions",
        "Search by recipient name, address, or transaction ID",
        "Filter by status: Completed, Pending, Failed",
        "Export to CSV/Excel for your records or taxes 📋"
      ],
      analogy: "Like your mobile banking transaction history - but for ALL your crypto activities across multiple blockchains!",
      tips: [
        "Every transaction is permanently recorded on the blockchain",
        "Export feature helps with tax reporting and accounting",
        "Use search to quickly find specific payments"
      ],
      nextAction: "See your total wealth in the 'Portfolio' tab"
    },
    {
      id: 4,
      emoji: "💰",
      title: "See Your Total Crypto Wealth",
      subtitle: "All chains, one dashboard",
      icon: <PieChart className="w-8 h-8" />,
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-500/10 border-yellow-500/30",
      difficulty: "Easy",
      time: "30 seconds",
      simple: [
        "Visit the 'Portfolio' tab to see your total net worth",
        "All crypto from different blockchains added together",
        "Beautiful pie chart shows your asset allocation",
        "Toggle 'Hide Balance' for privacy when screen sharing"
      ],
      analogy: "Like having a dashboard that shows your total money across ALL banks in one place!",
      tips: [
        "Portfolio value updates in real-time with market prices",
        "Helps you understand your crypto asset allocation",
        "Great for tracking your overall investment performance"
      ],
      nextAction: "Make your crypto earn money in the 'Treasury' tab"
    },
    {
      id: 5,
      emoji: "⚡",
      title: "Make Your Crypto Earn Interest",
      subtitle: "8-12% yearly returns on autopilot",
      icon: <Zap className="w-8 h-8" />,
      color: "from-indigo-400 to-indigo-600",
      bgColor: "bg-indigo-500/10 border-indigo-500/30",
      difficulty: "Medium",
      time: "3 minutes",
      simple: [
        "Go to 'Treasury' tab for automated yield farming",
        "Choose which crypto to deposit (USDC is safest)",
        "Enter the amount you want to earn interest on",
        "Click 'Create Yield Position' and start earning! 💰",
        "Check back daily to see your rewards growing"
      ],
      analogy: "Like putting money in a high-yield savings account, but earning 8-12% instead of bank's measly 2%!",
      tips: [
        "USDC (stablecoin) offers steady returns with lower risk",
        "Returns come from DeFi lending protocols",
        "You can withdraw your funds anytime (no lock-up period)"
      ],
      nextAction: "Convert crypto to cash in the 'Payouts' tab"
    },
    {
      id: 6,
      emoji: "🏦",
      title: "Cash Out to Your Bank Account",
      subtitle: "Crypto → Rupiah → Your bank",
      icon: <CreditCard className="w-8 h-8" />,
      color: "from-pink-400 to-pink-600",
      bgColor: "bg-pink-500/10 border-pink-500/30",
      difficulty: "Advanced",
      time: "5 minutes setup",
      simple: [
        "Navigate to 'Payouts' tab",
        "First time: Add your bank account details",
        "Choose which crypto to convert to cash",
        "Enter the dollar amount you want to withdraw",
        "Money appears in your bank within 1-3 business days! 🏦"
      ],
      analogy: "Like selling gold at a jewelry store, but automated and money goes straight to your bank account!",
      tips: [
        "Bank verification usually takes 1-2 business days",
        "Small fees apply (typically 2-3%)",
        "Perfect for taking profits or paying bills"
      ],
      nextAction: "Congratulations! You're now a crypto payments expert! 🎉"
    }
  ]

  const markStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const nextStep = () => {
    markStepComplete(currentStep)
    if (currentStep < babySteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const currentStepData = babySteps[currentStep]
  const progressPercentage = ((currentStep + 1) / babySteps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-metamask-gradient blur-lg opacity-30 animate-pulse"></div>
            <div className="relative bg-metamask-gradient rounded-full p-4 inline-flex items-center space-x-3">
              <div className="text-4xl animate-fox-bounce">🦊</div>
              <div className="text-white">
                <div className="font-bold text-xl">OmniPay × MetaMask</div>
                <div className="text-sm opacity-90">Tutorial for Beginners</div>
              </div>
              <Sparkles className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Learn{" "}
            <span className="text-gradient-primary">Cross-Chain Payments</span>
            {" "}in 15 Minutes
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            From zero to crypto payment expert! We'll explain everything like you're 5 years old. 
            No confusing jargon, just simple steps! 👶✨
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="tutorial-step p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="font-semibold text-green-400">100% Safe</span>
              </div>
              <p className="text-sm text-slate-300">Demo mode lets you practice without spending real money</p>
            </div>
            <div className="tutorial-step p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-400">15 Minutes</span>
              </div>
              <p className="text-sm text-slate-300">Complete tutorial from beginner to expert</p>
            </div>
            <div className="tutorial-step p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Real Skills</span>
              </div>
              <p className="text-sm text-slate-300">Learn actual Web3 payments that work in real world</p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <Card className="card-metamask mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="w-6 h-6 text-orange-400" />
                <span>Your Learning Progress</span>
              </CardTitle>
              <Badge className="tutorial-badge text-lg px-4 py-2">
                Step {currentStep + 1} of {babySteps.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-orange-400 font-semibold">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="text-center text-slate-400 text-sm">
                Completed steps: {completedSteps.length} | Remaining: {babySteps.length - completedSteps.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation Grid */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {babySteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`
                p-3 rounded-xl border-2 transition-all duration-300 text-center group
                ${
                  index === currentStep
                    ? `bg-gradient-to-r ${step.color} border-white/30 shadow-lg scale-105 animate-metamask-pulse`
                    : completedSteps.includes(index)
                      ? "bg-green-600 border-green-500/50 text-green-100"
                      : index < currentStep
                        ? "bg-slate-700 border-orange-500/50 text-orange-400 hover:bg-slate-600"
                        : "bg-slate-800 border-slate-600 text-slate-500 hover:border-slate-500"
                }
              `}
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                {completedSteps.includes(index) ? "✅" : step.emoji}
              </div>
              <div className="text-xs font-medium">{index + 1}</div>
            </button>
          ))}
        </div>

        {/* Main Step Content */}
        <Card className="card-metamask mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full bg-gradient-to-r ${currentStepData.color} text-white`}>
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-3xl font-bold text-white">{currentStepData.title}</h2>
                  <div className="flex space-x-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      {currentStepData.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentStepData.time}
                    </Badge>
                  </div>
                </div>
                <p className="text-xl text-slate-400">{currentStepData.subtitle}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step Instructions */}
            <div className={`${currentStepData.bgColor} rounded-xl p-6`}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2 text-orange-400" />
                Step-by-Step Instructions:
              </h3>
              <ol className="space-y-3">
                {currentStepData.simple.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-slate-200">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Real-World Analogy */}
            <Alert className="border-blue-500/30 bg-blue-500/10">
              <Heart className="h-5 w-5 text-blue-400" />
              <AlertDescription className="text-blue-100">
                <strong>Real-world analogy:</strong> {currentStepData.analogy}
              </AlertDescription>
            </Alert>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
              <h4 className="font-semibold text-purple-400 mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Pro Tips:
              </h4>
              <ul className="space-y-2">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-purple-400 mt-1">💡</span>
                    <span className="text-slate-300 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Action */}
            {currentStepData.nextAction && (
              <div className="tutorial-highlight">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-5 h-5 text-orange-400" />
                  <span className="font-semibold text-orange-400">What's Next:</span>
                </div>
                <p className="mt-2">{currentStepData.nextAction}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Previous Step
          </Button>

          <div className="flex space-x-2">
            {currentStep < babySteps.length - 1 ? (
              <Button onClick={nextStep} className="btn-metamask">
                Mark as Complete & Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => markStepComplete(currentStep)} 
                className="btn-metamask"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Tutorial!
              </Button>
            )}
          </div>

          <Button
            onClick={nextStep}
            disabled={currentStep === babySteps.length - 1}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Skip Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Complete Journey Summary */}
        <Card className="card-metamask">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center flex items-center justify-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span>🎯 Your Complete OmniPay Journey</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-orange-400 font-bold text-lg mb-4 flex items-center">
                  <Baby className="w-6 h-6 mr-2" />
                  👶 Beginner Level (5 minutes):
                </h4>
                <div className="space-y-3">
                  {babySteps.slice(0, 4).map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        completedSteps.includes(index) ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {completedSteps.includes(index) ? '✅' : step.emoji}
                      </span>
                      <span className="text-slate-300">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-lg mb-4 flex items-center">
                  <Zap className="w-6 h-6 mr-2" />
                  🚀 Expert Level (10 minutes):
                </h4>
                <div className="space-y-3">
                  {babySteps.slice(4).map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        completedSteps.includes(index + 4) ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {completedSteps.includes(index + 4) ? '✅' : step.emoji}
                      </span>
                      <span className="text-slate-300">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Call-to-Action */}
            {completedSteps.length === babySteps.length && (
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">
                    🎉 Congratulations! You're Now a Crypto Payments Expert!
                  </h3>
                  <p className="text-slate-300 mb-4">
                    You've mastered cross-chain payments, yield farming, and crypto-to-fiat transfers. 
                    Time to start using OmniPay for real transactions!
                  </p>
                  <Button className="btn-metamask text-lg px-8 py-3">
                    <Globe className="w-5 h-5 mr-2" />
                    Start Using OmniPay Now!
                  </Button>
                </div>
              </div>
            )}

            {/* MetaMask Partnership Message */}
            <div className="mt-6 text-center">
              <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/30 rounded-xl p-4">
                <p className="text-slate-300 text-sm">
                  <span className="text-orange-400 font-semibold">Built for MetaMask Hackathon</span> - 
                  Showcasing the future of cross-chain payments with MetaMask SDK integration 🦊⚡
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
