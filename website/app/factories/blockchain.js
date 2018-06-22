class Blockchain{

    constructor(_web3Instance, _appSettings){
        this.web3 = _web3Instance;
        this.appSettings = _appSettings;

        this.numCampaignsToGet = 0;
        this.allCampaigns = [];
        this.isInitialized = false;
        this.initContracts();
    }

    initContract(_abi, _address){
        return new this.web3.eth.Contract(_abi, _address);
    }

    initContracts(){
        this.EthStarter =  this.initContract(this.appSettings.abi.EthStarter, this.appSettings.addresses.EthStarterAddress);
        this.BigBrother = this.initContract(this.appSettings.abi.BigBrother, this.appSettings.addresses.BigBrotherAddress);
        this.DataStore =  this.initContract(this.appSettings.abi.DataStore, this.appSettings.addresses.DataStoreAddress);
        this.isInitialized = true;
    }

    unixTimeStampToDate(_timestamp){
        return new Date(_timestamp * 1000);
    }

    transact(method, obj) {
        return this.web3.eth.getAccounts().then(accounts => {
            obj.from = accounts[0];

            return method.estimateGas(obj).then(gas => {
                obj.gas = gas + 22000;        
                return method.send(obj);
            });
        });
    }

    defaultTransact(method) {
        return this.transact(method, {
            gasPrice: this.web3.utils.toWei("1", "gwei"),
        });
    }

    getAddress(){
        return this.web3.eth.coinbase;
    }
    
    async publishCampaign(_ipfsHash, _endDate, _goalAmount){
        var date = (new Date(_endDate)).getTime();
        var unixTimestamp = date / 1000;
        var goalAmountWei = this.web3.utils.toWei(_goalAmount.toString(), "ether");
        
        return this.defaultTransact(this.EthStarter.methods.addCampaign(_ipfsHash, goalAmountWei, unixTimestamp));
    }

    donate(_campaignID, _amount, _callback){
        var amountWei = this.web3.utils.toWei(_amount.toString(), "ether");
        this.transact(this.EthStarter.methods.payCampaign(_campaignID), {
            gasPrice: this.web3.utils.toWei("1", "gwei"),
            value: amountWei
        }).then(receipt => {
            _callback(receipt);
        });
    }
    
    getCampaignById(_id){
        var blockchain = this;
        return new Promise((resolve, reject) => {                
            blockchain.DataStore.methods.get(_id).call().then(res => {
                window.res = res;
                var response = {
                    id: new blockchain.web3.utils.BN(res[0]),
                    owner: res[1],
                    goal: blockchain.web3.utils.fromWei(res[2], "ether"),
                    endDate: blockchain.unixTimeStampToDate(parseInt(res[3])),
                    balanceCaller: blockchain.web3.utils.fromWei(res[4], "ether"),
                    previous: new blockchain.web3.utils.BN(res[5]),
                    next: new blockchain.web3.utils.BN(res[6])
                }

                resolve(response);
            });
        });
    }

    getLastCampaign(){
        var blockchain = this;
        return new Promise((resolve, reject) =>{                    
            // Get the last Campaign
            blockchain.DataStore.methods.last(false).call().then(res => {
                var campaign = {
                    id: new blockchain.web3.utils.BN(res[0]),
                    owner: res[1],
                    goal: blockchain.web3.utils.fromWei(res[2], "ether"),
                    endDate: blockchain.unixTimeStampToDate(parseInt(res[3])),
                    balanceCaller: blockchain.web3.utils.fromWei(res[4], "ether"),
                    previous: new blockchain.web3.utils.BN(res[5]),
                    next: new blockchain.web3.utils.BN(res[6])
                }
                    
                resolve(campaign);
            });
        });
    }

    ipfsHashToID(hash){

        // Obtain a uint256 representation
        const cid = new Cids(hash).toV1();
        hash = cid.multihash.slice(2);

        var str = "";
        
        for (var byte of hash) {
            str += byte.toString(16).padStart(2, "0");
        }
        
        return new this.web3.utils.BN(str, 16);
    }

}
