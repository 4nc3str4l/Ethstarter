(function() {
    
    var NavController = function ($scope, BlockchainListener, appSettings, DataFactory, $location) {
        
        function init(){
        }

        // Only allow search to be visible on the main page
        $scope.isSearchVisible = function(){
            return $location.url() == "/";
        }

        $scope.getClass = function(_url){
            return $location.url() == _url ? 'active' : '';
        }

        init();
    };
    
    NavController.$inject = ['$scope', 'BlockchainListener', 'appSettings', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('NavController', NavController);
    
}());