// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OmniPayTracker {
    struct PaymentRecord {
        address sender;
        address recipient;
        uint256 amountSent; // Amount of original token sent
        uint256 usdcAmountReceived; // Amount of USDC expected/received
        uint256 timestamp;
        bytes32 transactionHash; // Hash of the cross-chain transaction
        bool receivedConfirmed; // True if recipient confirmed receipt
    }

    mapping(bytes32 => PaymentRecord) public paymentRecords;
    bytes32[] public paymentHashes; // To easily iterate through records

    event PaymentRecorded(bytes32 indexed txHash, address sender, address recipient, uint256 usdcAmount);
    event PaymentConfirmed(bytes32 indexed txHash, address recipient);

    // Function to record a new cross-chain payment
    function recordPayment(
        address _sender,
        address _recipient,
        uint256 _amountSent,
        uint256 _usdcAmountReceived,
        bytes32 _transactionHash
    ) public {
        require(paymentRecords[_transactionHash].sender == address(0), "Payment already recorded");

        paymentRecords[_transactionHash] = PaymentRecord({
            sender: _sender,
            recipient: _recipient,
            amountSent: _amountSent,
            usdcAmountReceived: _usdcAmountReceived,
            timestamp: block.timestamp,
            transactionHash: _transactionHash,
            receivedConfirmed: false
        });
        paymentHashes.push(_transactionHash);

        emit PaymentRecorded(_transactionHash, _sender, _recipient, _usdcAmountReceived);
    }

    // Function for the recipient to confirm receipt (simulated)
    function confirmReceipt(bytes32 _transactionHash) public {
        PaymentRecord storage record = paymentRecords[_transactionHash];
        require(record.recipient == msg.sender, "Only recipient can confirm");
        require(!record.receivedConfirmed, "Receipt already confirmed");

        record.receivedConfirmed = true;
        emit PaymentConfirmed(_transactionHash, msg.sender);
    }

    // Optional: Get all recorded payment hashes
    function getAllPaymentHashes() public view returns (bytes32[] memory) {
        return paymentHashes;
    }

    // Optional: Get a single payment record
    function getPaymentRecord(bytes32 _transactionHash) public view returns (
        address sender,
        address recipient,
        uint256 amountSent,
        uint256 usdcAmountReceived,
        uint256 timestamp,
        bytes32 transactionHash,
        bool receivedConfirmed
    ) {
        PaymentRecord storage record = paymentRecords[_transactionHash];
        return (
            record.sender,
            record.recipient,
            record.amountSent,
            record.usdcAmountReceived,
            record.timestamp,
            record.transactionHash,
            record.receivedConfirmed
        );
    }
}
