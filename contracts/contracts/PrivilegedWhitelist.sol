pragma solidity ^0.4.23;


contract PrivilegedWhitelist {
    event WhitelistedAddressAdded(address addr);
    event WhitelistedAddressRemoved(address addr);

    mapping(address => bool) access;

    constructor() public {
        // Owner is an special case
        access[msg.sender] = true;
    }

    modifier onlyWhitelisted() {
        require(access[msg.sender]);
        _;
    }

    function allow(address addr) onlyWhitelisted public {
        access[addr] = true;
        emit WhitelistedAddressAdded(addr);
    }

    function disallow(address addr) onlyWhitelisted public {
        access[addr] = false;
        emit WhitelistedAddressRemoved(addr);
    }
}
