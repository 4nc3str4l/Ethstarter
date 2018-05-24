pragma solidity ^0.4.24;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./PrivilegedWhitelist.sol";
import "./IEthStarter.sol";
import "./IDataStore.sol";


contract IEthStarterFactory is PrivilegedWhitelist, Ownable {
    // MUST BE onlyWhitelisted TO PREVENT SPOOFING
    function create(IDataStore campaigns) public;

    function instance() public view returns (IEthStarter);
}
