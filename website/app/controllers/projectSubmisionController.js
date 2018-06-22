(function() {
    
    var ProjectSubmisionController = function ($window, $scope, Blockchain, DataFactory, $location) {
        
        $scope.title = "Project";
        $scope.loading = false;
        $scope.usingMetamask = false;

        // Require the system to switch to metamask mode
        Blockchain.useMetamask(true).then(
            function success(){
                $scope.usingMetamask = true;
                $scope.$apply();
            },
            function error(){
                $scope.usingMetamask = false;
                $scope.$apply();
            }
        );

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
    
    ProjectSubmisionController.$inject = ['$window', '$scope', 'Blockchain', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('ProjectSubmisionController', ProjectSubmisionController);
    
}());