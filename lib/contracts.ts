import { ethers } from "ethers"

// Contract addresses (deploy these first)
export const CONTRACT_ADDRESSES = {
  // Sepolia testnet addresses
  11155111: {
    OMNIPAY_CORE: "0x0000000000000000000000000000000000000000", // Replace with deployed address
    OMNIPAY_TREASURY: "0x0000000000000000000000000000000000000000", // Replace with deployed address
    OMNIPAY_REMITTANCE: "0x0000000000000000000000000000000000000000", // Replace with deployed address
    OMNIPAY_PAYOUT: "0x0000000000000000000000000000000000000000", // Replace with deployed address
    OMNIPAY_TRACKER: "0x0000000000000000000000000000000000000000", // Replace with deployed address
    OMNIPAY_HISTORY: "0x0000000000000000000000000000000000000000", // Replace with deployed address
  },
  // Arbitrum
  42161: {
    OMNIPAY_CORE: "0x0000000000000000000000000000000000000000",
    OMNIPAY_TREASURY: "0x0000000000000000000000000000000000000000",
    OMNIPAY_REMITTANCE: "0x0000000000000000000000000000000000000000",
    OMNIPAY_PAYOUT: "0x0000000000000000000000000000000000000000",
    OMNIPAY_TRACKER: "0x0000000000000000000000000000000000000000",
    OMNIPAY_HISTORY: "0x0000000000000000000000000000000000000000",
  },
  // Polygon
  137: {
    OMNIPAY_CORE: "0x0000000000000000000000000000000000000000",
    OMNIPAY_TREASURY: "0x0000000000000000000000000000000000000000",
    OMNIPAY_REMITTANCE: "0x0000000000000000000000000000000000000000",
    OMNIPAY_PAYOUT: "0x0000000000000000000000000000000000000000",
    OMNIPAY_TRACKER: "0x0000000000000000000000000000000000000000",
    OMNIPAY_HISTORY: "0x0000000000000000000000000000000000000000",
  },
}

// Contract ABIs
export const OMNIPAY_CORE_ABI = [
  "function registerUser(string memory _name, string memory _email) external",
  "function createPayment(address _recipient, address _token, uint256 _amount, bytes32 _txHash, uint256 _chainId, string memory _tokenSymbol) external returns (bytes32)",
  "function completePayment(bytes32 _paymentId) external",
  "function addQuickSendContact(address _contact) external",
  "function getUserPayments(address _user) external view returns (bytes32[] memory)",
  "function getPayment(bytes32 _paymentId) external view returns (tuple(address sender, address recipient, address token, uint256 amount, uint256 timestamp, string status, bytes32 txHash, uint256 chainId, string tokenSymbol))",
  "function getUserProfile(address _user) external view returns (tuple(string name, string email, bool isVerified, uint256 totalSent, uint256 totalReceived, uint256 transactionCount, uint256 registrationTime))",
  "function getAllPayments() external view returns (bytes32[] memory)",
  "function isQuickSendContact(address _user, address _contact) external view returns (bool)",
  "event PaymentCreated(bytes32 indexed paymentId, address indexed sender, address indexed recipient, uint256 amount)",
  "event PaymentCompleted(bytes32 indexed paymentId)",
  "event UserRegistered(address indexed user, string name)",
  "event QuickSendContactAdded(address indexed user, address indexed contact)",
]

export const OMNIPAY_TREASURY_ABI = [
  "function depositForYield(address _token, uint256 _amount, string memory _strategy) external",
  "function claimYield(address _token) external",
  "function withdrawPosition(address _token) external",
  "function setRebalanceRule(address _token, uint256 _targetPercentage, uint256 _tolerance) external",
  "function executeRebalance() external",
  "function toggleAutoRebalance() external",
  "function getUserBalances(address _user) external view returns (tuple(address token, uint256 balance, uint256 usdValue, string symbol, uint256 lastUpdated)[] memory)",
  "function getUserPosition(address _user, address _token) external view returns (tuple(address token, uint256 amount, uint256 startTime, uint256 apy, uint256 earned, bool isActive, string strategy))",
  "function getPortfolioValue(address _user) external view returns (uint256)",
  "function getUserRebalanceRules(address _user) external view returns (tuple(address token, uint256 targetPercentage, uint256 tolerance, bool isActive)[] memory)",
  "function isAutoRebalanceEnabled(address _user) external view returns (bool)",
  "function setTokenAPY(address _token, uint256 _apy) external",
  "event YieldPositionCreated(address indexed user, address indexed token, uint256 amount, uint256 apy)",
  "event YieldClaimed(address indexed user, address indexed token, uint256 amount)",
  "event RebalanceExecuted(address indexed user, uint256 gasUsed)",
  "event AutoRebalanceToggled(address indexed user, bool enabled)",
]

export const OMNIPAY_REMITTANCE_ABI = [
  "function createRemittanceOrder(string memory _recipientName, string memory _recipientCountry, string memory _recipientBank, string memory _recipientAccount, string memory _recipientPhone, uint256 _amount, string memory _currencyPair) external payable returns (bytes32)",
  "function completeRemittance(bytes32 _orderId) external",
  "function cancelRemittance(bytes32 _orderId) external",
  "function addCountry(string memory _code, string memory _name, uint256 _minAmount, uint256 _maxAmount, uint256 _processingTime) external",
  "function setExchangeRate(string memory _currencyPair, uint256 _rate) external",
  "function getUserOrders(address _user) external view returns (bytes32[] memory)",
  "function getOrder(bytes32 _orderId) external view returns (tuple(address sender, string recipientName, string recipientCountry, string recipientBank, string recipientAccount, string recipientPhone, uint256 amount, uint256 exchangeRate, uint256 fees, uint256 timestamp, string status, bytes32 orderId, string fromCurrency, string toCurrency, uint256 estimatedDelivery))",
  "function getExchangeRate(string memory _currencyPair) external view returns (tuple(string fromCurrency, string toCurrency, uint256 rate, uint256 lastUpdated, bool isActive))",
  "function getCountry(string memory _countryCode) external view returns (tuple(string name, string code, bool isSupported, uint256 minAmount, uint256 maxAmount, uint256 processingTime))",
  "function getAllOrders() external view returns (bytes32[] memory)",
  "event RemittanceCreated(bytes32 indexed orderId, address indexed sender, uint256 amount, string country)",
  "event RemittanceCompleted(bytes32 indexed orderId)",
  "event RemittanceCancelled(bytes32 indexed orderId)",
]

export const OMNIPAY_PAYOUT_ABI = [
  "function addBankAccount(string memory _accountNumber, string memory _routingNumber, string memory _accountType, string memory _bankName, string memory _accountHolderName) external",
  "function verifyBankAccount(address _user, uint256 _accountIndex) external",
  "function requestPayout(address _token, uint256 _amount, uint256 _bankAccountIndex) external returns (bytes32)",
  "function approvePayout(bytes32 _requestId) external",
  "function completePayout(bytes32 _requestId) external",
  "function rejectPayout(bytes32 _requestId, string memory _reason) external",
  "function getUserPayouts(address _user) external view returns (bytes32[] memory)",
  "function getPayoutRequest(bytes32 _requestId) external view returns (tuple(address requester, address token, uint256 amount, string bankAccount, string routingNumber, string accountType, string bankName, uint256 timestamp, string status, bytes32 requestId, uint256 fees, uint256 estimatedCompletion, string rejectionReason))",
  "function getUserBankAccounts(address _user) external view returns (tuple(string accountNumber, string routingNumber, string accountType, string bankName, string accountHolderName, bool isVerified, uint256 addedTime, uint256 lastUsed)[] memory)",
  "function getUserStats(address _user) external view returns (tuple(uint256 totalRequests, uint256 totalAmount, uint256 completedRequests, uint256 totalFees, uint256 averageProcessingTime))",
  "function getAllPayouts() external view returns (bytes32[] memory)",
  "event PayoutRequested(bytes32 indexed requestId, address indexed requester, uint256 amount, address token)",
  "event PayoutApproved(bytes32 indexed requestId)",
  "event PayoutCompleted(bytes32 indexed requestId)",
  "event PayoutRejected(bytes32 indexed requestId, string reason)",
  "event BankAccountAdded(address indexed user, string accountNumber)",
  "event BankAccountVerified(address indexed user, uint256 accountIndex)",
]

export const OMNIPAY_HISTORY_ABI = [
  "function recordTransaction(bytes32 _txId, address _sender, address _recipient, address _token, string memory _tokenSymbol, uint256 _amount, uint256 _usdValue, uint256 _chainId, string memory _txType, bytes32 _crossChainTxHash, uint256 _gasUsed, uint256 _gasFee, string memory _notes) external",
  "function updateTransactionStatus(bytes32 _txId, string memory _newStatus) external",
  "function getUserTransactions(address _user) external view returns (bytes32[] memory)",
  "function getTransaction(bytes32 _txId) external view returns (tuple(bytes32 txId, address sender, address recipient, address token, string tokenSymbol, uint256 amount, uint256 usdValue, uint256 timestamp, uint256 blockNumber, uint256 chainId, string txType, string status, bytes32 crossChainTxHash, uint256 gasUsed, uint256 gasFee, string notes))",
  "function getUserTransactionsPaginated(address _user, uint256 _offset, uint256 _limit) external view returns (bytes32[] memory)",
  "function getTransactionsByDate(uint256 _date) external view returns (bytes32[] memory)",
  "function getUserStatsBasic(address _user) external view returns (uint256 totalTransactions, uint256 totalSent, uint256 totalReceived, uint256 totalGasFees, uint256 firstTransactionTime, uint256 lastTransactionTime)",
  "function getUserTransactionsByType(address _user, string memory _txType) external view returns (uint256)",
  "function getUserTransactionsByToken(address _user, address _token) external view returns (uint256)",
  "function getAllTransactions() external view returns (bytes32[] memory)",
  "event TransactionRecorded(bytes32 indexed txId, address indexed user, string txType)",
  "event TransactionUpdated(bytes32 indexed txId, string newStatus)",
]

// Helper functions to get contract instances
export function getOmniPayCore(provider: ethers.Provider, chainId: number) {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.OMNIPAY_CORE
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`OmniPay Core contract not deployed on chain ${chainId}`)
  }
  return new ethers.Contract(address, OMNIPAY_CORE_ABI, provider)
}

export function getOmniPayTreasury(provider: ethers.Provider, chainId: number) {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.OMNIPAY_TREASURY
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`OmniPay Treasury contract not deployed on chain ${chainId}`)
  }
  return new ethers.Contract(address, OMNIPAY_TREASURY_ABI, provider)
}

export function getOmniPayRemittance(provider: ethers.Provider, chainId: number) {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.OMNIPAY_REMITTANCE
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`OmniPay Remittance contract not deployed on chain ${chainId}`)
  }
  return new ethers.Contract(address, OMNIPAY_REMITTANCE_ABI, provider)
}

export function getOmniPayPayout(provider: ethers.Provider, chainId: number) {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.OMNIPAY_PAYOUT
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`OmniPay Payout contract not deployed on chain ${chainId}`)
  }
  return new ethers.Contract(address, OMNIPAY_PAYOUT_ABI, provider)
}

export function getOmniPayHistory(provider: ethers.Provider, chainId: number) {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.OMNIPAY_HISTORY
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`OmniPay History contract not deployed on chain ${chainId}`)
  }
  return new ethers.Contract(address, OMNIPAY_HISTORY_ABI, provider)
}

export function getOmniPayTracker(provider: ethers.Provider, chainId: number) {
  const address = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]?.OMNIPAY_TRACKER
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`OmniPay Tracker contract not deployed on chain ${chainId}`)
  }
  return new ethers.Contract(
    address,
    [
      "function recordPayment(address _sender, address _recipient, uint256 _amountSent, uint256 _usdcAmountReceived, bytes32 _transactionHash) public",
      "function confirmReceipt(bytes32 _transactionHash) public",
      "function getAllPaymentHashes() public view returns (bytes32[] memory)",
      "function getPaymentRecord(bytes32 _transactionHash) public view returns (address sender, address recipient, uint256 amountSent, uint256 usdcAmountReceived, uint256 timestamp, bytes32 transactionHash, bool receivedConfirmed)",
    ],
    provider,
  )
}
