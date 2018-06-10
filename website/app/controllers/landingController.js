(function() {
    
    var LandingController = function ($scope, BlockchainListener, DataFactory, $location) {
        
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
    
    LandingController.$inject = ['$scope', 'BlockchainListener', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('LandingController', LandingController);
    
}());