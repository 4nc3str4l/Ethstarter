var EthStarter = null;
(function() {
    
    var blockchainFactory = function($http, $log, appSettings){
        
        var numCampaignsToGet = 0;
        var allCampaigns = [];

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
            return new Date(_timestamp * 1000);
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
            donate: function(_campaignID, _ammount, _callback){
                var ammountWei = web3.toBigNumber(web3.toWei(_ammount, "ether"));
                EthStarter.donate.sendTransaction(_campaignID,
                    {
                        from:web3.eth.accounts[0],
                        value: ammountWei,
                        gas:4000000
                    }, 
                    (error, success)=>{
                        _callback(error, success);
                    }
                    
                );
            },

            getNumCampaigns: function(_callback){
                EthStarter.getNumCampaigns(
                    (err, res) => {
                        _callback(res.toNumber());
                    }
                );
            },
            
            getCampaignID: function(_index, _callback){
                EthStarter.getCampaignID(_index,
                    (err, res)=>{
                        _callback(res.toNumber());
                    }
                );
            },

            getCampaignTitle: function(_index, _callback){
                EthStarter.getCampaignTitle(_index,
                    (err, res)=>{
                        _callback(res);
                    }
                );
            },
            
            getCampaingGoalAmmount: function(_index, _callback){
                EthStarter.getCampaingGoalAmmount(_index,
                    (err, res)=>{
                        _callback(web3.fromWei(res, "ether"));
                    }
                );
            },
            
            getCampaignEndDate: function(_index, _callback){
                EthStarter.getCampaignEndDate(_index,
                    (err, res)=>{
                        _callback(unixTimeStampToDate(res.toNumber()));
                    }
                );
            },
            
            getCampaignCreationDate: function(_index, _callback){
                EthStarter.getCampaignCreationDate(_index,
                    (err, res)=>{
                        _callback(unixTimeStampToDate(res.toNumber()));
                    }
                );
            },
            
            getCampaignIsPublished: function(_index, _callback){
                EthStarter.getCampaignIsPublished(_index,
                    (err, res)=>{
                        _callback(res);
                    }
                );
            },
            
            getCampaignWebsite: function(_index, _callback){
                EthStarter.getCampaignWebsite(_index,
                    (err, res)=>{
                        _callback(res);
                    }
                );
            },
            
            getCampaignDescription: function(_index, _callback){
                EthStarter.getCampaignDescription(_index,
                    (err, res)=>{
                        _callback(res);
                    }
                );
            },

            getCampaignRaised: function(_index, _callback){
                EthStarter.getRaised(_index,
                    (err, res)=>{
                        _callback(web3.fromWei(res, "ether"));
                    }
                );
            },

            getCampaignByIndex: function(_index, _onCampaignDownloaded){
                var campaign = {}
                campaign.elementsAdded = 0;           
                campaign.onElementDownloaded = function(){
                    ++this.elementsAdded;
                    if(this.elementsAdded == 9){
                        this.progress = function(){
                            var progress =  this.raised / this.goalAmount;
                            return (Math.min(1, progress) * 100).toFixed(2);;
                        }
                        _onCampaignDownloaded(this);
                    }
                }

                this.getCampaignID(_index, 
                    (data) =>{
                        campaign.id = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaingGoalAmmount(_index, 
                    (data) =>{
                        campaign.goalAmount = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaignEndDate(_index, 
                    (data) =>{
                        campaign.endDate = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaignCreationDate(_index, 
                    (data) =>{
                        campaign.creationDate = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaignIsPublished(_index, 
                    (data) =>{
                        campaign.isPublished = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaignTitle(_index, 
                    (data) =>{
                        campaign.title = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaignWebsite(_index, 
                    (data) =>{
                        campaign.website = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaignDescription(_index, 
                    (data) =>{
                        campaign.description = data;
                        campaign.onElementDownloaded();
                    }
                );

                this.getCampaignRaised(_index, 
                    (data) =>{
                        campaign.raised = data;
                        campaign.onElementDownloaded();
                    }
                );
            },

            getCampaigns: function(_callback){
                function onCampaingDownloaded(_campaign){
                    allCampaigns.push(_campaign);
                    if(allCampaigns.length == numCaimpaignsToGet){
                        _callback(allCampaigns);
                    }
                }
                this.getNumCampaigns(
                    (number)=>{
                        numCaimpaignsToGet = number;
                        allCampaigns = [];
                        for(var i = 0; i < numCaimpaignsToGet; ++i){
                            this.getCampaignByIndex(i, onCampaingDownloaded);
                        }
                    }
                );

                return null;
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
