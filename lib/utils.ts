import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency values
export function formatCurrency(amount: number, currency = "USD", decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

// Format crypto amounts
export function formatCrypto(amount: number, symbol: string, decimals = 4): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amount)
  return `${formatted} ${symbol}`
}

// Format wallet addresses
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return ""
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

// Format transaction hashes
export function formatTxHash(hash: string, chars = 8): string {
  if (!hash) return ""
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

// Format time ago
export function formatTimeAgo(date: Date | string | number): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

// Format duration
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

// Format percentage
export function formatPercentage(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`
}

// Format large numbers
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toString()
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Validate transaction hash
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

// Generate random ID
export function generateId(prefix = "", length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = prefix
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

// Get chain name by ID
export function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: "Ethereum",
    137: "Polygon",
    42161: "Arbitrum",
    10: "Optimism",
    8453: "Base",
    56: "BNB Chain",
    43114: "Avalanche",
    11155111: "Sepolia",
  }
  return chainNames[chainId] || `Chain ${chainId}`
}

// Get token icon URL
export function getTokenIcon(symbol: string): string {
  const tokenIcons: Record<string, string> = {
    ETH: "/tokens/eth.svg",
    USDC: "/tokens/usdc.svg",
    USDT: "/tokens/usdt.svg",
    MATIC: "/tokens/matic.svg",
    ARB: "/tokens/arb.svg",
    OP: "/tokens/op.svg",
    BNB: "/tokens/bnb.svg",
    AVAX: "/tokens/avax.svg",
  }
  return tokenIcons[symbol] || "/tokens/default.svg"
}

// Calculate gas fee in USD
export function calculateGasFeeUSD(gasUsed: number, gasPrice: number, ethPrice: number): number {
  const gasFeeETH = (gasUsed * gasPrice) / 1e18
  return gasFeeETH * ethPrice
}

// Format gas price
export function formatGasPrice(gasPrice: number): string {
  const gwei = gasPrice / 1e9
  return `${gwei.toFixed(1)} Gwei`
}

// Calculate slippage
export function calculateSlippage(expectedAmount: number, actualAmount: number): number {
  return ((expectedAmount - actualAmount) / expectedAmount) * 100
}

// Validate amount
export function validateAmount(amount: string, balance: number): { isValid: boolean; error?: string } {
  const numAmount = Number.parseFloat(amount)

  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: "Invalid amount" }
  }

  if (numAmount > balance) {
    return { isValid: false, error: "Insufficient balance" }
  }

  return { isValid: true }
}

// Format API error
export function formatApiError(error: any): string {
  if (typeof error === "string") return error
  if (error?.message) return error.message
  if (error?.error) return error.error
  return "An unexpected error occurred"
}

// Generate QR code data
export function generateQRData(data: Record<string, any>): string {
  return JSON.stringify(data)
}

// Parse QR code data
export function parseQRData(qrString: string): Record<string, any> | null {
  try {
    return JSON.parse(qrString)
  } catch {
    return null
  }
}

// Color utilities
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "text-yellow-400",
    processing: "text-blue-400",
    completed: "text-green-400",
    success: "text-green-400",
    failed: "text-red-400",
    cancelled: "text-gray-400",
  }
  return colors[status.toLowerCase()] || "text-gray-400"
}

// Local storage utilities
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Failed to read from localStorage:", error)
    return defaultValue
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Failed to remove from localStorage:", error)
  }
}
