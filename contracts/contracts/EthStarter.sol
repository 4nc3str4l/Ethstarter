pragma solidity ^0.4.24;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IEthStarter.sol";


contract EthStarter is IEthStarter {
    // Using statements
    using SafeMath for uint;
    using SafeMath for uint256;

    // Rewards for campaigns
    mapping(uint256 => IReward) rewards;

    constructor(IDataStore _publicCampaigns, IDataStore _pendingCampaigns) public {
        publicCampaigns = _publicCampaigns;
        pendingCampaigns = _pendingCampaigns;
    }

    function migrate(IEthStarterFactory migrator) public onlyWhitelisted {
        // Create new contract
        migrator.create(publicCampaigns, pendingCampaigns);
        address migrated = address(migrator.instance());

        // Tell everyone
        emit Migration(migrated);

        // Transfer everything
        destroyAndSend(migrated);
    }

    // TODO: All this operations are interfaces
    function addCampaign(uint256 ipfsHash, uint256 goal, uint256 date) public {
        pendingCampaigns.insert(ipfsHash, msg.sender, goal, date);

        emit CampaignPendingReview(ipfsHash, msg.sender, goal, date);
    }
    
    function approve(uint256 ipfsHash) public onlyWhitelisted {
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


contract IReward {
    function onPayment(address from, uint256 value, uint256 oldBalance) public view;
    function onEnd(address backer, uint256 amount) public view;
}
