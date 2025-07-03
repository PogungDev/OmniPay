// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmniPayCard is ReentrancyGuard, Ownable {
    struct CardProfile {
        address owner;
        uint256 creditLimit;
        uint256 currentBalance;
        uint256 availableCredit;
        bool isActive;
        uint256 createdAt;
        string cardId;
    }

    struct CreditLine {
        address collateralToken;
        uint256 collateralAmount;
        uint256 creditAmount;
        uint256 interestRate; // basis points
        uint256 liquidationThreshold; // basis points (8000 = 80%)
        bool isActive;
        uint256 lastUpdate;
    }

    struct AutoRepay {
        address sourceToken;
        uint256 sourceChain;
        uint256 repayAmount;
        uint256 frequency; // seconds
        uint256 lastRepay;
        bool isActive;
    }

    mapping(address => CardProfile) public cardProfiles;
    mapping(address => CreditLine[]) public userCreditLines;
    mapping(address => AutoRepay) public autoRepaySettings;
    mapping(address => uint256) public totalCollateralValue;
    mapping(address => bool) public supportedTokens;

    // Cross-chain integration
    mapping(uint256 => bool) public supportedChains;
    mapping(address => mapping(uint256 => uint256)) public crossChainBalances;

    event CardCreated(address indexed user, string cardId, uint256 creditLimit);
    event CreditLineAdded(address indexed user, address token, uint256 amount);
    event AutoRepaySet(address indexed user, address token, uint256 amount);
    event PaymentMade(address indexed user, uint256 amount, string merchantId);
    event CreditRepaid(address indexed user, uint256 amount, address token);
    event CrossChainBalanceUpdated(address indexed user, uint256 chainId, uint256 balance);

    constructor() Ownable(msg.sender) {
        // Initialize supported tokens
        supportedTokens[0xA0b86a33E6441B8db4B2b8B8b8B8b8B8b8B8B8B8] = true; // USDC
        supportedTokens[address(0)] = true; // ETH
        
        // Initialize supported chains (Linea for MetaMask Card)
        supportedChains[59144] = true; // Linea Mainnet
        supportedChains[59140] = true; // Linea Goerli
        supportedChains[1] = true; // Ethereum
        supportedChains[137] = true; // Polygon
        supportedChains[42161] = true; // Arbitrum
    }

    function createCard(string memory _cardId) external {
        require(bytes(_cardId).length > 0, "Card ID required");
        require(!cardProfiles[msg.sender].isActive, "Card already exists");

        cardProfiles[msg.sender] = CardProfile({
            owner: msg.sender,
            creditLimit: 0,
            currentBalance: 0,
            availableCredit: 0,
            isActive: true,
            createdAt: block.timestamp,
            cardId: _cardId
        });

        emit CardCreated(msg.sender, _cardId, 0);
    }

    function addCreditLine(
        address _collateralToken,
        uint256 _collateralAmount,
        uint256 _interestRate
    ) external nonReentrant {
        require(supportedTokens[_collateralToken], "Token not supported");
        require(_collateralAmount > 0, "Amount must be greater than 0");
        require(cardProfiles[msg.sender].isActive, "Card not active");

        // Transfer collateral
        IERC20(_collateralToken).transferFrom(msg.sender, address(this), _collateralAmount);

        // Calculate credit amount (70% of collateral value)
        uint256 creditAmount = (_collateralAmount * 7000) / 10000; // 70% LTV

        userCreditLines[msg.sender].push(CreditLine({
            collateralToken: _collateralToken,
            collateralAmount: _collateralAmount,
            creditAmount: creditAmount,
            interestRate: _interestRate,
            liquidationThreshold: 8000, // 80%
            isActive: true,
            lastUpdate: block.timestamp
        }));

        // Update card credit limit
        cardProfiles[msg.sender].creditLimit += creditAmount;
        cardProfiles[msg.sender].availableCredit += creditAmount;
        totalCollateralValue[msg.sender] += _collateralAmount;

        emit CreditLineAdded(msg.sender, _collateralToken, creditAmount);
    }

    function setAutoRepay(
        address _sourceToken,
        uint256 _sourceChain,
        uint256 _repayAmount,
        uint256 _frequency
    ) external {
        require(supportedTokens[_sourceToken], "Source token not supported");
        require(supportedChains[_sourceChain], "Chain not supported");
        require(_repayAmount > 0, "Repay amount must be greater than 0");

        autoRepaySettings[msg.sender] = AutoRepay({
            sourceToken: _sourceToken,
            sourceChain: _sourceChain,
            repayAmount: _repayAmount,
            frequency: _frequency,
            lastRepay: block.timestamp,
            isActive: true
        });

        emit AutoRepaySet(msg.sender, _sourceToken, _repayAmount);
    }

    function makePayment(uint256 _amount, string memory _merchantId) external nonReentrant {
        CardProfile storage card = cardProfiles[msg.sender];
        require(card.isActive, "Card not active");
        require(_amount <= card.availableCredit, "Insufficient credit");

        card.currentBalance += _amount;
        card.availableCredit -= _amount;

        emit PaymentMade(msg.sender, _amount, _merchantId);
    }

    function repayCredit(uint256 _amount, address _token) external nonReentrant {
        require(supportedTokens[_token], "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");
        
        CardProfile storage card = cardProfiles[msg.sender];
        require(card.currentBalance >= _amount, "Repay amount exceeds balance");

        // Transfer repayment
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        card.currentBalance -= _amount;
        card.availableCredit += _amount;

        emit CreditRepaid(msg.sender, _amount, _token);
    }

    function executeAutoRepay(address _user) external {
        AutoRepay storage autoRepay = autoRepaySettings[_user];
        require(autoRepay.isActive, "Auto repay not active");
        require(
            block.timestamp >= autoRepay.lastRepay + autoRepay.frequency,
            "Not time for repayment yet"
        );

        CardProfile storage card = cardProfiles[_user];
        uint256 repayAmount = autoRepay.repayAmount;
        
        if (repayAmount > card.currentBalance) {
            repayAmount = card.currentBalance;
        }

        if (repayAmount > 0) {
            card.currentBalance -= repayAmount;
            card.availableCredit += repayAmount;
            autoRepay.lastRepay = block.timestamp;

            emit CreditRepaid(_user, repayAmount, autoRepay.sourceToken);
        }
    }

    function updateCrossChainBalance(
        address _user,
        uint256 _chainId,
        uint256 _balance
    ) external onlyOwner {
        require(supportedChains[_chainId], "Chain not supported");
        
        crossChainBalances[_user][_chainId] = _balance;
        emit CrossChainBalanceUpdated(_user, _chainId, _balance);
    }

    function getCardProfile(address _user) external view returns (CardProfile memory) {
        return cardProfiles[_user];
    }

    function getCreditLines(address _user) external view returns (CreditLine[] memory) {
        return userCreditLines[_user];
    }

    function getAutoRepaySettings(address _user) external view returns (AutoRepay memory) {
        return autoRepaySettings[_user];
    }

    function getCrossChainBalance(address _user, uint256 _chainId) external view returns (uint256) {
        return crossChainBalances[_user][_chainId];
    }

    function addSupportedToken(address _token) external onlyOwner {
        supportedTokens[_token] = true;
    }

    function addSupportedChain(uint256 _chainId) external onlyOwner {
        supportedChains[_chainId] = true;
    }
} 