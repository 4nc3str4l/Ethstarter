pragma solidity ^0.4.23;


contract PrivilegedWhitelist {
    event WhitelistedAddressAdded(address addr);
    event WhitelistedAddressRemoved(address addr);

    mapping(address => bool) public hasAccess;

    constructor() public {
        // Owner is an special case
        hasAccess[msg.sender] = true;
    }

    modifier onlyWhitelisted() {
        require(hasAccess[msg.sender]);
        _;
    }

    function allow(address addr) onlyWhitelisted public {
        hasAccess[addr] = true;
        emit WhitelistedAddressAdded(addr);
    }

    function disallow(address addr) onlyWhitelisted public {
        hasAccess[addr] = false;
        emit WhitelistedAddressRemoved(addr);
    }
}
