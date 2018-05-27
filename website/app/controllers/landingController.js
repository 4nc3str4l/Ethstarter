(function() {
    
    var LandingController = function ($scope, Blockchain, DataFactory, $location) {
        
        $scope.projects = [];

        function init(){
            DataFactory.getCampaigns(campaignInfo => {
                $scope.projects.push(campaignInfo);
                $scope.$apply();
            });
        }

        $scope.projectDetails = function(id){
            $location.path("/project/" + id);
        }

        init();
    };
    
    LandingController.$inject = ['$scope', 'Blockchain', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('LandingController', LandingController);
    
}());