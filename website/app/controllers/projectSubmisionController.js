(function() {
    
    var ProjectSubmisionController = function ($window, $scope, BlockchainSender, DataFactory, $location) {
        
        $scope.title = "Project";
        $scope.loading = false;

        $scope.submit = function(){
            this.loading = true;

            DataFactory.submitCampaign({
                'title': $scope.title, 
                'website': $scope.website, 
                'description': $scope.description,
                'image': $scope.image
            }).then(ipfsHash => {                
                Blockchain.publishCampaign(ipfsHash, $scope.endDate, $scope.contributionAmmount).then(() => {
                    $location.path('/');
                });
            });
        }
    };
    
    ProjectSubmisionController.$inject = ['$window', '$scope', 'BlockchainSender', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('ProjectSubmisionController', ProjectSubmisionController);
    
}());