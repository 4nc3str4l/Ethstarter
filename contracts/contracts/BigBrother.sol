pragma solidity ^0.4.24;

import "zeppelin/contracts/ownership/Ownable.sol";
import "./IEthStarterFactory.sol";


// So that website can keep track of the current factory in use
// to further obtain the main EthStarter contract
// BigBrother.currentFactory().instance()
contract BigBrother is Ownable {
    IEthStarterFactory public currentFactory;

    function update(IEthStarterFactory _currentFactory) public onlyOwner {
        currentFactory = _currentFactory;
    }
}
