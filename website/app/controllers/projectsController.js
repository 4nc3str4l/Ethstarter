(function() {
    
    var ProjectsController = function ($scope, DataFactory, $location) {
        
        $scope.projects = [];

        function init(){
            DataFactory.getCampaigns(campaignInfo => {
                $scope.projects.push(campaignInfo);
                console.log(campaignInfo);
                $scope.$apply();
            });
        }

        $scope.projectDetails = function(id){
            $location.path("/project/" + id);
        }

        init();
    };
    
    ProjectsController.$inject = ['$scope', 'DataFactory', '$location'];

    angular.module('EthStarter')
      .controller('ProjectsController', ProjectsController);
    
}());