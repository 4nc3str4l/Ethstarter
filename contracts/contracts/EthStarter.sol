pragma solidity ^0.4.0;

///////////////////////////////////////////////////////////////////////////////////
//                                   OWNED                                       //
///////////////////////////////////////////////////////////////////////////////////
contract owned {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function Ownable() internal {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}


///////////////////////////////////////////////////////////////////////////////////
//                                 MORTAL                                        //
///////////////////////////////////////////////////////////////////////////////////

contract mortal is owned {
    function kill() public {
        if (msg.sender == owner)
            selfdestruct(owner);
    }
}

///////////////////////////////////////////////////////////////////////////////////
//                                SAFE MATH                                      //
///////////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////////
//                               ETH STARTER                                     //
///////////////////////////////////////////////////////////////////////////////////
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

    mapping(address => Campaign[]) userCampaigns;
    
    uint campaignCounter = 0;
    Campaign[] allCampaigns;

    // Create an event when someone is added
    event onCampaignCreated(address _creator, uint _campaignID);
    
    function createCampaign(uint _goalAmmount, string _title, string _website, string _description, uint256 _endDate, bool _isPublished) public {
        Campaign memory campaign = Campaign(campaignCounter++, _goalAmmount, _endDate, block.timestamp, _isPublished, _title, _website, _description);     
        userCampaigns[msg.sender].push(campaign);
        allCampaigns.push(campaign);
        onCampaignCreated(msg.sender, campaign.id);
    }
    
    function getNumCampaigns() public view returns(uint){
        return allCampaigns.length;
    }
    
    function getCampaignTitle(uint _index) public view returns(string){
        return allCampaigns[_index].title;
    }
    
    function getCampaingGoalAmmount(uint _index) public view returns(uint256){
        return allCampaigns[_index].goalAmmount;
    }
    
    function getCampaignID(uint _index) public view returns(uint){
        return allCampaigns[_index].id;
    }
    
    function getCampaignEndDate(uint _index) public view returns(uint256){
        return allCampaigns[_index].endDate;
    }
    
    function getCampaignCreationDate(uint _index) public view returns(uint256){
        return allCampaigns[_index].creationDate;
    }
    
    function getCampaignIsPublished(uint _index) public view returns(bool){
        return allCampaigns[_index].isPublished;
    }
    
    function getCampaignWebsite(uint _index) public view returns(string){
        return allCampaigns[_index].website;
    }
    
    function getCampaignDescription(uint _index) public view returns(string){
        return allCampaigns[_index].description;
    }
}