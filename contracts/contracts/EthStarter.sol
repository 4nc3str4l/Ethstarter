pragma solidity ^0.4.24;

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

contract DataStore is IDataStore {
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


contract IEthStarterFactory is Whitelist {
    // MUST BE onlyWhitelisted TO PREVENT SPOOFING
    function create(address publicCampaignsAddr, address pendingCampaignsAddr) public;
    function instance() public view returns (IEthStarter);
}


contract IEthStarter is Whitelist, Destructible {
    // Events
    event CampaignPendingReview(uint256 id, address owner, uint256 goal, uint256 date);
    event CampaignPublished(uint256 id, address owner, uint256 goal, uint256 date);
    event Payment(uint256 id, address from, uint256 value, uint256 total);
    
    // Data
    IDataStore public publicCampaigns;
    IDataStore public pendingCampaigns;

    // Functions
    function migrate(IEthStarterFactory migrator) public;
    function addCampaign(uint256 ipfsHash, uint256 goal, uint256 date) public;
    function approve(uint256 ipfsHash) public;
    function payCampaign(uint256 id) public payable;
}


contract EthStarter is IEthStarter {
    // Using statements
    using SafeMath for uint;
    using SafeMath for uint256;

    // Rewards for campaigns
    mapping(uint256 => IReward) rewards;

    constructor(address publicCampaignsAddr, address pendingCampaignsAddr) public {
        if (publicCampaignsAddr == address(0)) {
            publicCampaigns = new DataStore();
            publicCampaigns.addAddressToWhitelist(owner);
            publicCampaigns.addAddressToWhitelist(this);
        }
        else {
            publicCampaigns = IDataStore(publicCampaignsAddr);
        }

        if (pendingCampaignsAddr == address(0)) {
            pendingCampaigns = new DataStore();
            pendingCampaigns.addAddressToWhitelist(owner);
            pendingCampaigns.addAddressToWhitelist(this);
        }
        else {
            pendingCampaigns = IDataStore(pendingCampaignsAddr);
        }

        addAddressToWhitelist(owner);
    }

    function migrate(IEthStarterFactory migrator) public onlyOwner {
        // Create new contract
        migrator.create(address(publicCampaigns), address(pendingCampaigns));
        IEthStarter migrated = migrator.instance();

        // Migrate data stores
        publicCampaigns.addAddressToWhitelist(address(migrated));
        publicCampaigns.transferOwnership(address(migrated));

        pendingCampaigns.addAddressToWhitelist(address(migrated));
        pendingCampaigns.transferOwnership(address(migrated));

        // Transfer everything
        destroyAndSend(migrated);
    }

    // TODO: All this operations are interfaces
    function addCampaign(uint256 ipfsHash, uint256 goal, uint256 date) public {
        pendingCampaigns.insert(ipfsHash, msg.sender, goal, date);

        emit CampaignPendingReview(ipfsHash, msg.sender, goal, date);
    }
    
    function approve(uint256 ipfsHash) public onlyOwner {
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
}

contract EthStarterFactory is IEthStarterFactory {
    IEthStarter private _instance;

    constructor() {
        addAddressToWihtelist(owner);
    }

    function create(address publicCampaignsAddr, address pendingCampaignsAddr) public onlyWhitelisted {
        _instance = new EthStarter(publicCampaignsAddr, pendingCampaignsAddr);
        addAddressToWhitelist(address(_instance));
    }

    function instance() public view returns (IEthStarter) {
        return _instance;
    }
}

contract IReward {
    function onPayment(address from, uint256 value, uint256 oldBalance) public view;
    function onEnd(address backer, uint256 amount) public view;
}
