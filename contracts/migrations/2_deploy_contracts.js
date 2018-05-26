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

var getTransactionReceiptMined = function(txHash, interval) {
  const self = this;
  const transactionReceiptAsync = function(resolve, reject) {
    self.getTransactionReceipt(txHash, (error, receipt) => {
      if (error) {
        reject(error);
      } else if (receipt == null) {
        setTimeout(
          () => transactionReceiptAsync(resolve, reject),
          interval ? interval : 500);
      } else {
        resolve(receipt);
      }
    });
  };

  if (Array.isArray(txHash)) {
    return Promise.all(txHash.map(
      oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
  } else if (typeof txHash === "string") {
    return new Promise(transactionReceiptAsync);
  } else {
    throw new Error("Invalid Type: " + txHash);
  }
};

web3.eth.getTransactionReceiptMined = getTransactionReceiptMined;

function createAndGetInstance(deployer, contract) {
  return deployer.deploy(contract).then(() => contract.deployed());
}

function transactAndMine(method, obj, ...args) {
  return method.estimateGas(...args, obj).then(gas => {
    obj['gas'] = gas + 22000;
    
    return method.sendTransaction(...args, obj).then(tx => {
      return web3.eth.getTransactionReceiptMined(tx, 1000);
    });
  });
}

function defaultTransactAndMine(method, ...args) {
  return transactAndMine(method, {from: web3.eth.accounts[0]}, ...args);
}

module.exports = function(deployer) {
  createAndGetInstance(deployer, BigBrother).then(_bigBrother => {
    createAndGetInstance(deployer, EthStarterFactory).then(_factory => {
      
      _bigBrother.update.sendTransaction(_factory.address,
        {
          from: web3.eth.accounts[0],
          gas: 4000000
        }
      );

      createAndGetInstance(deployer, DataStore).then(_dataStore => {
        defaultTransactAndMine(_dataStore.allow, _factory.address).then(() => {
          defaultTransactAndMine(_factory.create, _dataStore.address).then(() => {
            _factory.instance().then(_ethStarter => {
              console.log("ETHSTARTER AT " + _ethStarter);
            });
          });
        });
      });
    });
  });
};
