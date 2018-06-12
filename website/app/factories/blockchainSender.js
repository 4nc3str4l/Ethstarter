(function() {
    
    var blockchainSender = function($http, $log, appSettings){
        
        var numCampaignsToGet = 0;
        var allCampaigns = [];
        
        var BigBrother;
        var EthStarter;
        var DataStore;

        let isInitialized = false;

        var senderWeb3 = null;

        // Init Web3
        function initWeb3(){
            // Use the truffle provider for senderWeb3
            if(appSettings.development){
                senderWeb3 = new Web3.providers.HttpProvider("http://127.0.0.1:9545/");
                console.log(senderWeb3);
                isInitialized = true;
            }else{
                // Checking if Web3 has been injected by the browser (Mist/MetaMask)
                if (typeof web3 !== 'undefined') {
                    // Use Mist/MetaMask's provider
                    senderWeb3 = new Web3(web3.currentProvider);
                    console.log(senderWeb3);    
                    isInitialized = true;
                } else {
                    console.log('No web3? You should consider trying MetaMask!')
                    alert("Download Metamask!");
                }

            }
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
                gasPrice: Web3.utils.toWei("1", "gwei"),
            });
        }

        function initContracts(){
            // TODO: Move this to another file don't keep it public!
            BigBrother = window.BigBrother;
            EthStarter = window.EthStarter;
            DataStore = window.DataStore;
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
                var goalAmountWei = Web3.utils.toWei(_goalAmount.toString(), "ether");
                
                return defaultTransact(EthStarter.methods.addCampaign(_ipfsHash, goalAmountWei, unixTimestamp));
            },

            donate: function(_campaignID, _amount, _callback){
                               
                if(!init()){
                    return;
                }

                id = this.ipfsHashToID(_campaignID);
                var amountWei = senderWeb3.utils.toWei(_amount.toString(), "ether");
                transact(EthStarter.methods.payCampaign(id), {
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
