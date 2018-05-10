angular.module('EthStarter').constant('appSettings', {
    development: true,
    contractAddress: '0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f',
    contractABI: [
      {
        "constant": true,
        "inputs": [
          {
            "name": "_startIndex",
            "type": "uint256"
          },
          {
            "name": "_limit",
            "type": "uint256"
          }
        ],
        "name": "getCampaigns",
        "outputs": [
          {
            "components": [
              {
                "name": "id",
                "type": "uint256"
              },
              {
                "name": "goalAmmount",
                "type": "uint256"
              },
              {
                "name": "endDate",
                "type": "uint256"
              },
              {
                "name": "creationDate",
                "type": "uint256"
              },
              {
                "name": "isPublished",
                "type": "bool"
              },
              {
                "name": "title",
                "type": "string"
              },
              {
                "name": "website",
                "type": "string"
              },
              {
                "name": "description",
                "type": "string"
              }
            ],
            "name": "",
            "type": "tuple[]"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getTestString",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_address",
            "type": "address"
          }
        ],
        "name": "hasCampaigns",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "kill",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_goalAmmount",
            "type": "uint256"
          },
          {
            "name": "_title",
            "type": "string"
          },
          {
            "name": "_website",
            "type": "string"
          },
          {
            "name": "_description",
            "type": "string"
          },
          {
            "name": "_endDate",
            "type": "uint256"
          },
          {
            "name": "_isPublished",
            "type": "bool"
          }
        ],
        "name": "createCampaign",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_creator",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_campaignID",
            "type": "uint256"
          }
        ],
        "name": "onCampaignCreated",
        "type": "event"
      }
    ],
  }
);