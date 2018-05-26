var EthStarter = artifacts.require("./EthStarter.sol");
var IDataStore = artifacts.require("./IDataStore.sol");
var PrivilegedWhiteList = artifacts.require("./PrivilegedWhitelist.sol");
var IEthStarter = artifacts.require("./IEthStarterFactory.sol");
var IEthStarterFactory = artifacts.require("./IEthStarterFactory.sol");
var Destructible = artifacts.require("./Destructible");
var Ownable = artifacts.require("./Ownable");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
  deployer.deploy(EthStarter).then(() => EthStarter.deployed()).then(_instance => console.log("Contract Address \n: " + _instance.address));
};
