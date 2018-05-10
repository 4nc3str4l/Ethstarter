(function() {
    
    var ProjectSubmisionController = function ($scope, $log, Blockchain, appSettings, DataFactory, $routeParams, $window) {
        $scope.title = "Project";

        $scope.submit = function(){
            $scope.website;
            $scope.endDate;
            $scope.contributionAmmount;
            $scope.description;
            Blockchain.publishCampaign($scope.title, $scope.website, $scope.endDate, $scope.contributionAmmount, $scope.description);
        }
    };
    
    ProjectSubmisionController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$routeParams', '$window'];

    angular.module('EthStarter')
      .controller('ProjectSubmisionController', ProjectSubmisionController);
    
}());