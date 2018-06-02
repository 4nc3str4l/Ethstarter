(function() {
    
    var ProjectSubmisionController = function ($window, $scope, Blockchain, DataFactory, $location) {
        
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
                    $window.location.href = '/';
                });
            });
        }
    };
    
    ProjectSubmisionController.$inject = ['$window', '$scope', 'Blockchain', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('ProjectSubmisionController', ProjectSubmisionController);
    
}());