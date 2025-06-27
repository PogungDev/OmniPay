"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Wallet, Send, History, PieChart, CreditCard, Zap, Lightbulb, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Step {
  id: string
  title: string
  icon: React.ElementType
  description: string
  details: string[]
  gradient: string
  link?: string
  linkText?: string
}

const steps: Step[] = [
  {
    id: "connect-wallet",
    title: "1. Connect Your Wallet",
    icon: Wallet,
    description: "Securely link your crypto wallet to OmniPay.",
    details: [
      "Click 'Connect Wallet' in the top right corner.",
      "Choose your preferred wallet (e.g., MetaMask).",
      "Approve the connection. If no wallet is detected, you'll enter Demo Mode automatically.",
      "Your wallet address will appear, confirming connection.",
    ],
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    id: "send-payment",
    title: "2. Send Any Token, Receive USDC",
    icon: Send,
    description: "Send any supported cryptocurrency, and the recipient receives stable USDC.",
    details: [
      "Navigate to the 'Send' tab.",
      "Select the token you want to send (e.g., ETH, MATIC, ARB) and enter the amount.",
      "Input the recipient's wallet address.",
      "Review the transaction details and confirm. OmniPay handles cross-chain swaps and bridging automatically.",
    ],
    gradient: "from-blue-400 to-indigo-500",
    link: "/send",
    linkText: "Go to Send Module",
  },
  {
    id: "track-history",
    title: "3. Track Your Transactions",
    icon: History,
    description: "Monitor the real-time status of all your payments and transfers.",
    details: [
      "Visit the 'History' tab to see a comprehensive log of all your transactions.",
      "View payment statuses (Processing, Completed, Failed) and details like fees and timestamps.",
      "Use filters and search to find specific transactions quickly.",
      "Export your transaction history for record-keeping or tax purposes.",
    ],
    gradient: "from-purple-400 to-pink-500",
    link: "/history",
    linkText: "View Transaction History",
  },
  {
    id: "manage-portfolio",
    title: "4. Manage Your Multi-Chain Portfolio",
    icon: PieChart,
    description: "Get a unified view of all your crypto assets across different blockchains.",
    details: [
      "Go to the 'Portfolio' tab.",
      "See your total portfolio value and asset distribution.",
      "Track individual token balances and their USD value on various chains.",
      "Quickly initiate actions like sending or earning yield directly from your portfolio.",
    ],
    gradient: "from-yellow-400 to-orange-500",
    link: "/portfolio",
    linkText: "Explore Your Portfolio",
  },
  {
    id: "earn-yield",
    title: "5. Earn Yield with Treasury",
    icon: Zap,
    description: "Put your idle assets to work and earn passive income through DeFi yield farming.",
    details: [
      "Access the 'Treasury' tab.",
      "Choose a token (e.g., USDC, ETH) and deposit an amount to a yield-generating strategy.",
      "Monitor your active positions and claim your earned rewards.",
      "OmniPay optimizes strategies for competitive APYs.",
    ],
    gradient: "from-cyan-400 to-blue-500",
    link: "/treasury",
    linkText: "Start Earning Yield",
  },
  {
    id: "payout-to-bank",
    title: "6. Payout to Your Bank Account",
    icon: CreditCard,
    description: "Seamlessly convert your crypto to fiat and withdraw directly to your bank.",
    details: [
      "Go to the 'Payouts' tab.",
      "Add and verify your bank account details (one-time setup).",
      "Select the crypto you want to convert (e.g., USDC) and enter the desired fiat amount.",
      "Confirm the payout request and track its status until funds arrive in your bank account.",
    ],
    gradient: "from-rose-400 to-pink-500",
    link: "/payouts",
    linkText: "Request a Payout",
  },
]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
          How OmniPay <span className="text-gradient-primary">Works</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          OmniPay simplifies cross-chain crypto payments, yield farming, and fiat withdrawals. Here's a simple guide to
          get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Card
              key={step.id}
              className={`bg-slate-800 border-slate-700 text-white p-6 flex flex-col items-center text-center rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                activeStep === step.id ? `border-2 ${step.gradient}` : ""
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${step.gradient} shadow-md`}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold mb-2 text-white">{step.title}</CardTitle>
              <p className="text-slate-300 text-sm">{step.description}</p>
            </Card>
          )
        })}
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Detailed Steps</h2>
        <Accordion type="single" collapsible className="w-full">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Card key={step.id} className="mb-4 bg-slate-800 border-slate-700 card-glow">
                <AccordionItem value={step.id} className="border-b border-slate-700 last:border-b-0">
                  <AccordionTrigger
                    className={`flex items-center justify-between p-4 text-lg font-semibold text-white hover:no-underline ${
                      activeStep === step.id ? `text-gradient-to-r ${step.gradient}` : ""
                    }`}
                    onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-6 h-6 ${activeStep === step.id ? `text-gradient-to-r ${step.gradient}` : "text-slate-400"}`}
                      />
                      <span>{step.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-slate-300 space-y-3">
                    <p>{step.description}</p>
                    <ul className="list-disc pl-5 space-y-2">
                      {step.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                    {step.link && (
                      <Link href={step.link}>
                        <Button className={`mt-4 ${step.gradient} text-white hover:opacity-90`}>
                          {step.linkText || "Learn More"} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-slate-400 mt-4">
                      <Lightbulb className="w-4 h-4" />
                      <span>**Pro Tip:** {step.details[0]}</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            )
          })}
        </Accordion>
      </div>

      <div className="text-center mt-12">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-slate-400 mb-6">
          Connect your wallet and experience the future of decentralized finance with OmniPay.
        </p>
        <Link href="/">
          <Button className="bg-gradient-primary text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Launch OmniPay App <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
