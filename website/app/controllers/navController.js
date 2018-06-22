(function() {
    
    var NavController = function ($scope, $location) {
        
        function init(){
        }

        $scope.getClass = function(_url){
            return $location.url() == _url ? 'active' : '';
        }

        init();
    };
    
    NavController.$inject = ['$scope', '$location'];

    angular.module('EthStarter')
      .controller('NavController', NavController);
    
}());