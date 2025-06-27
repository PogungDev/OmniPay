// Core payment types
export interface PaymentRequest {
  id: string
  fromToken: string
  fromChain: number
  fromAmount: number
  toToken: string
  toChain: number
  toAmount: number
  toAddress: string
  status: PaymentStatus
  createdAt: Date
  updatedAt: Date
  txHash?: string
  route?: PaymentRoute
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

// Token info interface
export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logo: string
  balance: string
}

// Route and bridging types
export interface PaymentRoute {
  id: string
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: number
  toAmount: number
  amount: string
  estimatedGas: string
  estimatedTime: number // in seconds
  gasFee: number
  bridgeFee: number
  totalFee: number
  exchangeRate: number
  usdcAmount: string
  steps: RouteStep[]
  provider: "lifi" | "circle-cctp" | "native"
  route?: any // LI.FI route object
}

export interface RouteStep {
  id: string
  type: "swap" | "bridge" | "transfer"
  fromToken: string
  toToken: string
  fromAmount: number
  toAmount: number
  protocol: string
  estimatedTime: number
  gasFee: number
}

// Wallet and chain types
export interface WalletInfo {
  address: string
  chainId: number
  balance: TokenBalance[]
  isConnected: boolean
  provider: "metamask" | "walletconnect" | "demo"
}

export interface TokenBalance {
  token: Token
  balance: number
  usdValue: number
}

export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  chainId: number
  logoUrl?: string
  price?: number
}

export interface Chain {
  id: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  logoUrl?: string
  nativeToken: Token
  supportedTokens: Token[]
}

// Transaction types
export interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  value: number
  token: string
  chainId: number
  status: TransactionStatus
  timestamp: Date
  blockNumber?: number
  gasUsed?: number
  gasFee?: number
  type: TransactionType
}

export enum TransactionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

export enum TransactionType {
  SEND = "send",
  RECEIVE = "receive",
  SWAP = "swap",
  BRIDGE = "bridge",
  APPROVE = "approve",
}

// Portfolio and analytics types
export interface Portfolio {
  totalValue: number
  totalPaid: number
  totalReceived: number
  assets: AssetHolding[]
  transactions: Transaction[]
  performance: PerformanceMetrics
}

export interface AssetHolding {
  token: Token
  balance: number
  usdValue: number
  percentage: number
  change24h: number
}

export interface PerformanceMetrics {
  totalReturn: number
  totalReturnPercentage: number
  dayChange: number
  dayChangePercentage: number
  weekChange: number
  weekChangePercentage: number
}

// Remittance types
export interface RemittanceContact {
  id: string
  name: string
  address: string
  preferredChain: number
  preferredToken: string
  avatar?: string
  relationship: string
  isActive: boolean
}

export interface RemittanceTemplate {
  id: string
  name: string
  contact: RemittanceContact
  amount: number
  token: string
  frequency: "once" | "weekly" | "monthly"
  isActive: boolean
}

// Payout types
export interface PayoutRequest {
  id: string
  merchantId: string
  amount: number
  currency: string
  description: string
  status: PayoutStatus
  createdAt: Date
  paidAt?: Date
  paymentMethod: PaymentMethod
  metadata?: Record<string, any>
}

export enum PayoutStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export interface PaymentMethod {
  type: "crypto" | "bank" | "card"
  details: CryptoPaymentMethod | BankPaymentMethod | CardPaymentMethod
}

export interface CryptoPaymentMethod {
  address: string
  chain: number
  token: string
}

export interface BankPaymentMethod {
  accountNumber: string
  routingNumber: string
  bankName: string
  accountType: "checking" | "savings"
}

export interface CardPaymentMethod {
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
}

// Treasury types
export interface TreasuryPosition {
  id: string
  token: Token
  chain: number
  balance: number
  usdValue: number
  apy?: number
  protocol?: string
  isStaked: boolean
  rewards?: number
}

export interface RebalanceOperation {
  id: string
  fromPosition: TreasuryPosition
  toChain: number
  amount: number
  status: PaymentStatus
  route: PaymentRoute
  createdAt: Date
  completedAt?: Date
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Widget and SDK types
export interface WidgetConfig {
  merchantId: string
  amount?: number
  currency?: string
  toChain?: number
  toToken?: string
  theme?: "light" | "dark" | "auto"
  primaryColor?: string
  borderRadius?: number
  showPoweredBy?: boolean
}

export interface WidgetCallbacks {
  onSuccess?: (payment: PaymentRequest) => void
  onError?: (error: Error) => void
  onCancel?: () => void
  onStatusChange?: (status: PaymentStatus) => void
}

// Error types
export interface PaymentError {
  code: string
  message: string
  details?: Record<string, any>
}

export enum ErrorCode {
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_ADDRESS = "INVALID_ADDRESS",
  NETWORK_ERROR = "NETWORK_ERROR",
  USER_REJECTED = "USER_REJECTED",
  ROUTE_NOT_FOUND = "ROUTE_NOT_FOUND",
  SLIPPAGE_TOO_HIGH = "SLIPPAGE_TOO_HIGH",
  TIMEOUT = "TIMEOUT",
}

// Utility types
export type ChainId = 1 | 137 | 42161 | 10 | 8453 | 56 | 43114
export type TokenSymbol = "ETH" | "USDC" | "USDT" | "MATIC" | "ARB" | "OP" | "BNB" | "AVAX"

// Form types
export interface SendFormData {
  fromToken: string
  fromChain: number
  fromAmount: string
  toAddress: string
  toChain: number
  toToken: string
}

export interface RemittanceFormData {
  contactId: string
  amount: string
  message?: string
}

export interface PayoutFormData {
  amount: string
  description: string
  paymentMethod: string
}

// Settings types
export interface UserSettings {
  defaultChain: number
  defaultToken: string
  slippageTolerance: number
  gasPreference: "slow" | "standard" | "fast"
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  transactionUpdates: boolean
  priceAlerts: boolean
  securityAlerts: boolean
}

export interface PrivacySettings {
  shareAnalytics: boolean
  shareTransactionData: boolean
  publicProfile: boolean
}
