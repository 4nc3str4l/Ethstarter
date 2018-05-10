(function() {
    
    var ProjectSubmisionController = function ($scope, $log, Blockchain, appSettings, DataFactory, $routeParams, $window) {
        $scope.title = "Project";
    };
    
    ProjectSubmisionController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$routeParams', '$window'];

    angular.module('EthStarter')
      .controller('ProjectSubmisionController', ProjectSubmisionController);
    
}());