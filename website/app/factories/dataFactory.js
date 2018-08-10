(function() {
    var DataFactory = function($http, Blockchain, appSettings){

        const USE_INFURA_IPFS_GATEWAY = false;
        const USE_INFURA_IPFS_API = true;
        var downloadedData = {};

        if (USE_INFURA_IPFS_API)
        {
            const IPFS_ENDPOINTS = [];
            
            var ipfs = window.ipfs = IpfsApi('ipfs.infura.io', '5001', {protocol: 'https'});
        }
        else
        {
            const IPFS_ENDPOINTS = [
                '/ip4/91.121.65.63/tcp/4004/ws/ipfs/QmWR3f7BxGAjaTB8Tg1NHqpsksJ3SLUpHAJeaoPVWwxonM'
            ];

            var ipfs = window.ipfs = new Ipfs({
                repo: "ipfs/shared",
                config: { // overload the default config
                    Addresses: {
                        Swarm: [
                            '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
                        ]
                    },
                    Bootstrap: IPFS_ENDPOINTS,
                    EXPERIMENTAL: { 
                        dht: true,
                        relay: { 
                            enabled: true, 
                            hop: { enabled: true } 
                        }
                    }
                }
            });
        }

        // Promise to check if IPFS is ready
        var ipfsReady = new Promise((resolve, _) => {
            if (USE_INFURA_IPFS_API)
            {
                resolve(ipfs);
                return;
            }

            ipfs.once('ready', async function() {
                for (endpoint of IPFS_ENDPOINTS) {
                    try {
                        await ipfs.swarm.connect(endpoint);
                    }
                    catch (e) {}
                }

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
                    console.log("Unexpected campaign received: " + ipfsHash);
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

                return Blockchain.ipfsHashToID(file[0].hash);
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

                if (USE_INFURA_IPFS_GATEWAY)
                {
                    var response = await $http.get('https://ipfs.infura.io/ipfs/' + ipfsHash);
                    var content = response.data;
                }
                else
                {
                    // Make sure IPFS is connected and relayed
                    // TODO: Once available in IPFS, time this out
                    await ipfsReady;

                    // Fetch file from ipfs
                    var file = await ipfs.files.get(ipfsHash);
                    var content = file[0].content.toString('utf-8');
                }

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
                    buffer[4 + i / 2] = parseInt(id.slice(i, i + 2), 16);
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
            },
        };

        return promise;
    }

    DataFactory.$inject = ['$http', 'Blockchain', 'appSettings'];    
    return angular.module('EthStarter').factory('DataFactory', DataFactory);
}());