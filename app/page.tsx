"use client"

import { useState } from "react"
import { MainNavbar } from "@/components/main-navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HomeModule from "@/components/modules/home-module"
import SendModule from "@/components/modules/send-module"
import HistoryModule from "@/components/modules/history-module"
import PortfolioModule from "@/components/modules/portfolio-module"
import RemittanceModule from "@/components/modules/remittance-module"
import PayoutModule from "@/components/modules/payout-module"
import TreasuryModule from "@/components/modules/treasury-module"
import HowItWorksModule from "@/components/modules/how-it-works-module"
import { Send, History, PieChart, Home, Users, CreditCard, TrendingUp } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home")

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  // If "how-it-works" is selected, show it as a full page
  if (activeTab === "how-it-works") {
    return (
      <div className="min-h-screen bg-slate-900">
        <MainNavbar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="container mx-auto px-4 py-8">
          <HowItWorksModule onTabChange={handleTabChange} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <MainNavbar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-slate-800 border-slate-700">
            <TabsTrigger
              value="home"
              className="flex items-center space-x-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="send"
              className="flex items-center space-x-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </TabsTrigger>
            <TabsTrigger
              value="remittance"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Remittance</span>
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Payouts</span>
            </TabsTrigger>
            <TabsTrigger
              value="treasury"
              className="flex items-center space-x-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Treasury</span>
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="flex items-center space-x-2 data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="home" className="space-y-6">
              <HomeModule onTabChange={handleTabChange} />
            </TabsContent>

            <TabsContent value="send" className="space-y-6">
              <SendModule />
            </TabsContent>

            <TabsContent value="remittance" className="space-y-6">
              <RemittanceModule />
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              <PayoutModule />
            </TabsContent>

            <TabsContent value="treasury" className="space-y-6">
              <TreasuryModule />
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <PortfolioModule />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <HistoryModule />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
