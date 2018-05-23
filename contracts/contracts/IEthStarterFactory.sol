pragma solidity ^0.4.24;

import "./PrivilegedWhitelist.sol";
import "./IEthStarter.sol";
import "./IDataStore.sol";


contract IEthStarterFactory is PrivilegedWhitelist {
    // MUST BE onlyWhitelisted TO PREVENT SPOOFING
    function create(IDataStore publicCampaigns, IDataStore pendingCampaigns) public;

    function instance() public view returns (IEthStarter);
}
