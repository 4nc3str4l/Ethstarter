(function() {
    
    var blockchainFactory = function($http, $log, appSettings){
        
        var numCampaignsToGet = 0;
        var allCampaigns = [];
        
        var BigBrother;
        var EthStarter;
        var DataStore;

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

        function initContract(_abi, _address){
            var contract = web3.eth.contract(_abi);
            return contract.at(_address);
        }

        function initContracts(){
            EthStarter = initContract(appSettings.abi.EthStarter, appSettings.addresses.EthStarterAddress);
            BigBrother = initContract(appSettings.abi.BigBrother, appSettings.addresses.BigBrotherAddress);
            DataStore = initContract(appSettings.abi.DataStore, appSettings.addresses.DataStoreAddress);
        }

        function unixTimeStampToDate(_timestamp){
            return new Date(_timestamp * 1000);
        }

        initWeb3();
        initContracts();
    

        return{
            getAddress : function(){
                return web3.eth.coinbase;
            },
            
            publishCampaign: function(_title, _website, _endDate, _goalAmmount, _description, _callback){
                var date = (new Date(_endDate)).getTime();
                var unixTimestamp = date / 1000;
                var goalAmmountWei = web3.toBigNumber(web3.toWei(_goalAmmount, "ether"));
                EthStarter.addCampaign.sendTransaction("HASH", goalAmmountWei, unixTimestamp,
                    {
                        from:web3.eth.accounts[0],
                        gas:4000000
                    }, 
                    (error, transactionHash)=>{
                        var waitUntilMined = setInterval(()=>{
                            web3.eth.getTransactionReceipt(transactionHash,
                                (err, receipt) => {
                                    if(receipt != null){
                                        _callback(receipt);
                                        clearInterval(waitUntilMined);
                                    }
                                }
                            );
                        }, 500);
                    }
                );
            },
            donate: function(_campaignID, _ammount, _callback){
                var ammountWei = web3.toBigNumber(web3.toWei(_ammount, "ether"));
                EthStarter.payCampaign.sendTransaction(_campaignID,
                    {
                        from:web3.eth.accounts[0],
                        value: ammountWei,
                        gas:4000000
                    }, 
                    (error, transactionHash)=>{
                        var waitUntilMined = setInterval(()=>{
                            web3.eth.getTransactionReceipt(transactionHash,
                                (err, receipt) => {
                                    if(receipt != null){
                                        _callback(receipt);
                                        clearInterval(waitUntilMined);
                                    }
                                }
                            );
                        }, 500);
                    }
                );
            },

            getCampaigns: function(_callback){
                return [];
            },

            getCampaignById: function(_id, _callback){
                return{
                    id : 1,
                    goalAmount: 10,
                    endDate: new Date(),
                    creationDate: new Date(),
                    isPublished: true,
                    title: "Placeholder",
                    website: "www.google.es",
                    description: "Description",
                    raised: 10,
                    progress : function(){
                        return 0;
                    }
                }

            },
        };
    }
    
    blockchainFactory.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('Blockchain', blockchainFactory);

}());
