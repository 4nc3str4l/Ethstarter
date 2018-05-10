(function() {
    
    var ProjectController = function ($scope, $log, Blockchain, appSettings, DataFactory, $routeParams, $window) {
        
        $scope.project = null;
        var projectID = -1;
        $scope.contributionAmmount = 0.1;
        
        //TODO: Move this to a utils file
        function isInteger(str){
            return /^\+?(0|[1-9]\d*)$/.test(str);
        }

        function init(){
            if(isInteger($routeParams.id)){
                projectID = $routeParams.id;
                $scope.project = DataFactory.getProjectWithID(projectID);

            }else{
                $window.location.href = '/'
            }
        }

        init();
    };
    
    ProjectController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$routeParams', '$window'];

    angular.module('EthStarter')
      .controller('ProjectController', ProjectController);
    
}());