// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * 🔥 OMNIPAY SIMPLE DEPLOYMENT CONTRACT
 * 
 * This is a simplified version for testnet demonstration purposes.
 * All the real business logic is in the frontend SDK integrations.
 */

contract SimplePay {
    
    // ======================
    // STATE VARIABLES  
    // ======================
    
    struct Payment {
        address sender;
        address recipient; 
        uint256 amount;
        uint256 timestamp;
        string status;
        string tokenSymbol;
        uint256 chainId;
    }
    
    struct UserProfile {
        string name;
        bool isRegistered;
        uint256 totalSent;
        uint256 totalReceived;
        uint256 transactionCount;
    }
    
    // ======================
    // STORAGE MAPPINGS
    // ======================
    
    mapping(bytes32 => Payment) public payments;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => bytes32[]) public userPayments;
    bytes32[] public allPayments;
    
    // ======================
    // EVENTS
    // ======================
    
    event PaymentCreated(
        bytes32 indexed paymentId, 
        address indexed sender, 
        address indexed recipient, 
        uint256 amount,
        string tokenSymbol
    );
    
    event UserRegistered(address indexed user, string name);
    event PaymentCompleted(bytes32 indexed paymentId);
    
    // ======================
    // OWNER (Simple version)
    // ======================
    
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // ======================
    // CORE FUNCTIONS
    // ======================
    
    function registerUser(string memory _name) external {
        require(bytes(_name).length > 0, "Name required");
        
        userProfiles[msg.sender] = UserProfile({
            name: _name,
            isRegistered: true,
            totalSent: 0,
            totalReceived: 0,
            transactionCount: 0
        });
        
        emit UserRegistered(msg.sender, _name);
    }
    
    function createPayment(
        address _recipient,
        uint256 _amount,
        string memory _tokenSymbol,
        uint256 _chainId
    ) external returns (bytes32) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be > 0");
        
        bytes32 paymentId = keccak256(
            abi.encodePacked(
                msg.sender, 
                _recipient, 
                _amount, 
                block.timestamp,
                block.number
            )
        );
        
        payments[paymentId] = Payment({
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            timestamp: block.timestamp,
            status: "pending",
            tokenSymbol: _tokenSymbol,
            chainId: _chainId
        });
        
        userPayments[msg.sender].push(paymentId);
        userPayments[_recipient].push(paymentId);
        allPayments.push(paymentId);
        
        // Update user stats
        userProfiles[msg.sender].totalSent += _amount;
        userProfiles[msg.sender].transactionCount += 1;
        
        emit PaymentCreated(paymentId, msg.sender, _recipient, _amount, _tokenSymbol);
        return paymentId;
    }
    
    function completePayment(bytes32 _paymentId) external {
        Payment storage payment = payments[_paymentId];
        require(payment.recipient == msg.sender, "Only recipient");
        require(keccak256(bytes(payment.status)) == keccak256(bytes("pending")), "Not pending");
        
        payment.status = "completed";
        userProfiles[payment.recipient].totalReceived += payment.amount;
        
        emit PaymentCompleted(_paymentId);
    }
    
    // ======================
    // VIEW FUNCTIONS
    // ======================
    
    function getPayment(bytes32 _paymentId) external view returns (Payment memory) {
        return payments[_paymentId];
    }
    
    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return userProfiles[_user];
    }
    
    function getUserPayments(address _user) external view returns (bytes32[] memory) {
        return userPayments[_user];
    }
    
    function getAllPayments() external view returns (bytes32[] memory) {
        return allPayments;
    }
    
    function getPaymentCount() external view returns (uint256) {
        return allPayments.length;
    }
    
    // ======================
    // DEMO FUNCTIONS
    // ======================
    
    function getDemoStats() external view returns (
        uint256 totalPayments,
        uint256 totalUsers,
        address contractOwner,
        uint256 deploymentTime
    ) {
        uint256 userCount = 0;
        // Simple user count (not gas efficient, but for demo)
        for (uint i = 0; i < allPayments.length; i++) {
            if (userProfiles[payments[allPayments[i]].sender].isRegistered) {
                userCount++;
            }
        }
        
        return (
            allPayments.length,
            userCount,
            owner,
            block.timestamp
        );
    }
    
    // Emergency function for demo
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    // Support receiving ETH for demos
    receive() external payable {}
} 