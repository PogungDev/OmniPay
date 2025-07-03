// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmniPayHistory is ReentrancyGuard, Ownable {
    struct Transaction {
        bytes32 txId;
        address sender;
        address recipient;
        address token;
        string tokenSymbol;
        uint256 amount;
        uint256 usdValue;
        uint256 timestamp;
        uint256 blockNumber;
        uint256 chainId;
        string txType; // "send", "receive", "bridge", "swap", "yield", "payout"
        string status; // "pending", "completed", "failed"
        bytes32 crossChainTxHash;
        uint256 gasUsed;
        uint256 gasFee;
        string notes;
    }

    struct TransactionFilter {
        uint256 fromDate;
        uint256 toDate;
        string txType;
        string status;
        address token;
        uint256 minAmount;
        uint256 maxAmount;
    }

    struct UserStats {
        uint256 totalTransactions;
        uint256 totalSent;
        uint256 totalReceived;
        uint256 totalGasFees;
        uint256 firstTransactionTime;
        uint256 lastTransactionTime;
        mapping(string => uint256) transactionsByType;
        mapping(address => uint256) transactionsByToken;
    }

    mapping(bytes32 => Transaction) public transactions;
    mapping(address => bytes32[]) public userTransactions;
    mapping(address => UserStats) public userStats;
    mapping(uint256 => bytes32[]) public transactionsByDate; // date => txIds
    bytes32[] public allTransactions;

    event TransactionRecorded(bytes32 indexed txId, address indexed user, string txType);
    event TransactionUpdated(bytes32 indexed txId, string newStatus);

    function recordTransaction(
        bytes32 _txId,
        address _sender,
        address _recipient,
        address _token,
        string memory _tokenSymbol,
        uint256 _amount,
        uint256 _usdValue,
        uint256 _chainId,
        string memory _txType,
        bytes32 _crossChainTxHash,
        uint256 _gasUsed,
        uint256 _gasFee,
        string memory _notes
    ) external {
        require(_sender != address(0) || _recipient != address(0), "Invalid addresses");
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_txType).length > 0, "Transaction type required");

        transactions[_txId] = Transaction({
            txId: _txId,
            sender: _sender,
            recipient: _recipient,
            token: _token,
            tokenSymbol: _tokenSymbol,
            amount: _amount,
            usdValue: _usdValue,
            timestamp: block.timestamp,
            blockNumber: block.number,
            chainId: _chainId,
            txType: _txType,
            status: "pending",
            crossChainTxHash: _crossChainTxHash,
            gasUsed: _gasUsed,
            gasFee: _gasFee,
            notes: _notes
        });

        // Add to user transactions
        if (_sender != address(0)) {
            userTransactions[_sender].push(_txId);
            _updateUserStats(_sender, _amount, _usdValue, _gasFee, _txType, _token);
        }
        
        if (_recipient != address(0) && _recipient != _sender) {
            userTransactions[_recipient].push(_txId);
            _updateUserStats(_recipient, 0, _usdValue, 0, "receive", _token);
        }

        // Add to date index
        uint256 dateKey = block.timestamp / 86400; // Daily grouping
        transactionsByDate[dateKey].push(_txId);
        
        allTransactions.push(_txId);

        emit TransactionRecorded(_txId, _sender, _txType);
    }

    function _updateUserStats(
        address _user,
        uint256 _amount,
        uint256 _usdValue,
        uint256 _gasFee,
        string memory _txType,
        address _token
    ) internal {
        UserStats storage stats = userStats[_user];
        
        stats.totalTransactions += 1;
        stats.totalGasFees += _gasFee;
        stats.lastTransactionTime = block.timestamp;
        
        if (stats.firstTransactionTime == 0) {
            stats.firstTransactionTime = block.timestamp;
        }

        // Update type-specific stats
        if (keccak256(bytes(_txType)) == keccak256(bytes("send"))) {
            stats.totalSent += _usdValue;
        } else if (keccak256(bytes(_txType)) == keccak256(bytes("receive"))) {
            stats.totalReceived += _usdValue;
        }

        stats.transactionsByType[_txType] += 1;
        stats.transactionsByToken[_token] += 1;
    }

    function updateTransactionStatus(bytes32 _txId, string memory _newStatus) external {
        require(transactions[_txId].txId == _txId, "Transaction not found");
        
        transactions[_txId].status = _newStatus;
        emit TransactionUpdated(_txId, _newStatus);
    }

    function getUserTransactions(address _user) external view returns (bytes32[] memory) {
        return userTransactions[_user];
    }

    function getTransaction(bytes32 _txId) external view returns (Transaction memory) {
        return transactions[_txId];
    }

    function getUserTransactionsPaginated(
        address _user,
        uint256 _offset,
        uint256 _limit
    ) external view returns (bytes32[] memory) {
        bytes32[] memory userTxs = userTransactions[_user];
        
        if (_offset >= userTxs.length) {
            return new bytes32[](0);
        }
        
        uint256 end = _offset + _limit;
        if (end > userTxs.length) {
            end = userTxs.length;
        }
        
        bytes32[] memory result = new bytes32[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = userTxs[userTxs.length - 1 - i]; // Reverse order (newest first)
        }
        
        return result;
    }

    function getTransactionsByDate(uint256 _date) external view returns (bytes32[] memory) {
        uint256 dateKey = _date / 86400;
        return transactionsByDate[dateKey];
    }

    function getUserStatsBasic(address _user) external view returns (
        uint256 totalTransactions,
        uint256 totalSent,
        uint256 totalReceived,
        uint256 totalGasFees,
        uint256 firstTransactionTime,
        uint256 lastTransactionTime
    ) {
        UserStats storage stats = userStats[_user];
        return (
            stats.totalTransactions,
            stats.totalSent,
            stats.totalReceived,
            stats.totalGasFees,
            stats.firstTransactionTime,
            stats.lastTransactionTime
        );
    }

    function getUserTransactionsByType(address _user, string memory _txType) external view returns (uint256) {
        return userStats[_user].transactionsByType[_txType];
    }

    function getUserTransactionsByToken(address _user, address _token) external view returns (uint256) {
        return userStats[_user].transactionsByToken[_token];
    }

    function getAllTransactions() external view returns (bytes32[] memory) {
        return allTransactions;
    }

    function searchTransactions(
        address _user,
        TransactionFilter memory _filter
    ) external view returns (bytes32[] memory) {
        bytes32[] memory userTxs = userTransactions[_user];
        bytes32[] memory results = new bytes32[](userTxs.length);
        uint256 resultCount = 0;

        for (uint256 i = 0; i < userTxs.length; i++) {
            Transaction memory tx = transactions[userTxs[i]];
            
            // Apply filters
            if (_filter.fromDate > 0 && tx.timestamp < _filter.fromDate) continue;
            if (_filter.toDate > 0 && tx.timestamp > _filter.toDate) continue;
            if (bytes(_filter.txType).length > 0 && keccak256(bytes(tx.txType)) != keccak256(bytes(_filter.txType))) continue;
            if (bytes(_filter.status).length > 0 && keccak256(bytes(tx.status)) != keccak256(bytes(_filter.status))) continue;
            if (_filter.token != address(0) && tx.token != _filter.token) continue;
            if (_filter.minAmount > 0 && tx.usdValue < _filter.minAmount) continue;
            if (_filter.maxAmount > 0 && tx.usdValue > _filter.maxAmount) continue;
            
            results[resultCount] = userTxs[i];
            resultCount++;
        }

        // Resize array to actual results
        bytes32[] memory finalResults = new bytes32[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            finalResults[i] = results[i];
        }

        return finalResults;
    }
}
