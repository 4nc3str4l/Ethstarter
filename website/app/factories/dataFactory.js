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
                await ipfs.swarm.connect("/ip4/127.0.0.1/tcp/4004/ws/ipfs/QmRaQcxv3CzkYkZQuMRm6Pa6tSdhU34HKL4JeK8gL7uCin");

                // Done!
                resolve(ipfs);
            });
        });        

        return {
            getCampaignById: async function(ipfsHash) {
                // Make sure IPFS is connected and relayed
                await ipfsReady;

                // Fetch file from ipfs
                var file = await ipfs.files.get(ipfsHash);
                var content = file[0].content.toString('utf-8');
                
                // Parse JSON
                var data = JSON.parse(content);
                const expectedKeys = ['title', 'description', 'image'];

                // Check all keys are present
                for (var key of expectedKeys) {
                    if (!(key in data)) {
                        throw new Error('Invalig campaign: missing ' + key);
                    }
                }

                // Check there are no more keys than required
                for (key in data) {
                    if (!(key in expectedKeys)) {
                        throw new Error('Invalig campaign: unexpected ' + key);
                    }
                }

                // Done!
                return data;
            }
        };

        return promise;
    }

    return angular.module('EthStarter').factory('DataFactory', DataFactory);
}());
