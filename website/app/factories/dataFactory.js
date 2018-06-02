(function() {
    var DataFactory = function(Blockchain, appSettings){

        var downloadedData = {};
        const IPFS_ENDPOINT = '/ip4/91.121.65.63/tcp/4004/ws/ipfs/QmWR3f7BxGAjaTB8Tg1NHqpsksJ3SLUpHAJeaoPVWwxonM';

        var ipfs = window.ipfs = new Ipfs({
            repo: "ipfs/shared",
            config: { // overload the default config
                Addresses: {
                    Swarm: [
                        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
                    ]
                },
                Bootstrap: [
                    IPFS_ENDPOINT
                ],
                EXPERIMENTAL: { 
                    dht: true,
                    relay: { 
                        enabled: true, 
                        hop: { enabled: true } 
                    }
                }
            }
        });

        // Promise to check if IPFS is ready
        var ipfsReady = new Promise((resolve, _) => {
            ipfs.once('ready', async function() {
                try {
                    await ipfs.swarm.connect(IPFS_ENDPOINT);
                }
                catch (e) {}

                // Done!
                resolve(ipfs);
            });
        });

        function validateCampaign(campaign) {
            const expectedKeys = ['title', 'description', 'website', 'image'];

            // Check all keys are present
            for (var key of expectedKeys) {
                if (!(key in campaign)) {
                    throw new Error('Invalig campaign: missing ' + key);
                }
            }

            // Check there are no more keys than required
            for (key in campaign) {
                if (expectedKeys.indexOf(key) < 0) {
                    throw new Error('Invalig campaign: unexpected ' + key);
                }
            }
        }

        async function iterateCampaigns(self, campaign, order, showCampaign) {
            var ipfsHash = self.getIpfsHashFromId(campaign.id);

            self.getCampaignByIpfsHash(ipfsHash)
                .then(information => {
                    // Update with new info
                    for (key in information) {
                        campaign[key] = information[key];
                    }

                    // Some more info
                    campaign.id = ipfsHash;
                    campaign.order = order;
                    
                    // Progress function
                    campaign.progress = function() {
                        return 50.0;
                        return this.raised * 100.0 / this.goal;
                    }

                    downloadedData[campaign.id] = campaign;

                    // Callback
                    showCampaign(campaign);
                })
                .catch(e => {
                    console.log("Unexpected campaign received 2: " + ipfsHash);
                });

            // Is there any previous?
            if (campaign.previous.toString(16) == "0") {
                return;
            }

            // Get previous and iterate
            var prevCampaign = await Blockchain.getCampaignById(campaign.previous);
            iterateCampaigns(self, prevCampaign, order + 1, showCampaign);
        }

        return {
            submitCampaign: async function(campaign) {
                // Make sure IPFS is connected and relayed
                await ipfsReady;

                // First make sure it's valid
                validateCampaign(campaign);

                // Dump to IPFS and retrieve hash
                var buffer = ipfs.types.Buffer(JSON.stringify(campaign));
                var file = await ipfs.files.add(buffer);

                // Debug
                console.log("IPFS Hash " + file[0].hash);

                // Obtain a uint256 representation
                const cid = new Cids(file[0].hash).toV1();
                var hash = cid.multihash.slice(2);
                var str = "";
                
                for (var byte of hash) {
                    str += byte.toString(16).padStart(2, "0");
                }

                return new web3.utils.BN(str, 16);
            },

            getCampaignByIpfsHash: async function(ipfsHash) {
                if(!appSettings.useIPFS){
                    return{
                        
                        title: "Title",
                        description: "I want ETH for make my dreams become true!!!",
                        creationDate: new Date(),
                        website: "www.lostsocket.net",
                        raised: 10,
                        goalAmount: 5,
                        endDate: new Date(),

                        progress : function(){
                            return 50;
                        }
                    }
                }

                // Make sure IPFS is connected and relayed
                await ipfsReady;

                console.log(ipfsHash);

                // Fetch file from ipfs
                var file = await ipfs.files.get(ipfsHash);
                var content = file[0].content.toString('utf-8');

                console.log("Got from " + ipfsHash);

                // Parse JSON and validate
                var campaign = JSON.parse(content);
                validateCampaign(campaign);

                // Done!
                return campaign;
            },

            getIpfsHashFromId: function(id) {
                // Create a dummy CID to obtain a buffer
                var buffer = new Cids("QmSx9Z7QNqTLmgDao8ZqqQbDiKpDRx83mk2dpqtsz6Nf8z").toV1().buffer;
                id = id.toString(16);

                // Set new bytes for the buffer
                for (var i = 0; i < 64; i += 2) {
                    buffer[4 + i / 2] = parseInt(id.slice(i, i+2), 16);
                }

                // Get base58 encoded hash
                return new Cids(buffer).toV0().toBaseEncodedString();
            },

            getCampaigns: function(showCampaign) {
                var self = this;
                Blockchain.getLastCampaign().then(campaign => {
                    if (campaign.id.toString(16) != "0") {
                        iterateCampaigns(self, campaign, 0, showCampaign);
                    }
                });
            },

            inspectCampaign: function(ipfsID){
                return downloadedData[ipfsID];
            }

        };

        return promise;
    }

    DataFactory.$inject = ['Blockchain', 'appSettings'];    
    return angular.module('EthStarter').factory('DataFactory', DataFactory);
}());
