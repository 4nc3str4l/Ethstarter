(function() {
    
    var ProjectSubmisionController = function ($scope, Blockchain, DataFactory,$location) {
        
        $scope.title = "Project";
        $scope.loading = false;

        $scope.submit = function(){
            this.loading = true;
            Blockchain.publishCampaign($scope.title, $scope.website, $scope.endDate, $scope.contributionAmmount, $scope.description,
                (receipt) => {
                    $location.path("/");
                }
            );
        }
    };
    
    ProjectSubmisionController.$inject = ['$scope', 'Blockchain', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('ProjectSubmisionController', ProjectSubmisionController);
    
}());