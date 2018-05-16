(function() {
    
    var LandingController = function ($scope, $log, Blockchain, appSettings, DataFactory, $window) {
        
        $scope.projects = [];

        function init(){
            Blockchain.getCampaigns(
                (_campaigns)=>{
                    $scope.projects = _campaigns;
                    console.log($scope.projects);
                    $scope.$apply();
                }
            );
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