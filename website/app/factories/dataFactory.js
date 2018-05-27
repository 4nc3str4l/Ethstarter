(function() {
    var DataFactory = function(){
        var ipfs = new Ipfs({
            repo: "ipfs/shared",
            start: true, 
            EXPERIMENTAL: { 
                relay: { 
                    enabled: true, 
                    hop: { enabled: true } 
                }
            }
        });

        // Promise to check if IPFS is ready
        var ipfsReady = new Promise((resolve, _) => {
            ipfs.once('ready', async function() {
                // Connect to Relay node
                await ipfs.swarm.connect("/ip4/79.157.247.178/tcp/4004/ws/ipfs/QmRaQcxv3CzkYkZQuMRm6Pa6tSdhU34HKL4JeK8gL7uCin");

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

        return {
            submitCampaign: async function(campaign) {
                // Make sure IPFS is connected and relayed
                await ipfsReady;

                // First make sure it's valid
                validateCampaign(campaign);

                // Dump to IPFS and retrieve hash
                var buffer = ipfs.types.Buffer(JSON.stringify(campaign));
                var file = await ipfs.files.add(buffer);
                console.log(file[0].hash);

                // Obtain a uint256 representation
                const cid = new Cids(file[0].hash).toV1();
                console.log(cid);
                var hash = cid.multihash.slice(2);
                var str = "0x";
                
                for (var byte of hash) {
                    str += byte.toString(16).padStart(2, "0");
                }

                console.log(str);
                return new web3.BigNumber(str);
            },

            getCampaignByBase58Hash: async function(ipfsHash) {
                // Make sure IPFS is connected and relayed
                await ipfsReady;

                // Fetch file from ipfs
                var file = await ipfs.files.get(ipfsHash);
                var content = file[0].content.toString('utf-8');

                // Parse JSON and validate
                var campaign = JSON.parse(content);
                validateCampaign(campaign);

                // Done!
                return campaign;
            },

            getCampaignById: async function(id) {
                // Create a dummy CID to obtain a buffer
                var buffer = new Cids("QmSx9Z7QNqTLmgDao8ZqqQbDiKpDRx83mk2dpqtsz6Nf8z").toV1().buffer;

                // Set new bytes for the buffer
                for (var i = 0; i < 64; i += 2) {
                    buffer[4 + i / 2] = parseInt(id.slice(i, i+2), 16);
                }

                // Get base58 encoded hash
                var ipfsHash = new Cids(buffer).toV0.toBaseEncodedString();
                return await this.getCampaignByBase58Hash(ipfsHash);
            }
        };

        return promise;
    }

    return angular.module('EthStarter').factory('DataFactory', DataFactory);
}());
