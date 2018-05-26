var BigBrother = artifacts.require("./BigBrother.sol");
var DataStore = artifacts.require("./DataStore.sol");
var EthStarter = artifacts.require("./EthStarter.sol");

module.exports = function(deployer) { 
  deployer.deploy(BigBrother).then(() => BigBrother.deployed()).then(() => {
    deployer.deploy(DataStore).then(() => DataStore.deployed()).then(_instance => {
      _instance.first(false).then(res => console.log(res));
    });
  });
  // deployer.deploy(EthStarter, "0x1").then(() => EthStarter.deployed()).then(_instance => console.log("Contract Address \n: " + _instance.address));
};
