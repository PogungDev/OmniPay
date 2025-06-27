// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OmniPayRemittance is ReentrancyGuard, Ownable {
    struct RemittanceOrder {
        address sender;
        string recipientName;
        string recipientCountry;
        string recipientBank;
        string recipientAccount;
        string recipientPhone;
        uint256 amount;
        uint256 exchangeRate;
        uint256 fees;
        uint256 timestamp;
        string status; // "pending", "processing", "completed", "cancelled"
        bytes32 orderId;
        string fromCurrency;
        string toCurrency;
        uint256 estimatedDelivery; // timestamp
    }

    struct ExchangeRate {
        string fromCurrency;
        string toCurrency;
        uint256 rate; // Rate in basis points (10000 = 1.0000)
        uint256 lastUpdated;
        bool isActive;
    }

    struct Country {
        string name;
        string code;
        bool isSupported;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 processingTime; // in seconds
    }

    mapping(bytes32 => RemittanceOrder) public orders;
    mapping(address => bytes32[]) public userOrders;
    mapping(string => ExchangeRate) public exchangeRates; // "USD_IDR" => rate
    mapping(string => Country) public supportedCountries;
    bytes32[] public allOrders;

    uint256 public constant FEE_BASIS_POINTS = 300; // 3% fee
    uint256 public constant MIN_REMITTANCE_AMOUNT = 10 * 10**6; // $10 minimum

    event RemittanceCreated(bytes32 indexed orderId, address indexed sender, uint256 amount, string country);
    event RemittanceCompleted(bytes32 indexed orderId);
    event RemittanceCancelled(bytes32 indexed orderId);
    event ExchangeRateUpdated(string currencyPair, uint256 newRate);
    event CountryAdded(string countryCode, string countryName);

    constructor() {
        // Add some initial supported countries
        _addCountry("ID", "Indonesia", 10 * 10**6, 10000 * 10**6, 1800); // 30 minutes
        _addCountry("PH", "Philippines", 10 * 10**6, 5000 * 10**6, 3600); // 1 hour
        _addCountry("VN", "Vietnam", 10 * 10**6, 3000 * 10**6, 2700); // 45 minutes
        _addCountry("TH", "Thailand", 10 * 10**6, 8000 * 10**6, 1800); // 30 minutes
        
        // Set initial exchange rates
        _setExchangeRate("USD_IDR", 15800 * 10000); // 1 USD = 15,800 IDR
        _setExchangeRate("USD_PHP", 56 * 10000); // 1 USD = 56 PHP
        _setExchangeRate("USD_VND", 24000 * 10000); // 1 USD = 24,000 VND
        _setExchangeRate("USD_THB", 36 * 10000); // 1 USD = 36 THB
    }

    function _addCountry(
        string memory _code,
        string memory _name,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _processingTime
    ) internal {
        supportedCountries[_code] = Country({
            name: _name,
            code: _code,
            isSupported: true,
            minAmount: _minAmount,
            maxAmount: _maxAmount,
            processingTime: _processingTime
        });
        
        emit CountryAdded(_code, _name);
    }

    function addCountry(
        string memory _code,
        string memory _name,
        uint256 _minAmount,
        uint256 _maxAmount,
        uint256 _processingTime
    ) external onlyOwner {
        _addCountry(_code, _name, _minAmount, _maxAmount, _processingTime);
    }

    function _setExchangeRate(string memory _currencyPair, uint256 _rate) internal {
        exchangeRates[_currencyPair] = ExchangeRate({
            fromCurrency: "",
            toCurrency: "",
            rate: _rate,
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        emit ExchangeRateUpdated(_currencyPair, _rate);
    }

    function setExchangeRate(string memory _currencyPair, uint256 _rate) external onlyOwner {
        _setExchangeRate(_currencyPair, _rate);
    }

    function createRemittanceOrder(
        string memory _recipientName,
        string memory _recipientCountry,
        string memory _recipientBank,
        string memory _recipientAccount,
        string memory _recipientPhone,
        uint256 _amount,
        string memory _currencyPair
    ) external payable nonReentrant returns (bytes32) {
        require(_amount >= MIN_REMITTANCE_AMOUNT, "Amount below minimum");
        require(msg.value >= _amount, "Insufficient payment");
        require(bytes(_recipientName).length > 0, "Recipient name required");
        require(bytes(_recipientAccount).length > 0, "Recipient account required");

        Country memory country = supportedCountries[_recipientCountry];
        require(country.isSupported, "Country not supported");
        require(_amount >= country.minAmount, "Amount below country minimum");
        require(_amount <= country.maxAmount, "Amount exceeds country maximum");

        ExchangeRate memory rate = exchangeRates[_currencyPair];
        require(rate.isActive && rate.rate > 0, "Exchange rate not available");

        uint256 fees = (_amount * FEE_BASIS_POINTS) / 10000;
        uint256 netAmount = _amount - fees;
        
        bytes32 orderId = keccak256(abi.encodePacked(
            msg.sender,
            _recipientName,
            _recipientAccount,
            _amount,
            block.timestamp
        ));

        orders[orderId] = RemittanceOrder({
            sender: msg.sender,
            recipientName: _recipientName,
            recipientCountry: _recipientCountry,
            recipientBank: _recipientBank,
            recipientAccount: _recipientAccount,
            recipientPhone: _recipientPhone,
            amount: netAmount,
            exchangeRate: rate.rate,
            fees: fees,
            timestamp: block.timestamp,
            status: "pending",
            orderId: orderId,
            fromCurrency: "USD",
            toCurrency: _recipientCountry,
            estimatedDelivery: block.timestamp + country.processingTime
        });

        userOrders[msg.sender].push(orderId);
        allOrders.push(orderId);

        emit RemittanceCreated(orderId, msg.sender, netAmount, _recipientCountry);
        return orderId;
    }

    function completeRemittance(bytes32 _orderId) external onlyOwner {
        RemittanceOrder storage order = orders[_orderId];
        require(keccak256(bytes(order.status)) == keccak256(bytes("pending")), "Order not pending");

        order.status = "completed";
        emit RemittanceCompleted(_orderId);
    }

    function cancelRemittance(bytes32 _orderId) external {
        RemittanceOrder storage order = orders[_orderId];
        require(order.sender == msg.sender, "Only sender can cancel");
        require(
            keccak256(bytes(order.status)) == keccak256(bytes("pending")) ||
            keccak256(bytes(order.status)) == keccak256(bytes("processing")),
            "Order cannot be cancelled"
        );

        order.status = "cancelled";
        
        // Refund the sender
        uint256 refundAmount = order.amount + order.fees;
        payable(msg.sender).transfer(refundAmount);
        
        emit RemittanceCancelled(_orderId);
    }

    function getUserOrders(address _user) external view returns (bytes32[] memory) {
        return userOrders[_user];
    }

    function getOrder(bytes32 _orderId) external view returns (RemittanceOrder memory) {
        return orders[_orderId];
    }

    function getExchangeRate(string memory _currencyPair) external view returns (ExchangeRate memory) {
        return exchangeRates[_currencyPair];
    }

    function getCountry(string memory _countryCode) external view returns (Country memory) {
        return supportedCountries[_countryCode];
    }

    function getAllOrders() external view returns (bytes32[] memory) {
        return allOrders;
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
