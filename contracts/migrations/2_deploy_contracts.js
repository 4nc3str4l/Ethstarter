var Owned = artifacts.require("./Owned.sol");
var Mortal = artifacts.require("./Mortal.sol");
var EthStarter = artifacts.require("./EthStarter.sol");

module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.link(Owned, Mortal);

  deployer.deploy(Mortal);
  deployer.link(Mortal, EthStarter);
  
  deployer.deploy(EthStarter).then(() => EthStarter.deployed()).then(_instance => console.log("Contract Address \n: " + _instance.address));
};
