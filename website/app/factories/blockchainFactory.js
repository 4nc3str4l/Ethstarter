var MetaCoin = null;

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
            var contract = new web3.eth.contract(appSettings.contractABI);
            MetaCoin = contract.at(appSettings.contractAddress);
        }

        initWeb3();
        initContract();

        return{
            getAddress : function(){
                return web3.eth.coinbase;
            },
            getNumMetaCoins: function(){
                MetaCoin.getBalance(web3.eth.coinbase, {from: web3.eth.coinbase});
            }
        };
    }
    
    blockchainFactory.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('Blockchain', blockchainFactory);

}());
