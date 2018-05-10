pragma solidity ^0.4.0;

import "./Owned.sol";

contract mortal is owned {
    function kill() public {
        if (msg.sender == owner)
            selfdestruct(owner);
    }
}