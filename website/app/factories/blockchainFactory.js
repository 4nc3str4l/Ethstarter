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
            return new web3.eth.Contract(_abi, _address);
        }

        function initContracts(){
            window.EthStarter = EthStarter = initContract(appSettings.abi.EthStarter, appSettings.addresses.EthStarterAddress);
            BigBrother = initContract(appSettings.abi.BigBrother, appSettings.addresses.BigBrotherAddress);
            window.DataStore = DataStore = initContract(appSettings.abi.DataStore, appSettings.addresses.DataStoreAddress);
        }

        function unixTimeStampToDate(_timestamp){
            return new Date(_timestamp * 1000);
        }

        function transact(method, obj) {
            return web3.eth.getAccounts().then(accounts => {
                obj.from = accounts[0];

                return method.estimateGas(obj).then(gas => {
                    obj.gas = gas + 22000;        
                    return method.send(obj);
                });
            });
        }

        function defaultTransact(method) {
            return transact(method, {
                gasPrice: web3.utils.toWei("1", "gwei"),
            });
        }

        initWeb3();
        initContracts();
    

        return{
            getAddress : function(){
                return web3.eth.coinbase;
            },
            
            publishCampaign: function(_ipfsHash, _endDate, _goalAmount, _callback){
                var date = (new Date(_endDate)).getTime();
                var unixTimestamp = date / 1000;
                var goalAmountWei = web3.utils.toWei(_goalAmount.toString(), "ether");
                
                defaultTransact(EthStarter.methods.addCampaign(_ipfsHash, goalAmountWei, unixTimestamp)).then(receipt => {
                    _callback(receipt);
                });
            },

            donate: function(_campaignID, _amount, _callback){
                var amountWei = web3.utils.toWei(_amount.toString(), "ether");
                transact(EthStarter.methods.payCampaign(_campaignID), {
                    gasPrice: web3.utils.toWei("1", "gwei"),
                    value: amountWei
                }).then(receipt => {
                    _callback(receipt);
                });
            },
            
            getCampaignById: function(_id){
                return new Promise((resolve, reject) => {                
                    DataStore.methods.get(_id).call().then(res => {
                        window.res = res;
                        var response = {
                            id: new web3.utils.BN(res[0]),
                            owner: res[1],
                            goal: web3.utils.fromWei(res[2], "ether"),
                            endDate: unixTimeStampToDate(parseInt(res[3])),
                            balanceCaller: web3.utils.fromWei(res[4], "ether"),
                            previous: new web3.utils.BN(res[5]),
                            next: new web3.utils.BN(res[6])
                        }

                        resolve(response);
                    });
                });
            },

            getLastCampaign: function(){
                return new Promise((resolve, reject) =>{                    
                    // Get the last Campaign
                    DataStore.methods.last(false).call().then(res => {
                        var campaign = {
                            id: new web3.utils.BN(res[0]),
                            owner: res[1],
                            goal: web3.utils.fromWei(res[2], "ether"),
                            endDate: unixTimeStampToDate(parseInt(res[3])),
                            balanceCaller: web3.utils.fromWei(res[4], "ether"),
                            previous: new web3.utils.BN(res[5]),
                            next: new web3.utils.BN(res[6])
                        }
                            
                        resolve(campaign);
                    });
                });
            },

            ipfsHashToID: function(hash){

                // Obtain a uint256 representation
                const cid = new Cids(hash).toV1();
                hash = cid.multihash.slice(2);

                var str = "";
                
                for (var byte of hash) {
                    str += byte.toString(16).padStart(2, "0");
                }
                
                return new web3.utils.BN(str, 16);
            },
        };
    }
    
    blockchainFactory.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('Blockchain', blockchainFactory);

}());
