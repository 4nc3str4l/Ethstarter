angular.module('EthStarter').constant('appSettings', {
    development: true,
    contractAddress: 'TODO: ADDRESS HERE!',
    contractABI: [
        {
          "inputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "name": "_from",
              "type": "address"
            },
            {
              "indexed": true,
              "name": "_to",
              "type": "address"
            },
            {
              "indexed": false,
              "name": "_value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "constant": false,
          "inputs": [
            {
              "name": "receiver",
              "type": "address"
            },
            {
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "sendCoin",
          "outputs": [
            {
              "name": "sufficient",
              "type": "bool"
            }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "addr",
              "type": "address"
            }
          ],
          "name": "getBalanceInEth",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [
            {
              "name": "addr",
              "type": "address"
            }
          ],
          "name": "getBalance",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ]
});