// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmniPayPayout is ReentrancyGuard, Ownable {
    struct PayoutRequest {
        address requester;
        address token;
        uint256 amount;
        string bankAccount;
        string routingNumber;
        string accountType; // "checking", "savings"
        string bankName;
        uint256 timestamp;
        string status; // "pending", "approved", "processing", "completed", "rejected"
        bytes32 requestId;
        uint256 fees;
        uint256 estimatedCompletion;
        string rejectionReason;
    }

    struct BankAccount {
        string accountNumber;
        string routingNumber;
        string accountType;
        string bankName;
        string accountHolderName;
        bool isVerified;
        uint256 addedTime;
        uint256 lastUsed;
    }

    struct PayoutStats {
        uint256 totalRequests;
        uint256 totalAmount;
        uint256 completedRequests;
        uint256 totalFees;
        uint256 averageProcessingTime;
    }

    mapping(bytes32 => PayoutRequest) public payoutRequests;
    mapping(address => bytes32[]) public userPayouts;
    mapping(address => BankAccount[]) public userBankAccounts;
    mapping(address => PayoutStats) public userStats;
    bytes32[] public allPayouts;

    uint256 public constant PAYOUT_FEE_BASIS_POINTS = 250; // 2.5% fee
    uint256 public constant MIN_PAYOUT_AMOUNT = 10 * 10**6; // $10 USDC minimum
    uint256 public constant MAX_PAYOUT_AMOUNT = 50000 * 10**6; // $50,000 USDC maximum
    uint256 public constant PROCESSING_TIME = 2 * 24 * 3600; // 2 days

    event PayoutRequested(bytes32 indexed requestId, address indexed requester, uint256 amount, address token);
    event PayoutApproved(bytes32 indexed requestId);
    event PayoutCompleted(bytes32 indexed requestId);
    event PayoutRejected(bytes32 indexed requestId, string reason);
    event BankAccountAdded(address indexed user, string accountNumber);
    event BankAccountVerified(address indexed user, uint256 accountIndex);

    function addBankAccount(
        string memory _accountNumber,
        string memory _routingNumber,
        string memory _accountType,
        string memory _bankName,
        string memory _accountHolderName
    ) external {
        require(bytes(_accountNumber).length > 0, "Account number required");
        require(bytes(_routingNumber).length > 0, "Routing number required");
        require(bytes(_bankName).length > 0, "Bank name required");
        require(bytes(_accountHolderName).length > 0, "Account holder name required");
        
        userBankAccounts[msg.sender].push(BankAccount({
            accountNumber: _accountNumber,
            routingNumber: _routingNumber,
            accountType: _accountType,
            bankName: _bankName,
            accountHolderName: _accountHolderName,
            isVerified: false,
            addedTime: block.timestamp,
            lastUsed: 0
        }));

        emit BankAccountAdded(msg.sender, _accountNumber);
    }

    function verifyBankAccount(address _user, uint256 _accountIndex) external onlyOwner {
        require(_accountIndex < userBankAccounts[_user].length, "Invalid account index");
        
        userBankAccounts[_user][_accountIndex].isVerified = true;
        emit BankAccountVerified(_user, _accountIndex);
    }

    function requestPayout(
        address _token,
        uint256 _amount,
        uint256 _bankAccountIndex
    ) external nonReentrant returns (bytes32) {
        require(_amount >= MIN_PAYOUT_AMOUNT, "Amount below minimum");
        require(_amount <= MAX_PAYOUT_AMOUNT, "Amount exceeds maximum");
        require(_bankAccountIndex < userBankAccounts[msg.sender].length, "Invalid bank account");
        
        BankAccount storage bankAccount = userBankAccounts[msg.sender][_bankAccountIndex];
        require(bankAccount.isVerified, "Bank account not verified");
        
        // Transfer tokens to contract
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        uint256 fees = (_amount * PAYOUT_FEE_BASIS_POINTS) / 10000;
        uint256 netAmount = _amount - fees;

        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            _token,
            _amount,
            block.timestamp,
            _bankAccountIndex
        ));

        payoutRequests[requestId] = PayoutRequest({
            requester: msg.sender,
            token: _token,
            amount: netAmount,
            bankAccount: bankAccount.accountNumber,
            routingNumber: bankAccount.routingNumber,
            accountType: bankAccount.accountType,
            bankName: bankAccount.bankName,
            timestamp: block.timestamp,
            status: "pending",
            requestId: requestId,
            fees: fees,
            estimatedCompletion: block.timestamp + PROCESSING_TIME,
            rejectionReason: ""
        });

        userPayouts[msg.sender].push(requestId);
        allPayouts.push(requestId);

        // Update bank account last used
        bankAccount.lastUsed = block.timestamp;

        // Update user stats
        PayoutStats storage stats = userStats[msg.sender];
        stats.totalRequests += 1;
        stats.totalAmount += netAmount;
        stats.totalFees += fees;

        emit PayoutRequested(requestId, msg.sender, netAmount, _token);
        return requestId;
    }

    function approvePayout(bytes32 _requestId) external onlyOwner {
        PayoutRequest storage request = payoutRequests[_requestId];
        require(keccak256(bytes(request.status)) == keccak256(bytes("pending")), "Request not pending");

        request.status = "approved";
        emit PayoutApproved(_requestId);
    }

    function completePayout(bytes32 _requestId) external onlyOwner {
        PayoutRequest storage request = payoutRequests[_requestId];
        require(
            keccak256(bytes(request.status)) == keccak256(bytes("approved")) ||
            keccak256(bytes(request.status)) == keccak256(bytes("processing")),
            "Request not approved"
        );

        request.status = "completed";
        
        // Update user stats
        PayoutStats storage stats = userStats[request.requester];
        stats.completedRequests += 1;
        
        // Calculate processing time
        uint256 processingTime = block.timestamp - request.timestamp;
        if (stats.completedRequests == 1) {
            stats.averageProcessingTime = processingTime;
        } else {
            stats.averageProcessingTime = (stats.averageProcessingTime + processingTime) / 2;
        }

        emit PayoutCompleted(_requestId);
    }

    function rejectPayout(bytes32 _requestId, string memory _reason) external onlyOwner {
        PayoutRequest storage request = payoutRequests[_requestId];
        require(keccak256(bytes(request.status)) == keccak256(bytes("pending")), "Request not pending");

        request.status = "rejected";
        request.rejectionReason = _reason;
        
        // Refund tokens to user
        uint256 refundAmount = request.amount + request.fees;
        IERC20(request.token).transfer(request.requester, refundAmount);
        
        emit PayoutRejected(_requestId, _reason);
    }

    function getUserPayouts(address _user) external view returns (bytes32[] memory) {
        return userPayouts[_user];
    }

    function getPayoutRequest(bytes32 _requestId) external view returns (PayoutRequest memory) {
        return payoutRequests[_requestId];
    }

    function getUserBankAccounts(address _user) external view returns (BankAccount[] memory) {
        return userBankAccounts[_user];
    }

    function getUserStats(address _user) external view returns (PayoutStats memory) {
        return userStats[_user];
    }

    function getAllPayouts() external view returns (bytes32[] memory) {
        return allPayouts;
    }

    function withdrawFees(address _token) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(owner(), balance);
    }
}
