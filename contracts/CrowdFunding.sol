// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract Crowdfunding {
    struct Campaign {
        address creator;
        uint256 goal;
        uint256 pledged;
        uint256 end;
        bool claimed;
    }

    uint256 public numCampaigns;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public pledges;

    function startCampaign(
        uint256 goalAmount,
        uint256 duration
    ) external returns (uint256 campaignId) {
        campaignId = numCampaigns++;
        Campaign storage c = campaigns[campaignId];
        c.creator = msg.sender;
        c.goal = goalAmount;
        c.end = block.timestamp + duration;
        c.claimed = false;
    }

    function pledge(uint256 campaignId) external payable {
        Campaign storage c = campaigns[campaignId];
        require(block.timestamp < c.end, "Campaign finished");
        c.pledged += msg.value;
        pledges[campaignId][msg.sender] += msg.value;
    }

    function claimFunds(uint256 campaignId) external {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "Not creator");
        require(block.timestamp >= c.end, "Campaign not ended");
        require(c.pledged >= c.goal, "Goal not reached");
        require(!c.claimed, "Already claimed");

        c.claimed = true;
        payable(msg.sender).transfer(c.pledged);
    }

    function getRefund(uint256 campaignId) external {
        Campaign storage c = campaigns[campaignId];
        require(block.timestamp >= c.end, "Campaign not ended");
        require(c.pledged < c.goal, "Goal reached");

        uint256 amountPledged = pledges[campaignId][msg.sender];
        pledges[campaignId][msg.sender] = 0;
        payable(msg.sender).transfer(amountPledged);
    }

    // To implement: add more features as per points below
    // Add the ability to set minimum and maximum contribution limits.
    // Implement an event system for all contract actions.
    // Develop a system to grant rewards based on the contribution amount in the form of another ERC20 token.
    // Add test cases for the contract functions
    // Frontend to interact with the contract functions. And see real time contributed amounts.
}
