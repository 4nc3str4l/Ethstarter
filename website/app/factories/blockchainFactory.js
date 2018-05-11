var EthStarter = null;
(function() {
    
    var blockchainFactory = function($http, $log, appSettings){
        
        // Init Web3
        function initWeb3(){
            // Use the truffle provider for web3
            if(appSettings.development){
                web3 = new Web3(new web3.providers.HttpProvider("http://localhost:9545"));
            }else{
                // Use the current provider (Metamask)
                if (typeof web3 !== 'undefined') {
                    web3 = new Web3(web3.currentProvider);
                    
                    // If the coinbase is not detected ask the user to unlock metamask
                    if(web3.eth.coinbase === null){
                        alert("Unlock Metamask!");
                    }
                    
                    // Tell the user that metamask is required
                }else{
                    alert("No Metamask Detected!");
                }
            }
        }

        function initContract(){
            var contract = web3.eth.contract(appSettings.contractABI);
            EthStarter = contract.at(appSettings.contractAddress);
        }

        initWeb3();
        initContract();

        return{
            getAddress : function(){
                return web3.eth.coinbase;
            },
            
            publishCampaign: function(_title, _website, _endDate, _goalAmmount, _description){
                var date = (new Date(_endDate)).getTime();
                var unixTimestamp = date / 1000;
                EthStarter.createCampaign.call(_goalAmmount, _title, _website, _description, unixTimestamp, true);
            },

            getNumCampaigns: function(){
                return EthStarter.getNumCampaigns.call().c[0];
            },
            
            getCampaignID: function(_index){
                return EthStarter.getCampaignID.call(_index).c[0];
            },

            getCampaignTitle: function(_index){
                return EthStarter.getCampaignTitle.call(_index);
            },
            
            getCampaingGoalAmmount: function(_index){
                return EthStarter.getCampaingGoalAmmount.call(_index).c[0];
            },
            
            getCampaignEndDate: function(_index){
                return EthStarter.getCampaignEndDate.call(_index).c[0];
            },
            
            getCampaignCreationDate: function(_index){
                return EthStarter.getCampaignCreationDate.call(_index).c[0];
            },
            
            getCampaignIsPublished: function(_index){
                return EthStarter.getCampaignIsPublished.call(_index);
            },
            
            getCampaignWebsite: function(_index){
                return EthStarter.getCampaignWebsite.call(_index);
            },
            
            getCampaignDescription: function(_index){
                return EthStarter.getCampaignDescription.call(_index);
            },

            getCampaignByIndex: function(_index){
                return{
                    id : this.getCampaignID(_index),
                    goalAmount: this.getCampaingGoalAmmount(_index),
                    endDate: this.getCampaignEndDate(_index),
                    creationDate: this.getCampaignCreationDate(_index),
                    isPublished: this.getCampaignIsPublished(_index),
                    title: this.getCampaignTitle(_index),
                    website: this.getCampaignWebsite(_index),
                    description: this.getCampaignDescription(_index),
                    raised: 0.2 //TODO: Remove the hardcode
                }
            },
            getCampaigns: function(){
                var numProjects = EthStarter.getNumCampaigns();
                var campaigns = [];
                for(var i = 0; i < numProjects; ++i){
                    campaigns.push(this.getCampaignByIndex(i));
                }
                return campaigns;
            }
        };
    }
    
    blockchainFactory.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('Blockchain', blockchainFactory);

}());
