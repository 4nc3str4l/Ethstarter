pragma solidity ^0.4.24;

import "./Destructible.sol";
import "./PrivilegedWhitelist.sol";
import "./IDataStore.sol";
import "./IEthStarterFactory.sol";


contract IEthStarter is PrivilegedWhitelist, Destructible {
    // Events
    event Migration(address newContract);
    event CampaignPendingReview(uint256 id, address owner, uint256 goal, uint256 date);
    event CampaignPublished(uint256 id, address owner, uint256 goal, uint256 date);
    event Payment(uint256 id, address from, uint256 value, uint256 total);

    // Functions
    function migrate(IEthStarterFactory migrator) public;
    function addCampaign(uint256 ipfsHash, uint256 goal, uint256 date) public;
    function approve(uint256 ipfsHash) public;
    function payCampaign(uint256 id) public payable;
}
