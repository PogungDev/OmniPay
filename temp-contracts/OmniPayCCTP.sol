// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmniPayCCTP is ReentrancyGuard, Ownable {
    struct CCTPTransfer {
        bytes32 transferId;
        address sender;
        address recipient;
        uint256 amount;
        uint32 destinationDomain;
        uint32 sourceDomain;
        uint64 nonce;
        bytes32 burnTxHash;
        bytes32 attestation;
        uint8 status; // 0: pending, 1: attested, 2: completed, 3: failed
        uint256 timestamp;
    }

    struct ChainConfig {
        uint32 domain;
        address tokenMessenger;
        address messageTransmitter;
        address usdcToken;
        bool isActive;
    }

    mapping(bytes32 => CCTPTransfer) public transfers;
    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(address => bytes32[]) public userTransfers;
    bytes32[] public allTransfers;

    // CCTP Contract addresses (mainnet)
    address public constant TOKEN_MESSENGER = 0xBd3fa81B58Ba92a82136038B25aDec7066af3155;
    address public constant MESSAGE_TRANSMITTER = 0x0a992d191DEeC32aFe36203Ad87D7d289a738F81;
    address public constant USDC_TOKEN = 0xA0b86a33E6441b8dB4B2b8b8b8b8b8b8b8b8b8b8;

    event TransferInitiated(
        bytes32 indexed transferId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint32 destinationDomain
    );
    
    event TransferCompleted(
        bytes32 indexed transferId,
        bytes32 attestation
    );
    
    event ChainConfigUpdated(
        uint256 indexed chainId,
        uint32 domain,
        address tokenMessenger
    );

    constructor() {
        // Initialize chain configurations
        _initializeChainConfigs();
    }

    function _initializeChainConfigs() internal {
        // Ethereum Mainnet
        chainConfigs[1] = ChainConfig({
            domain: 0,
            tokenMessenger: 0xBd3fa81B58Ba92a82136038B25aDec7066af3155,
            messageTransmitter: 0x0a992d191DEeC32aFe36203Ad87D7d289a738F81,
            usdcToken: 0xA0b86a33E6441b8dB4B2b8b8b8b8b8b8b8b8b8b8,
            isActive: true
        });

        // Avalanche
        chainConfigs[43114] = ChainConfig({
            domain: 1,
            tokenMessenger: 0x6B25532e1060CE10cc3B0A99e5683b91BFDe6982,
            messageTransmitter: 0x8186359aF5F57FbB40c6b14A588d2A59C0C29880,
            usdcToken: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E,
            isActive: true
        });

        // Arbitrum
        chainConfigs[42161] = ChainConfig({
            domain: 3,
            tokenMessenger: 0x19330d10D9Cc8751218eaf51E8885D058642E08A,
            messageTransmitter: 0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca,
            usdcToken: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831,
            isActive: true
        });

        // Base
        chainConfigs[8453] = ChainConfig({
            domain: 6,
            tokenMessenger: 0x1682Ae6375C4E4A97e4B583BC394c861A46D8962,
            messageTransmitter: 0xAD09780d193884d503182aD4588450C416D6F9D4,
            usdcToken: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,
            isActive: true
        });

        // Polygon
        chainConfigs[137] = ChainConfig({
            domain: 7,
            tokenMessenger: 0x9daF8c91AEFAE50b9c0E69629D3F6Ca40cA3B3FE,
            messageTransmitter: 0xF3be9355363857F3e001be68856A2f96b4C39Ba9,
            usdcToken: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359,
            isActive: true
        });
    }

    function initiateCCTPTransfer(
        address _recipient,
        uint256 _amount,
        uint256 _destinationChainId
    ) external nonReentrant returns (bytes32) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient");
        require(chainConfigs[_destinationChainId].isActive, "Destination chain not supported");

        ChainConfig memory destConfig = chainConfigs[_destinationChainId];
        
        // Transfer USDC from user to this contract
        IERC20(USDC_TOKEN).transferFrom(msg.sender, address(this), _amount);
        
        // Approve TokenMessenger to burn USDC
        IERC20(USDC_TOKEN).approve(TOKEN_MESSENGER, _amount);
        
        // Create transfer ID
        bytes32 transferId = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipient,
                _amount,
                destConfig.domain,
                block.timestamp,
                block.number
            )
        );

        // Store transfer data
        transfers[transferId] = CCTPTransfer({
            transferId: transferId,
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            destinationDomain: destConfig.domain,
            sourceDomain: 0, // Ethereum domain
            nonce: 0, // Will be updated from actual burn
            burnTxHash: bytes32(0),
            attestation: bytes32(0),
            status: 0, // pending
            timestamp: block.timestamp
        });

        userTransfers[msg.sender].push(transferId);
        allTransfers.push(transferId);

        emit TransferInitiated(
            transferId,
            msg.sender,
            _recipient,
            _amount,
            destConfig.domain
        );

        return transferId;
    }

    function completeTransfer(
        bytes32 _transferId,
        bytes calldata _attestation
    ) external nonReentrant {
        CCTPTransfer storage transfer = transfers[_transferId];
        require(transfer.status == 1, "Transfer not attested or already completed");
        
        transfer.attestation = keccak256(_attestation);
        transfer.status = 2; // completed
        
        emit TransferCompleted(_transferId, transfer.attestation);
    }

    function updateTransferStatus(
        bytes32 _transferId,
        uint8 _status,
        uint64 _nonce,
        bytes32 _burnTxHash
    ) external onlyOwner {
        CCTPTransfer storage transfer = transfers[_transferId];
        transfer.status = _status;
        transfer.nonce = _nonce;
        transfer.burnTxHash = _burnTxHash;
    }

    function getTransfer(bytes32 _transferId) external view returns (CCTPTransfer memory) {
        return transfers[_transferId];
    }

    function getUserTransfers(address _user) external view returns (bytes32[] memory) {
        return userTransfers[_user];
    }

    function getAllTransfers() external view returns (bytes32[] memory) {
        return allTransfers;
    }

    function getChainConfig(uint256 _chainId) external view returns (ChainConfig memory) {
        return chainConfigs[_chainId];
    }

    function updateChainConfig(
        uint256 _chainId,
        uint32 _domain,
        address _tokenMessenger,
        address _messageTransmitter,
        address _usdcToken,
        bool _isActive
    ) external onlyOwner {
        chainConfigs[_chainId] = ChainConfig({
            domain: _domain,
            tokenMessenger: _tokenMessenger,
            messageTransmitter: _messageTransmitter,
            usdcToken: _usdcToken,
            isActive: _isActive
        });
        
        emit ChainConfigUpdated(_chainId, _domain, _tokenMessenger);
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
} 