(function() {
    
    var blockchainListener = function($http, $log, appSettings){
        
        var numCampaignsToGet = 0;
        var allCampaigns = [];
        
        var BigBrother;
        var EthStarter;
        var DataStore;

        var listenerWeb3;

        // Init Web3
        function initWeb3(){
            if (typeof web3 !== 'undefined') {
                listenerWeb3 = new Web3(web3.currentProvider)
            } else {
                listenerWeb3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io:443'))
            }
        }

        //TODO: Move this functions to a utils module
        function initContract(_abi, _address){
            return new listenerWeb3.eth.Contract(_abi, _address);
        }

        function initContracts(){
            window.EthStarter = EthStarter = initContract(appSettings.abi.EthStarter, appSettings.addresses.EthStarterAddress);
            window.BigBrother = BigBrother = initContract(appSettings.abi.BigBrother, appSettings.addresses.BigBrotherAddress);
            window.DataStore  = DataStore = initContract(appSettings.abi.DataStore, appSettings.addresses.DataStoreAddress);
        }

        function subscribeToEvents(){
            EthStarter.events.CampaignPublished({}, (error, data) => {
                if (error)
                    console.log("Error: " + error);
                else 
                    console.log("Log data: " + data);
                }
            );
        }

        function unixTimeStampToDate(_timestamp){
            return new Date(_timestamp * 1000);
        }

        function transact(method, obj) {
            return listenerWeb3.eth.getAccounts().then(accounts => {
                obj.from = accounts[0];

                return method.estimateGas(obj).then(gas => {
                    obj.gas = gas + 22000;        
                    return method.send(obj);
                });
            });
        }

        function defaultTransact(method) {
            return transact(method, {
                gasPrice: listenerWeb3.utils.toWei("1", "gwei"),
            });
        }

        initWeb3();
        initContracts();
        subscribeToEvents();
    

        return{
            
            getCampaignById: function(_id){
                return new Promise((resolve, reject) => {                
                    DataStore.methods.get(_id).call().then(res => {
                        window.res = res;
                        var response = {
                            id: new listenerWeb3.utils.BN(res[0]),
                            owner: res[1],
                            goal: listenerWeb3.utils.fromWei(res[2], "ether"),
                            endDate: unixTimeStampToDate(parseInt(res[3])),
                            raised: listenerWeb3.utils.fromWei(res[4], "ether"),
                            previous: new listenerWeb3.utils.BN(res[5]),
                            next: new listenerWeb3.utils.BN(res[6])
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
                            id: new listenerWeb3.utils.BN(res[0]),
                            owner: res[1],
                            goal: listenerWeb3.utils.fromWei(res[2], "ether"),
                            endDate: unixTimeStampToDate(parseInt(res[3])),
                            raised: listenerWeb3.utils.fromWei(res[4], "ether"),
                            previous: new listenerWeb3.utils.BN(res[5]),
                            next: new listenerWeb3.utils.BN(res[6])
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
                
                return new listenerWeb3.utils.BN(str, 16);
            },
        };
    }
    
    
    blockchainListener.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('BlockchainListener', blockchainListener);

}());
