(function() {
    
    var app = angular.module('EthStarter', ['ngRoute']);
    
    app.config(function($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            .when('/', {
                controller: 'LandingController',
                templateUrl: 'views/landing.html'
            })
            .when('/project/:id', {
                controller: 'ProjectController',
                templateUrl: 'views/project_details.html'
            })
            .otherwise( { redirectTo: '/' } );
    });
    
}());