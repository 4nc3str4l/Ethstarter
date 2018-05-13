(function() {
    
    var LoadingDirective = function(){
        return {
            templateUrl: 'views/directives/loading.html'
        }
    }

    angular.module('EthStarter').directive('loadingDirective', LoadingDirective);
}());