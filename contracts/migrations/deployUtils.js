'use strict'

const fs = require("fs");
const VALUES_PATH = "../website/app/values/values.js";

class DeployUtils {

    constructor(web3) {
        this.web3 = web3;
        this.dataToCopy = {
            development: true,
            useIPFS: true,
            addresses: {},
            abi: {}
        };
    }

    getTransactionReceiptMined(txHash, interval) {
        const self = this;
        const transactionReceiptAsync = function (resolve, reject) {
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

    createAndGetInstance(deployer, contract) {
        return deployer.deploy(contract).then(() => contract.deployed());
    }

    transactAndMine(method, obj, ...args) {
        return method.estimateGas(...args, obj).then(gas => {
            obj['gas'] = gas + 22000;

            return method.sendTransaction(...args, obj).then(tx => {
                return this.web3.eth.getTransactionReceiptMined(tx, 1000);
            });
        });
    }

    defaultTransactAndMine(method, ...args) {
        return this.transactAndMine(method, {
            from: this.web3.eth.accounts[0],
            gasPrice: this.web3.toWei(1, "gwei"),
        }, ...args);
    }

    addABIToCopy(contractName) {
        var data = fs.readFileSync('./build/contracts/' + contractName + ".json", "utf8");
        var file = JSON.parse(data);
        this.dataToCopy.abi[contractName] = file.abi;
    }

    addAddressToCopy(name, address) {
        this.dataToCopy.addresses[name] = address;
    }

    writeChangesIntoFile() {
        var fileHeader = "angular.module('EthStarter').constant('appSettings',"
        var dataToWrite = JSON.stringify(this.dataToCopy, null, 4);
        var fileEnd = "\n);";
        var fs = require('fs');

        fs.writeFile(VALUES_PATH, fileHeader + dataToWrite + fileEnd, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("FrontEnd values updated!");
        });
    }
}

module.exports = {
    DeployUtils: DeployUtils
}