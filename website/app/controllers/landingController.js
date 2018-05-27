(function() {
    
    var LandingController = function ($scope, $log, Blockchain, appSettings, DataFactory, $window) {
        
        $scope.projects = [];

        function init(){
            DataFactory.getCampaigns(campaignInfo => {
                console.log(campaignInfo);
                $scope.projects.push(campaignInfo);
                $scope.$apply();
            });
        }

        $scope.projectDetails = function(id){
            $window.location = "#project/" + id;
        }

        init();
    };
    
    LandingController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$window'];

    angular.module('EthStarter')
      .controller('LandingController', LandingController);
    
}());