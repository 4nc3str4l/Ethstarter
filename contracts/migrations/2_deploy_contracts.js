var DeployUtils = require("./deployUtils.js").DeployUtils;

var BigBrother = artifacts.require("./BigBrother.sol");
var DataStore = artifacts.require("./DataStore.sol");
var EthStarter = artifacts.require("./EthStarter.sol");
var IDataStore = artifacts.require("./IDataStore.sol");
var PrivilegedWhiteList = artifacts.require("./PrivilegedWhitelist.sol");
var IEthStarter = artifacts.require("./IEthStarter.sol");
var IEthStarterFactory = artifacts.require("./IEthStarterFactory.sol");
var EthStarterFactory = artifacts.require("./EthStarterFactory.sol");
var Destructible = artifacts.require("./Destructible");
var Ownable = artifacts.require("./Ownable");
var SafeMath = artifacts.require("./SafeMath.sol");

var utils = new DeployUtils(web3);

web3.eth.getTransactionReceiptMined = utils.getTransactionReceiptMined;

module.exports = function(deployer) {
  return new Promise((resolve, reject) => {
    utils.createAndGetInstance(deployer, BigBrother).then(_bigBrother => {
      utils.createAndGetInstance(deployer, EthStarterFactory).then(_factory => {
        
        _bigBrother.update.sendTransaction(_factory.address,
          {
            from: web3.eth.accounts[0],
            gas: 4000000
          }
        );

        utils.createAndGetInstance(deployer, DataStore).then(_dataStore => {
          utils.defaultTransactAndMine(_dataStore.allow, _factory.address).then(() => {
            utils.defaultTransactAndMine(_factory.create, _dataStore.address).then(() => {
              _factory.instance().then(_ethStarter => {
                console.log("ETHSTARTER AT " + _ethStarter);

                utils.addABIToCopy("BigBrother");
                utils.addABIToCopy("EthStarter");
                utils.addABIToCopy("DataStore");
                utils.addAddressToCopy("BigBrotherAddress", _bigBrother.address);
                utils.addAddressToCopy("EthStarterAddress", _ethStarter);
                utils.addAddressToCopy("DataStoreAddress", _dataStore.address);
                
                utils.writeChangesIntoFile();
                resolve(true);
              });
            });
          });
        });
      });
    });
  });
};
