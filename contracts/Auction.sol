// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auction {
    struct AuctionItem {
        address seller;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool isEnded;
        bool isClaimed;
    }

    mapping(uint256 => AuctionItem) public auctions;
    uint256 public nextAuctionId;
    
    event AuctionCreated(uint256 auctionId, address seller, uint256 endTime);
    event BidPlaced(uint256 auctionId, address bidder, uint256 bid);
    event AuctionEnded(uint256 auctionId, address winner, uint256 highestBid);

    function createAuction(uint256 startingPrice, uint256 duration) external returns (uint256 auctionId) {
        auctionId = nextAuctionId++;
        auctions[auctionId] = AuctionItem(
            msg.sender,
            startingPrice,
            0,
            address(0),
            block.timestamp + duration,
            false,
            false
        );
        emit AuctionCreated(auctionId, msg.sender, block.timestamp + duration);
    }

    function placeBid(uint256 auctionId) external payable {
        AuctionItem storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction already ended");
        require(msg.value > auction.highestBid, "Bid is not higher than current highest bid");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid); // Refund the previous highest bidder
        }

        auction.highestBid = msg.value;
        auction.highestBidder = msg.sender;
        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    function endAuction(uint256 auctionId) external {
        AuctionItem storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction not yet ended");
        require(!auction.isEnded, "Auction end already called");

        auction.isEnded = true;
        if (auction.highestBidder != address(0)) {
            payable(auction.seller).transfer(auction.highestBid); // Send the highest bid to the seller
        }

        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
    }

    // To implement: add more features as per points below
        // Implement ERC721 transfer logic when the auction is created and when the winning bid is confirmed.
        // Implement an event system for all contract actions.
        // Add withdrawal logic allowing bidders to withdraw their bids so long as they aren’t the current highest bidder.
        // Frontend to interact with the contract functions that shows live auctions, allows for placing bids, and displays auction results, 
        // with real-time updates facilitated by listening to emitted events.

}