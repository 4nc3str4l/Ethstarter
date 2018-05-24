pragma solidity ^0.4.24;

import "./PrivilegedWhitelist.sol";


contract IDataStore is PrivilegedWhitelist {
    function insertPending(uint256 id, address owner, uint256 goal, uint256 date) public;
    function insertApproved(uint256 id, address owner, uint256 goal, uint256 date) public;

    function removePending(uint256 id) public;
    function removeApproved(uint256 id) public;

    function approve(uint256 id) public;

    function pay(uint256 id, address who, uint256 amount) public;
    function get(uint256 id) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256);
    function first(bool pending) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256);
    function last(bool pending) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256);
    function balanceOf(uint256 id, address user) public view returns(uint256);
}
