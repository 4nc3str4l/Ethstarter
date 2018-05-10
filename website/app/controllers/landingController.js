(function() {
    
    var LandingController = function ($scope, $log, Blockchain, appSettings, DataFactory, $window) {
        
        $scope.projects = [];
        $scope.testString = "";

        function init(){
            $scope.projects = DataFactory.getProjects();
            $scope.testString = Blockchain.getTestString();
        }

        $scope.projectDetails = function(id){
            $window.location = "#project/" +id;
        }

        init();
    };
    
    LandingController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$window'];

    angular.module('EthStarter')
      .controller('LandingController', LandingController);
    
}());