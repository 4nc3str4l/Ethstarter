(function() {
    
    var NavController = function ($scope, $log, Blockchain, appSettings, DataFactory, $location) {
        
        $scope.projectCandidates = [];

        function init(){
            $scope.projectCandidates = Blockchain.getCampaigns();
        }

        // Only allow search to be visible on the main page
        $scope.isSearchVisible = function(){
            $log.info($location.url());
            return $location.url() == "/";
        }

        $scope.getClass = function(_url){
            return $location.url() == _url ? 'active' : '';
        }

        init();
    };
    
    NavController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('NavController', NavController);
    
}());