(function() {
    
    var ProjectController = function ($scope, $log, Blockchain, appSettings, DataFactory, $routeParams, $window) {
        
        $scope.project = null;
        var projectID = -1;
        $scope.contributionAmmount = 0.1;
        $scope.loading = false;
        $scope.isUsingMetamask = false;

        function init(){
            projectID = $routeParams.id;
            $scope.project = DataFactory.inspectCampaign(projectID);
            window.proj = $scope.project;

            // Require the system to switch to metamask mode
            Blockchain.useMetamask(true,
                function success(){
                    $scope.isUsingMetamask = true;
                    $scope.$apply();
                },
                function error(){
                    $scope.isUsingMetamask = false;
                    $scope.$apply();
                }
            );
            console.log($scope.isUsingMetamask);
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
                    Blockchain.getCampaignById(projectID, (_campaign)=>{
                        $scope.project = _campaign;
                        $scope.loading = false;
                        $scope.$apply();
                    });
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