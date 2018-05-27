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
                        // alert("Unlock Metamask!");
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
            window.DataStore = DataStore = initContract(appSettings.abi.DataStore, appSettings.addresses.DataStoreAddress);
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
            
            publishCampaign: function(_ipfsHash, _endDate, _goalAmmount, _callback){
                var date = (new Date(_endDate)).getTime();
                var unixTimestamp = date / 1000;
                var goalAmmountWei = web3.toBigNumber(web3.toWei(_goalAmmount, "ether"));
                
                EthStarter.addCampaign.sendTransaction(_ipfsHash, goalAmmountWei, unixTimestamp,
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
            
            getCampaignById: function(_id){
                return new Promise((resolve, reject) => {                
                    DataStore.get(_id,
                        (err, res)=>{
                            var response = {
                                id: res[0],
                                owner: res[1],
                                goal: web3.fromWei(res[2], "ether"),
                                endDate: unixTimeStampToDate(res[3].toNumber()),
                                balanceCaller: web3.fromWei(res[4], "ether"),
                                previous: res[5],
                                next: res[6]
                            }

                            resolve(response);
                       });
                  });
            },

            getLastCampaign: function(){
                return new Promise((resolve, reject) =>{                    
                    // Get the last Campaign
                    DataStore.last(false,
                        (err, res)=>{
                            var campaign = {
                                id: res[0],
                                owner: res[1],
                                goal: web3.fromWei(res[2], "ether"),
                                endDate: unixTimeStampToDate(res[3].toNumber()),
                                balanceCaller: web3.fromWei(res[4], "ether"),
                                previous: res[5],
                                next: res[6]
                            }
                            
                            resolve(campaign);
                    });
                });
            }
        };
    }
    
    blockchainFactory.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('Blockchain', blockchainFactory);

}());
