(function() {
    
    var NavController = function ($scope, BlockchainListener, appSettings, DataFactory, $location) {
        
        function init(){
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