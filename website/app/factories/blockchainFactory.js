"use strict";

(function() {
    
    var blockchainFactory = function($http, $log, appSettings){
        
        var blockchain;
        var usingMetamask = false;

        // Init Web3
        function metamaskWeb3(){
            // Use the truffle provider for web3
            if(appSettings.development){
                web3 = new Web3(new web3.providers.HttpProvider("http://localhost:9545"));
            }else{
                // Use the current provider (Metamask)
                if (typeof web3 !== 'undefined') {
                    web3 = new Web3(web3.currentProvider);
                    
                    // If the coinbase is not detected ask the user to unlock metamask
                    
                    if(typeof web3.eth.coinbase === 'undefined'){
                        alert("Unlock Metamask!");
                    }else{
                        usingMetamask = true;
                    }
                    
                    // Tell the user that metamask is required
                }else{
                    alert("No Metamask Detected!");
                }
            }

            blockchain = new Blockchain(web3, appSettings);

            return usingMetamask;
        }

        // Init Web3
        function infuraWeb3(){
            if (typeof web3 !== 'undefined') {
                web3 = new Web3(web3.currentProvider)
            } else {
                web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io:443'))
                usingMetamask = false;
            }

            blockchain = new Blockchain(web3, appSettings);
            return true;
        }

        infuraWeb3();

        function useMetamask(use){
            var success = false;
            if(use){
                success = metamaskWeb3();
                if(!success){
                    infuraWeb3();
                }
            }else{
                success = infuraWeb3();
            }

            return success;
        }

        return{
            useMetamask: useMetamask,
            isUsingMetamask: usingMetamask,
            publishCampaign: (_ipfsHash, _endDate, _goalAmount) => blockchain.publishCampaign(_ipfsHash, _endDate, _goalAmount),
            donate: (_campaignID, _amount, _callback) =>  blockchain.donate(_campaignID, _amount, _callback),
            getCampaignById:  _id => blockchain.getCampaignById(_id),
            getLastCampaign:  () =>  blockchain.getLastCampaign(),
            ipfsHashToID:  (hash) =>  blockchain.ipfsHashToID(hash),
        }
    }
    
    
    blockchainFactory.$inject = ['$http', '$log', 'appSettings'];
    angular.module('EthStarter').factory('Blockchain', blockchainFactory);

}());
