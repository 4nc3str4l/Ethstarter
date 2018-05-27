(function() {
    
    var LandingController = function ($scope, $log, Blockchain, appSettings, DataFactory, $window) {
        
        $scope.projects = [];

        function init(){
            Blockchain.getCampaigns().then(campaignInfo =>{
                console.log(campaignInfo);
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