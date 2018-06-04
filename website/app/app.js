(function() {
    
    var app = angular.module('EthStarter', ['ngRoute']);
    
    app.config(function($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            .when('/', {
                controller: 'LandingController',
                templateUrl: 'views/landing.html'
            })
            .when('/projects', {
                controller: 'ProjectsController',
                templateUrl: 'views/projects.html'
            })
            .when('/project/:id', {
                controller: 'ProjectController',
                templateUrl: 'views/project_details.html'
            })
            .when('/submit', {
                controller: 'ProjectSubmisionController',
                templateUrl: 'views/submit_project.html'
            })
            .otherwise( { redirectTo: '/' } );
    });
    
}());
