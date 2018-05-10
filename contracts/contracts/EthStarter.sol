pragma solidity ^0.4.0;
// To return structs
pragma experimental ABIEncoderV2;

import "./Mortal.sol";

library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a / b;
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract EthStarter is mortal{
    
    // Campaign
    struct Campaign {
        // NOTE: Those will stay here
        uint id;
        uint256 goalAmmount;
        uint256 endDate;
        uint256 creationDate;

        //TODO: Move to another storage system
        bool isPublished;
        string title;
        string website;
        string description;
    }

    uint campaignCounter = 0;

    // A regular map
    mapping(address => Campaign[]) userCampaigns;
    Campaign[] allCampaigns;

    // Create an event when someone is added
    event onCampaignCreated(address _creator, uint _campaignID);

    function createCampaign(uint _goalAmmount, string _title, string _website, string _description, uint256 _endDate, bool _isPublished) public {
        Campaign memory campaign = Campaign(campaignCounter++, _goalAmmount, _endDate, block.timestamp, _isPublished, _title, _website, _description);     
        userCampaigns[msg.sender].push(campaign);
        allCampaigns.push(campaign);
        onCampaignCreated(msg.sender, campaign.id);
    }

    function getCampaigns(uint256 _startIndex, uint256 _limit) public view returns (Campaign[]){
        Campaign[] memory toReturn = new Campaign[](_limit);
        if(_startIndex >= allCampaigns.length)
            return toReturn;
        
        uint256 i = _startIndex;
        uint256 end = _startIndex + _limit; 
        while(i < end && i < allCampaigns.length)
            toReturn[i - _startIndex] = allCampaigns[i++];
        
        return toReturn;   
    }

    function getTestString() public pure returns(string){
        return "Merengue Merengue";
    }

    // Like that we can send ether to the contract
    function() payable public{
        
    }       
}