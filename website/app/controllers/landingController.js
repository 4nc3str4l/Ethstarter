(function() {
    
    var LandingController = function ($scope, $log, Blockchain, appSettings) {
        $scope.contractAddress = appSettings.contractAddress;
    };
    
    LandingController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings'];

    angular.module('EthStarter')
      .controller('LandingController', LandingController);
    
}());