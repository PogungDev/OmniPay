// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmniPayCore is ReentrancyGuard, Ownable {
    struct Payment {
        address sender;
        address recipient;
        address token;
        uint256 amount;
        uint256 timestamp;
        string status; // "pending", "completed", "failed"
        bytes32 txHash;
        uint256 chainId;
        string tokenSymbol;
    }

    struct UserProfile {
        string name;
        string email;
        bool isVerified;
        uint256 totalSent;
        uint256 totalReceived;
        uint256 transactionCount;
        uint256 registrationTime;
    }

    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => Payment) public payments;
    mapping(address => bytes32[]) public userPayments;
    mapping(address => mapping(address => bool)) public quickSendContacts; // user => contact => isAdded
    bytes32[] public allPayments;

    event PaymentCreated(bytes32 indexed paymentId, address indexed sender, address indexed recipient, uint256 amount);
    event PaymentCompleted(bytes32 indexed paymentId);
    event UserRegistered(address indexed user, string name);
    event QuickSendContactAdded(address indexed user, address indexed contact);

    function registerUser(string memory _name, string memory _email) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        userProfiles[msg.sender] = UserProfile({
            name: _name,
            email: _email,
            isVerified: false,
            totalSent: 0,
            totalReceived: 0,
            transactionCount: 0,
            registrationTime: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _name);
    }

    function createPayment(
        address _recipient,
        address _token,
        uint256 _amount,
        bytes32 _txHash,
        uint256 _chainId,
        string memory _tokenSymbol
    ) external returns (bytes32) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be greater than 0");
        
        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, _recipient, _amount, block.timestamp, _txHash));
        
        payments[paymentId] = Payment({
            sender: msg.sender,
            recipient: _recipient,
            token: _token,
            amount: _amount,
            timestamp: block.timestamp,
            status: "pending",
            txHash: _txHash,
            chainId: _chainId,
            tokenSymbol: _tokenSymbol
        });

        userPayments[msg.sender].push(paymentId);
        userPayments[_recipient].push(paymentId);
        allPayments.push(paymentId);

        userProfiles[msg.sender].totalSent += _amount;
        userProfiles[msg.sender].transactionCount += 1;

        emit PaymentCreated(paymentId, msg.sender, _recipient, _amount);
        return paymentId;
    }

    function completePayment(bytes32 _paymentId) external {
        Payment storage payment = payments[_paymentId];
        require(payment.recipient == msg.sender, "Only recipient can complete");
        require(keccak256(bytes(payment.status)) == keccak256(bytes("pending")), "Payment not pending");

        payment.status = "completed";
        userProfiles[payment.recipient].totalReceived += payment.amount;

        emit PaymentCompleted(_paymentId);
    }

    function addQuickSendContact(address _contact) external {
        require(_contact != address(0), "Invalid contact address");
        require(_contact != msg.sender, "Cannot add yourself");
        
        quickSendContacts[msg.sender][_contact] = true;
        emit QuickSendContactAdded(msg.sender, _contact);
    }

    function getUserPayments(address _user) external view returns (bytes32[] memory) {
        return userPayments[_user];
    }

    function getPayment(bytes32 _paymentId) external view returns (Payment memory) {
        return payments[_paymentId];
    }

    function getUserProfile(address _user) external view returns (UserProfile memory) {
        return userProfiles[_user];
    }

    function getAllPayments() external view returns (bytes32[] memory) {
        return allPayments;
    }

    function isQuickSendContact(address _user, address _contact) external view returns (bool) {
        return quickSendContacts[_user][_contact];
    }
}
