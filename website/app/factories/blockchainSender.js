(function() {
    
    var blockchainSender = function($http, $log, appSettings){
        
        var numCampaignsToGet = 0;
        var allCampaigns = [];
        
        var BigBrother;
        var EthStarter;
        var DataStore;

        let isInitialized = false;

        var senderWeb3;

        // Init Web3
        function initWeb3(){
            // Use the truffle provider for senderWeb3
            if(appSettings.development){
                senderWeb3 = new senderWeb3(new senderWeb3.providers.HttpProvider("http://localhost:9545"));
                isInitialized = true;
            }else{
                // Use the current provider (Metamask)
                if (typeof senderWeb3 !== 'undefined') {
                    senderWeb3 = new Web3(senderWeb3.currentProvider);
                    
                    // If the coinbase is not detected ask the user to unlock metamask
                    if(senderWeb3.eth.coinbase === null){
                        alert("Unlock Metamask!");
                    }else{
                        isInitialized = true;
                    }
                    
                    // Tell the user that metamask is required
                }else{
                    alert("No Metamask Detected!");
                }
            }
        }

        //TODO: Move this functions to a utils module
        function initContract(_abi, _address){
            return new senderWeb3.eth.Contract(_abi, _address);
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
            return senderWeb3.eth.getAccounts().then(accounts => {
                obj.from = accounts[0];

                return method.estimateGas(obj).then(gas => {
                    obj.gas = gas + 22000;        
                    return method.send(obj);
                });
            });
        }

        function defaultTransact(method) {
            return transact(method, {
                gasPrice: senderWeb3.utils.toWei("1", "gwei"),
            });
        }

        function init(){
            initWeb3();
            if(isInitialized){
                initContracts();
            }
            return isInitialized;
        }

    
        return{
            getAddress : function(){
                return senderWeb3.eth.coinbase;
            },
            
            publishCampaign: async function(_ipfsHash, _endDate, _goalAmount){
                
                if(!init()){
                    return;
                }

                var date = (new Date(_endDate)).getTime();
                var unixTimestamp = date / 1000;
                var goalAmountWei = senderWeb3.utils.toWei(_goalAmount.toString(), "ether");
                
                return defaultTransact(EthStarter.methods.addCampaign(_ipfsHash, goalAmountWei, unixTimestamp));
            },

            donate: function(_campaignID, _amount, _callback){
                               
                if(!init()){
                    return;
                }

                var amountWei = senderWeb3.utils.toWei(_amount.toString(), "ether");
                transact(EthStarter.methods.payCampaign(_campaignID), {
                    gasPrice: senderWeb3.utils.toWei("1", "gwei"),
                    value: amountWei
                }).then(receipt => {
                    _callback(receipt);
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
                
                return new senderWeb3.utils.BN(str, 16);
            },
        };
    }
    
    
    blockchainSender.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('BlockchainSender', blockchainSender);

}());
