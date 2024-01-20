// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SimpleNFTMarketplace is ERC721URIStorage, ReentrancyGuard {
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    Listing[] public listings;
    uint256 public listingCount;

    constructor() ERC721("SimpleNFTMarketplace", "SNFTM") {}

    function createListing(address nftAddress, uint256 tokenId, uint256 price) public nonReentrant {
        // Transfer NFT to contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        
        // Create listing
        listings.push(Listing({
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            price: price,
            isActive: true
        }));
        listingCount++;

        // Emit event (not included but recommended)
    }

    function purchaseListing(uint256 listingId) public payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing is not active");
        require(msg.value == listing.price, "Incorrect payment amount");

        // Transfer payment to seller
        payable(listing.seller).transfer(msg.value);

        // Transfer NFT to buyer
        IERC721(listing.nftAddress).safeTransferFrom(address(this), msg.sender, listing.tokenId);

        // Update listing
        listing.isActive = false;

        // Emit event (not included but recommended)
    }
    
    // To implement: add more features as per points below
        // Function to allow sellers to cancel their listings.
        // Functions for updating listing prices.
        // Implement an event system for all contract actions.
        // Add a platform fee percentage for all purchases in the marketplace.

}