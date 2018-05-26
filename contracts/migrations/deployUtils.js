'use strict'

const fs = require("fs")

class DeployUtils {

    constructor(web3) {
        this.web3 = web3;
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
            from: this.web3.eth.accounts[0]
        }, ...args);
    }
}

module.exports = {
    DeployUtils: DeployUtils
}