pragma solidity ^0.4.24;

import "./IEthStarterFactory.sol";
import "./IEthStarter.sol";
import "./IDataStore.sol";
import "./EthStarter.sol";  // TODO: Can we refactor this to IEthStarter?


contract EthStarterFactory is IEthStarterFactory {
    IEthStarter private _instance;

    function create(IDataStore publicCampaigns, IDataStore pendingCampaigns) public onlyWhitelisted {
        // Assert ownership of the DataStores

        // Initialize EthStarter
        _instance = new EthStarter(publicCampaigns, pendingCampaigns);

        // Link instance to stores (REQUIRES factory to be whitelisted on the stores)
        publicCampaigns.allow(_instance);
        pendingCampaigns.allow(_instance);

        // Allow instance to call "this" from migrate
        allow(address(_instance));

        // Whitelist owner and transfer instance ownership (kill/destroy)
        _instance.allow(owner);
        _instance.transferOwnership(owner);
    }

    function instance() public view returns (IEthStarter) {
        return _instance;
    }
}
