"use strict";

(function() {
    
    var blockchainFactory = function($http, $log, appSettings){
        
        var blockchain;
        var usingMetamask = false;

        // Init Web3
        function metamaskWeb3(){
            return new Promise((resolve, reject) => {          
                // Use the current provider (Metamask)
                if (typeof web3 !== 'undefined') {
                    let web3js = new Web3(web3.currentProvider);
                    
                    // If the coinbase is not detected ask the user to unlock metamask
                    web3js.eth.getAccounts().then((result) => {
                        if(result.length == 0){
                            usingMetamask = false;
                            reject();
                        }else{
                            usingMetamask = true;
                            blockchain = new Blockchain(web3js, appSettings);
                            resolve();
                        }
                    });
                }else{
                    reject();
                }
            });
        }

        // Init Web3
        function infuraWeb3(){
            let web3js = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io:443'))
            usingMetamask = false;
            blockchain = new Blockchain(web3js, appSettings);
        }

        infuraWeb3();

        function useMetamask(use){
            return new Promise((resolve, reject) =>{
                if(use){
                    metamaskWeb3().then(
                        function success(){
                            resolve();
                        },
                        function fail(){
                            infuraWeb3();
                            reject();
                        }
                    );
                }else{
                    infuraWeb3();
                    resolve();
                } 
            });
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
