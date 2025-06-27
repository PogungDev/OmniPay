import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OmniPay - The Stripe Checkout for Web3",
  description:
    "Pay with any token on any chain — merchants receive USDC on their chosen chain. Built for MetaMask Hackathon.",
  keywords: ["crypto", "payments", "cross-chain", "metamask", "web3", "defi", "usdc"],
  authors: [{ name: "OmniPay Team" }],
  openGraph: {
    title: "OmniPay - Cross-Chain Payments Made Simple",
    description: "The Stripe Checkout for Web3. Send any token from any chain, recipient gets USDC instantly.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniPay - Cross-Chain Payments",
    description: "Pay with any token on any chain — merchants receive USDC instantly.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
