pragma solidity ^0.4.0;

import "https://github.com/ethereum/solidity/std/owned.sol";
import "https://github.com/ethereum/solidity/std/mortal.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract EthStarter is owned, mortal {
    // Using statements
    using SafeMath for uint;
    using SafeMath for uint256;
    
    // Events
    event CampaignPublished(uint256 id, address owner, uint256 goal, uint256 date);
    event Payment(uint256 id, address from, uint256 value);
    
    // Data
    struct Campaign {
        address owner;
        uint256 goal;
        uint256 date;
        mapping(address => uint256) balanceOf;
        IReward reward;
    }
    
    struct Node {
        Campaign campaign;
        uint256 prev;
    }
    
    mapping(uint256 => Node) campaigns;
    uint256 public lastCampaignId;
    
    // Functions
    function payCampaign(uint256 id) public payable {
        require(campaigns[id].campaign.date != 0);
        require(msg.value > 0);
        
        Campaign storage c = campaigns[id].campaign;
        uint256 oldBalance = c.balanceOf[msg.sender];
        c.balanceOf[msg.sender] = c.balanceOf[msg.sender].add(msg.value);
        
        if (address(c.reward) != 0) {
            c.reward.onPayment(msg.sender, msg.value, oldBalance);
        }
        
        emit Payment(id, msg.sender, msg.value);
    }
    
    function addCampaign(uint256 ipfsHash, uint256 goal, uint256 date) public {
        require(campaigns[ipfsHash].campaign.date == 0);
        require(date > 0);
        require(goal > 0);
        
        Node storage node = campaigns[ipfsHash];
        node.campaign.owner = msg.sender;
        node.campaign.goal = goal;
        node.campaign.date = date;
        node.prev = lastCampaignId;
        lastCampaignId = ipfsHash;
        
        emit CampaignPublished(ipfsHash, msg.sender, goal, date);
    }
    
    function campaign(uint256 id) public view returns(uint256, address, uint256, uint256, uint256, uint256) {
        Campaign storage c = campaigns[id].campaign;
        return (id, c.owner, c.goal, c.date, c.balanceOf[msg.sender], campaigns[id].prev);
    }
    
    function lastCampaign() public view returns(uint256, address, uint256, uint256, uint256, uint256) {
        return campaign(lastCampaignId);
    }
    
    function balanceOf(uint256 id, address user) public view returns(uint256) {
        return campaigns[id].campaign.balanceOf[user];
    }
}

contract IReward {
    function onPayment(address from, uint256 value, uint256 oldBalance) public view;
    function onEnd(address backer, uint256 amount) public view;
}

