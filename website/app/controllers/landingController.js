(function() {
    
    var LandingController = function ($scope, $log, Blockchain, appSettings, DataFactory) {
        
        $scope.projects = [];

        function init(){
            $scope.projects = DataFactory.getProjects();
        }

        init();
    };
    
    LandingController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory'];

    angular.module('EthStarter')
      .controller('LandingController', LandingController);
    
}());