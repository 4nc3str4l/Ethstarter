pragma solidity ^0.4.24;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./IDataStore.sol";


contract DataStore is IDataStore {
    // Using statements
    using SafeMath for uint;
    using SafeMath for uint256;

    // Basic campaign structure
    struct Campaign {
        address owner;
        uint256 goal;
        uint256 date;
        mapping(address => uint256) balanceOf;
        address[] contributors;
    }
    
    // Double linked list node
    struct Node {
        Campaign campaign;
        uint256 prev;
        uint256 next;
    }

    // Data holder
    struct Data {
        mapping(uint256 => Node) map;
        uint256 first;
        uint256 last;
    }

    // Attributes
    Data data;

    function insert(uint256 id, address owner, uint256 goal, uint256 date) public onlyWhitelisted {
        // Fetch campaign
        Node storage node = data.map[id];
        
        // Must not exist yet and have goal and date
        require(node.campaign.date == 0);
        require(goal > 0);
        require(date > 0);
        
        // Update the new node
        node.campaign.owner = owner;
        node.campaign.goal = goal;
        node.campaign.date = date;
        node.prev = data.last;

        // Update previous node next
        data.map[data.last].next = id;

        // Update last ID
        data.last = id;

        // Update first?
        if (data.first == 0) {
            data.first = id;
        }
    }

    function remove(uint256 id) public onlyWhitelisted {
        Node storage node = data.map[id];

        data.map[node.prev].next = node.next;
        data.map[node.next].prev = node.prev;

        if (data.last == id) {
            data.last = node.prev;
        }

        if (data.first == id) {
            data.first = node.next;
        }
    }

    // No rewards nor events are handled here
    function pay(uint256 id, address who, uint256 amount) public onlyWhitelisted {
        Campaign storage c = data.map[id].campaign;
        require(c.date > 0);
        require(amount > 0);

        // Keep track of individual accounts
        if (c.balanceOf[who] == 0) {
            c.contributors.push(who);
        }

        // Update balance
        c.balanceOf[who] = c.balanceOf[who].add(amount);
    }

    function get(uint256 id) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256)  {
        Node storage n = data.map[id];
        Campaign storage c = n.campaign;
        return (id, c.owner, c.goal, c.date, c.balanceOf[msg.sender], n.prev, n.next);
    }
    
    function first() public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256) {
        return get(data.last);
    }
    
    function last() public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256) {
        return get(data.last);
    }

    function balanceOf(uint256 id, address user) public view returns(uint256) {
        return data.map[id].campaign.balanceOf[user];
    }
}
