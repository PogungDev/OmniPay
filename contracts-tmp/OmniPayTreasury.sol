// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmniPayTreasury is ReentrancyGuard, Ownable {
    struct YieldPosition {
        address token;
        uint256 amount;
        uint256 startTime;
        uint256 apy; // APY in basis points (100 = 1%)
        uint256 earned;
        bool isActive;
        string strategy; // "lending", "staking", "liquidity"
    }

    struct TokenBalance {
        address token;
        uint256 balance;
        uint256 usdValue;
        string symbol;
        uint256 lastUpdated;
    }

    struct RebalanceRule {
        address token;
        uint256 targetPercentage; // in basis points (1000 = 10%)
        uint256 tolerance; // in basis points (500 = 5%)
        bool isActive;
    }

    mapping(address => mapping(address => YieldPosition)) public userPositions; // user => token => position
    mapping(address => TokenBalance[]) public userBalances;
    mapping(address => uint256) public totalPortfolioValue;
    mapping(address => RebalanceRule[]) public userRebalanceRules;
    mapping(address => uint256) public tokenAPY; // token => APY in basis points
    mapping(address => bool) public autoRebalanceEnabled;

    event YieldPositionCreated(address indexed user, address indexed token, uint256 amount, uint256 apy);
    event YieldClaimed(address indexed user, address indexed token, uint256 amount);
    event BalanceUpdated(address indexed user, address indexed token, uint256 newBalance);
    event RebalanceExecuted(address indexed user, uint256 gasUsed);
    event AutoRebalanceToggled(address indexed user, bool enabled);

    constructor() {
        // Set initial APY rates for common tokens (in basis points)
        tokenAPY[0xA0b86a33E6441b8dB4B2b8b8b8b8b8b8b8b8b8b8] = 850; // USDC: 8.5%
        tokenAPY[0x0000000000000000000000000000000000000000] = 1230; // ETH: 12.3%
    }

    function setTokenAPY(address _token, uint256 _apy) external onlyOwner {
        require(_apy <= 10000, "APY cannot exceed 100%");
        tokenAPY[_token] = _apy;
    }

    function depositForYield(address _token, uint256 _amount, string memory _strategy) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(tokenAPY[_token] > 0, "Token not supported for yield");
        
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);

        YieldPosition storage position = userPositions[msg.sender][_token];
        
        if (position.isActive) {
            // Claim existing yield before updating position
            _claimYield(msg.sender, _token);
            position.amount += _amount;
        } else {
            position.token = _token;
            position.amount = _amount;
            position.startTime = block.timestamp;
            position.apy = tokenAPY[_token];
            position.earned = 0;
            position.isActive = true;
            position.strategy = _strategy;
        }

        emit YieldPositionCreated(msg.sender, _token, _amount, position.apy);
    }

    function claimYield(address _token) external nonReentrant {
        _claimYield(msg.sender, _token);
    }

    function _claimYield(address _user, address _token) internal {
        YieldPosition storage position = userPositions[_user][_token];
        require(position.isActive, "No active position");

        uint256 timeElapsed = block.timestamp - position.startTime;
        uint256 yearlyYield = (position.amount * position.apy) / 10000;
        uint256 earnedYield = (yearlyYield * timeElapsed) / 365 days;

        if (earnedYield > 0) {
            position.earned += earnedYield;
            position.startTime = block.timestamp; // Reset timer
            
            emit YieldClaimed(_user, _token, earnedYield);
        }
    }

    function withdrawPosition(address _token) external nonReentrant {
        YieldPosition storage position = userPositions[msg.sender][_token];
        require(position.isActive, "No active position");

        _claimYield(msg.sender, _token);
        
        uint256 totalAmount = position.amount + position.earned;
        position.isActive = false;
        position.amount = 0;
        position.earned = 0;

        IERC20(_token).transfer(msg.sender, totalAmount);
    }

    function setRebalanceRule(
        address _token,
        uint256 _targetPercentage,
        uint256 _tolerance
    ) external {
        require(_targetPercentage <= 10000, "Target percentage cannot exceed 100%");
        require(_tolerance <= 1000, "Tolerance cannot exceed 10%");

        RebalanceRule[] storage rules = userRebalanceRules[msg.sender];
        
        // Check if rule already exists for this token
        bool found = false;
        for (uint i = 0; i < rules.length; i++) {
            if (rules[i].token == _token) {
                rules[i].targetPercentage = _targetPercentage;
                rules[i].tolerance = _tolerance;
                rules[i].isActive = true;
                found = true;
                break;
            }
        }
        
        if (!found) {
            rules.push(RebalanceRule({
                token: _token,
                targetPercentage: _targetPercentage,
                tolerance: _tolerance,
                isActive: true
            }));
        }
    }

    function executeRebalance() external nonReentrant {
        uint256 gasStart = gasleft();
        
        // Rebalancing logic would go here
        // For now, just emit event
        
        uint256 gasUsed = gasStart - gasleft();
        emit RebalanceExecuted(msg.sender, gasUsed);
    }

    function toggleAutoRebalance() external {
        autoRebalanceEnabled[msg.sender] = !autoRebalanceEnabled[msg.sender];
        emit AutoRebalanceToggled(msg.sender, autoRebalanceEnabled[msg.sender]);
    }

    function updateUserBalance(
        address _user,
        address _token,
        uint256 _balance,
        uint256 _usdValue,
        string memory _symbol
    ) external onlyOwner {
        TokenBalance[] storage balances = userBalances[_user];
        bool found = false;
        
        for (uint i = 0; i < balances.length; i++) {
            if (balances[i].token == _token) {
                balances[i].balance = _balance;
                balances[i].usdValue = _usdValue;
                balances[i].lastUpdated = block.timestamp;
                found = true;
                break;
            }
        }
        
        if (!found) {
            balances.push(TokenBalance({
                token: _token,
                balance: _balance,
                usdValue: _usdValue,
                symbol: _symbol,
                lastUpdated: block.timestamp
            }));
        }

        // Update total portfolio value
        uint256 total = 0;
        for (uint i = 0; i < balances.length; i++) {
            total += balances[i].usdValue;
        }
        totalPortfolioValue[_user] = total;

        emit BalanceUpdated(_user, _token, _balance);
    }

    function getUserBalances(address _user) external view returns (TokenBalance[] memory) {
        return userBalances[_user];
    }

    function getUserPosition(address _user, address _token) external view returns (YieldPosition memory) {
        return userPositions[_user][_token];
    }

    function getPortfolioValue(address _user) external view returns (uint256) {
        return totalPortfolioValue[_user];
    }

    function getUserRebalanceRules(address _user) external view returns (RebalanceRule[] memory) {
        return userRebalanceRules[_user];
    }

    function isAutoRebalanceEnabled(address _user) external view returns (bool) {
        return autoRebalanceEnabled[_user];
    }
}
