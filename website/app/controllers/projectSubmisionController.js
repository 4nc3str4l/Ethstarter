(function() {
    
    var ProjectSubmisionController = function ($scope, $log, Blockchain, appSettings, DataFactory, $routeParams, $window) {
        
        $scope.title = "Project";
        $scope.loading = false;

        $scope.submit = function(){
            this.loading = true;
            Blockchain.publishCampaign($scope.title, $scope.website, $scope.endDate, $scope.contributionAmmount, $scope.description,
                (error, result) => {
                    $window.location = "/";
                }
            );
        }
    };
    
    ProjectSubmisionController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$routeParams', '$window'];

    angular.module('EthStarter')
      .controller('ProjectSubmisionController', ProjectSubmisionController);
    
}());