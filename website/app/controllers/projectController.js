(function() {
    
    var ProjectController = function ($scope, $log, Blockchain, appSettings, DataFactory, $routeParams, $window) {
        
        $scope.project = null;
        var projectID = -1;
        $scope.contributionAmmount = 0.1;
        $scope.loading = false;

        
        //TODO: Move this to a utils file
        function isInteger(str){
            return /^\+?(0|[1-9]\d*)$/.test(str);
        }
        
        function init(){
            if(isInteger($routeParams.id)){
                projectID = $routeParams.id;
                $scope.project = Blockchain.getCampaignById(projectID);
                
            }else{
                $window.location.href = '/'
            }
        }
        
        if($scope.contributionAmmount <= 0){
            return;
        }
        
        // NOTE: Use this 2 after if provided
        //$scope.name $scope.email (Not used for now)
        $scope.donate = function(){
            $scope.loading = true;
            Blockchain.donate(projectID, $scope.contributionAmmount,
                (error, result) => {
                    $scope.loading = false;
                    $scope.project = Blockchain.getCampaignById(projectID);
                    $scope.$apply();
                    alert("Donation Complete!");
                }
            );
        }

        init();
    };
    
    ProjectController.$inject = ['$scope', '$log', 'Blockchain', 'appSettings', 'DataFactory', '$routeParams', '$window'];

    angular.module('EthStarter')
      .controller('ProjectController', ProjectController);
    
}());