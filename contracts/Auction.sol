// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface IERC721 {
    function safeTransferFrom(address from, address to, uint tokenId) external;

    function transferFrom(address, address, uint) external;
}

contract Auction {
    IERC721 public nft;
    uint public nftId;

    address payable public seller;
    uint public endAt;
    bool public started;
    bool public ended;

    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) public bids;

    constructor(address _nft, uint _nftId, uint _startingBid) {
        nft = IERC721(_nft);
        nftId = _nftId;

        seller = payable(msg.sender);
        highestBid = _startingBid;
    }

    function start() external {
        require(!started, "Auction already started");
        require(msg.sender == seller, "Only seller can start auction");

        nft.transferFrom(msg.sender, address(this), nftId);
        started = true;
        endAt = block.timestamp + 7 days;
    }

    function bid() external payable {
        require(started, "Auction not started");
        require(block.timestamp < endAt, "Auction ended");
        require(msg.value > highestBid, "Bid not higher than current highest");

        if (highestBidder != address(0)) {
            // Instead of sending the Ether back, add the highestBid of the previous highestBidder back to their balance for withdrawal
            bids[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function end() external {
        require(started, "Auction not started");
        require(
            block.timestamp >= endAt || msg.sender == seller,
            "Auction not yet ended"
        );
        require(!ended, "Auction already ended");

        ended = true;
        if (highestBidder != address(0)) {
            // Transfer the NFT to the highest bidder and funds to the seller
            nft.safeTransferFrom(address(this), highestBidder, nftId);
            seller.transfer(highestBid);
        } else {
            // Revert the NFT transfer to the seller if no bids were made
            nft.safeTransferFrom(address(this), seller, nftId);
        }
    }

    // To implement: add more features as per points below
    // Implement an event system for all contract actions.
    // Add withdrawal logic allowing bidders to withdraw their bids so long as they aren’t the current highest bidder.
    // Change the system to allow bidding with a specified ERC-20 token than ETH.
    // Frontend to interact with the contract functions that shows live auction, current highest bid, allows for placing bids, and displays auction results.
}
