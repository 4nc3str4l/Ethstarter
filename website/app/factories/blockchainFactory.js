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

        function unixTimeStampToDate(_timestamp){
            return new Date(_timestamp*1000);
        }

        initWeb3();
        initContract();

        return{
            getAddress : function(){
                return web3.eth.coinbase;
            },
            
            publishCampaign: function(_title, _website, _endDate, _goalAmmount, _description, _callback){
                var date = (new Date(_endDate)).getTime();
                var unixTimestamp = date / 1000;
                var goalAmmountWei = web3.toBigNumber(web3.toWei(_goalAmmount, "ether"));
                EthStarter.createCampaign.sendTransaction(goalAmmountWei, _title, _website, _description, unixTimestamp, true,
                    {
                        from:web3.eth.accounts[0],
                        gas:4000000
                    }, 
                    (error, success)=>{
                        _callback(error, success);
                    }
                    
                );
            },

            getNumCampaigns: function(){
                return EthStarter.getNumCampaigns.call().toNumber();
            },
            
            getCampaignID: function(_index){
                return EthStarter.getCampaignID.call(_index).toNumber();
            },

            getCampaignTitle: function(_index){
                return EthStarter.getCampaignTitle.call(_index);
            },
            
            getCampaingGoalAmmount: function(_index){
                return web3.fromWei(EthStarter.getCampaingGoalAmmount.call(_index), "ether");
            },
            
            getCampaignEndDate: function(_index){
                return unixTimeStampToDate(EthStarter.getCampaignEndDate.call(_index).toNumber());
            },
            
            getCampaignCreationDate: function(_index){
                return unixTimeStampToDate(EthStarter.getCampaignCreationDate.call(_index).toNumber());
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

            getCampaignRaised: function(_index){
                return web3.fromWei(EthStarter.getRaised.call(_index), "ether");
            },

            getCampaignByIndex: function(_index){
                return {
                    id : this.getCampaignID(_index),
                    goalAmount: this.getCampaingGoalAmmount(_index),
                    endDate: this.getCampaignEndDate(_index),
                    creationDate: this.getCampaignCreationDate(_index),
                    isPublished: this.getCampaignIsPublished(_index),
                    title: this.getCampaignTitle(_index),
                    website: this.getCampaignWebsite(_index),
                    description: this.getCampaignDescription(_index),
                    raised: this.getCampaignRaised(_index)
                }
            },

            getCampaigns: function(){
                var numProjects = EthStarter.getNumCampaigns();
                var campaigns = [];
                for(var i = 0; i < numProjects; ++i){
                    campaigns.push(this.getCampaignByIndex(i));
                }
                return campaigns;
            },

            getCampaignById: function(_id){
                var index = EthStarter.getCampaignIndexByID.call(_id).c[0];
                return this.getCampaignByIndex(index);
            },
        };
    }
    
    blockchainFactory.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('Blockchain', blockchainFactory);

}());
