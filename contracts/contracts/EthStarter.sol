pragma solidity ^0.4.0;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Whitelist.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract IDataStore is Whitelist {
    function insert(uint256 id, address owner, uint256 goal, uint256 date) public;
    function remove(uint256 id) public;
    function pay(uint256 id, address who, uint256 amount) public;
    function get(uint256 id) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256);
    function first() public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256);
    function last() public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256);
    function balanceOf(uint256 id, address user) public view returns(uint256);
}

contract DataStore is Whitelist, IDataStore {
    // Using statements
    using SafeMath for uint;
    using SafeMath for uint256;

    // Basic campaign structure
    struct Campaign {
        address owner;
        uint256 goal;
        uint256 date;
        mapping(address => uint256) balanceOf;
        address[] contributors;
    }
    
    // Double linked list node
    struct Node {
        Campaign campaign;
        uint256 prev;
        uint256 next;
    }

    // Data holder
    struct Data {
        mapping(uint256 => Node) map;
        uint256 first;
        uint256 last;
    }

    // Attributes
    Data data;

    function insert(uint256 id, address owner, uint256 goal, uint256 date) public onlyWhitelisted {
        // Fetch campaign
        Node storage node = data.map[id];
        
        // Must not exist yet and have goal and date
        require(node.campaign.date == 0);
        require(goal > 0);
        require(date > 0);
        
        // Update the new node
        node.campaign.owner = owner;
        node.campaign.goal = goal;
        node.campaign.date = date;
        node.prev = data.last;

        // Update previous node next
        data.map[data.last].next = id;

        // Update last ID
        data.last = id;

        // Update first?
        if (data.first == 0) {
            data.first = id;
        }
    }

    function remove(uint256 id) public onlyWhitelisted {
        Node storage node = data.map[id];

        data.map[node.prev].next = node.next;
        data.map[node.next].prev = node.prev;

        if (data.last == id) {
            data.last = node.prev;
        }

        if (data.first == id) {
            data.first = node.next;
        }
    }

    // No rewards nor events are handled here
    function pay(uint256 id, address who, uint256 amount) public onlyWhitelisted {
        Campaign storage c = data.map[id].campaign;
        require(c.date > 0);
        require(amount > 0);

        // Keep track of individual accounts
        if (c.balanceOf[who] == 0) {
            c.contributors.push(who);
        }

        // Update balance
        c.balanceOf[who] = c.balanceOf[msg.sender].add(amount);
    }

    function get(uint256 id) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256)  {
        Node storage n = data.map[id];
        Campaign storage c = n.campaign;
        return (id, c.owner, c.goal, c.date, c.balanceOf[msg.sender], n.prev, n.next);
    }
    
    function first() public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256) {
        return get(data.last);
    }
    
    function last() public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256) {
        return get(data.last);
    }

    function balanceOf(uint256 id, address user) public view returns(uint256) {
        return data.map[id].campaign.balanceOf[user];
    }
}


contract EthStarter is Ownable, Destructible {
    // Using statements
    using SafeMath for uint;
    using SafeMath for uint256;
    
    // Events
    event CampaignPendingReview(uint256 id, address owner, uint256 goal, uint256 date);
    event CampaignPublished(uint256 id, address owner, uint256 goal, uint256 date);
    event Payment(uint256 id, address from, uint256 value, uint256 total);
    
    // Data
    IDataStore public publicCampaigns;
    IDataStore public pendingCampaigns;

    // Rewards for campaigns
    mapping(uint256 => IReward) rewards;

    constructor(address publicCampaignsAddr, address pendingCampaignsAddr) public {
        if (publicCampaignsAddr == address(0)) {
            publicCampaigns = new DataStore();
            publicCampaignsAddr = address(publicCampaigns);
        }

        if (pendingCampaignsAddr == address(0)) {
            pendingCampaigns = new DataStore();
            pendingCampaignsAddr = address(pendingCampaigns);
        }

        // Immediately claim access to those contracts
        switchPublicDataStore(publicCampaignsAddr);
        switchPendingDataStore(pendingCampaignsAddr);
    }

    function switchPublicDataStore(address newAddress) public onlyOwner {
        require(newAddress != address(0));
        publicCampaigns = IDataStore(newAddress);
        publicCampaigns.addAddressToWhitelist(owner);
        publicCampaigns.addAddressToWhitelist(this);
    }

    function switchPendingDataStore(address newAddress) public onlyOwner {
        require(newAddress != address(0));
        pendingCampaigns = IDataStore(newAddress);
        pendingCampaigns.addAddressToWhitelist(owner);
        pendingCampaigns.addAddressToWhitelist(this);
    }

    // TODO: All this operations are interfaces
    function addCampaign(uint256 ipfsHash, uint256 goal, uint256 date) public {
        pendingCampaigns.insert(ipfsHash, msg.sender, goal, date);

        emit CampaignPendingReview(ipfsHash, msg.sender, goal, date);
    }
    
    function approve(uint256 ipfsHash) public {
        var (, owner, goal, date,,,) = pendingCampaigns.get(ipfsHash);
        assert(date > 0);

        pendingCampaigns.remove(ipfsHash);
        publicCampaigns.insert(ipfsHash, owner, goal, date);

        emit CampaignPublished(ipfsHash, msg.sender, goal, date);
    }

    // TODO: Pay functionality in the new system
    function payCampaign(uint256 id) public payable {
        // Get old balance first
        uint256 oldBalance = publicCampaigns.balanceOf(id, msg.sender);

        // If campaign is invalid or value is 0, this call throws
        publicCampaigns.pay(id, msg.sender, msg.value);
        
        if (address(rewards[id]) != 0) {
            rewards[id].onPayment(msg.sender, msg.value, oldBalance);
        }
        
        // New balance can be calculated now, its cheaper than calling
        uint256 newBalance = oldBalance.add(msg.value);
        emit Payment(id, msg.sender, msg.value, newBalance);
    }


    // DataStore views should be directly accessed, for example:
    // IDataStore(publicCampaigns()).last()

    // function get(uint256 id) public view returns(uint256, address, uint256, uint256, uint256, uint256) {
    //     return publicCampaigns.get(id);
    // }
    
    // function first() public view onlyOwner returns(uint256, address, uint256, uint256, uint256, uint256) {
    //     return pendingCampaigns.first();
    // }
    
    // function last() public view returns(uint256, address, uint256, uint256, uint256, uint256) {
    //     return publicCampaigns.last();
    // }

    // function getPending(uint256 id) public view onlyOwner returns(uint256, address, uint256, uint256, uint256, uint256) {
    //     return pendingCampaigns.get(id);
    // }
    
    // function firstPending() public view onlyOwner returns(uint256, address, uint256, uint256, uint256, uint256) {
    //     return pendingCampaigns.first();
    // }
    
    // function lastPending() public view onlyOwner returns(uint256, address, uint256, uint256, uint256, uint256) {
    //     return pendingCampaigns.last();
    // }
    
    // function balanceOf(uint256 id, address user) public view returns(uint256) {
    //     return publicCampaigns.balanceOf(id, user);
    // }
}

contract IReward {
    function onPayment(address from, uint256 value, uint256 oldBalance) public view;
    function onEnd(address backer, uint256 amount) public view;
}
