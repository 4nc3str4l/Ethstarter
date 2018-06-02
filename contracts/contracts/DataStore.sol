pragma solidity ^0.4.24;

import "zeppelin/contracts/math/SafeMath.sol";
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
        uint256 raised;
    }
    
    // Double linked list node
    struct Node {
        Campaign campaign;
        uint256 prev;
        uint256 next;
    }
    
    // Linked list pointer
    struct Pointer {
        uint256 first;
        uint256 last;
    }

    // Data holder
    struct Data {
        mapping(uint256 => Node) map;
        Pointer approved;
        Pointer pending;
    }

    // Attributes
    Data data;

    function insertPending(uint256 id, address owner, uint256 goal, uint256 date) public onlyWhitelisted {
        insert(data.pending, id, owner, goal, date);
    }

    function insertApproved(uint256 id, address owner, uint256 goal, uint256 date) public onlyWhitelisted {
        insert(data.approved, id, owner, goal, date);
    }

    function insert(Pointer storage pointer, uint256 id, address owner, uint256 goal, uint256 date) internal onlyWhitelisted {
        // First sanity checks
        require(id > 0);
        require(goal > 0);
        require(date > 0);

        // Fetch campaign
        Node storage node = data.map[id];
        Campaign storage campaign = node.campaign;
        
        // Must not exist yet
        require(campaign.date == 0);
        
        // Update the new node
        campaign.owner = owner;
        campaign.goal = goal;
        campaign.date = date;
        node.prev = pointer.last;

        // Update previous node next
        linkInsert(pointer, id);
    }

    function linkInsert(Pointer storage pointer, uint256 id) internal onlyWhitelisted {
        // Can't be 0, its already been checked
        assert(id > 0);

        // Update previous node next
        data.map[pointer.last].next = id;

        // Update last ID
        pointer.last = id;

        // Update first?
        if (pointer.first == 0) {
            pointer.first = id;
        }
    }

    function removePending(uint256 id) public onlyWhitelisted {
        remove(data.pending, id);
    }

    function removeApproved(uint256 id) public onlyWhitelisted {
        remove(data.approved, id);
    }

    function remove(Pointer storage pointer, uint256 id) internal onlyWhitelisted {
        // Sanity check
        require(id > 0);

        Node storage node = data.map[id];

        data.map[node.prev].next = node.next;
        data.map[node.next].prev = node.prev;

        if (pointer.last == id) {
            pointer.last = node.prev;
        }

        if (pointer.first == id) {
            pointer.first = node.next;
        }
    }

    function approve(uint256 id) public onlyWhitelisted {
        // Sanity check
        require(id > 0);
        
        remove(data.pending, id);
        linkInsert(data.approved, id);
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
        c.raised = c.raised.add(amount);
    }

    function get(uint256 id) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256, uint256) {
        Node storage n = data.map[id];
        Campaign storage c = n.campaign;
        return (id, c.owner, c.goal, c.date, c.balanceOf[msg.sender], c.raised, n.prev, n.next);
    }
    
    function first(bool pending) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256, uint256) {
        if (pending) {
            require(hasAccess[msg.sender]);
            return get(data.pending.first);
        }
        
        return get(data.approved.first);
    }
    
    function last(bool pending) public view returns(uint256, address, uint256, uint256, uint256, uint256, uint256, uint256) {
        if (pending) {
            require(hasAccess[msg.sender]);
            return get(data.pending.last);
        }
        
        return get(data.approved.last);
    }

    function balanceOf(uint256 id, address user) public view returns(uint256) {
        return data.map[id].campaign.balanceOf[user];
    }

    function contrinutors(uint256 id) public view returns(address[]) {
        return data.map[id].campaign.contributors;
    }
}
