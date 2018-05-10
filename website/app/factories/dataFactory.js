(function() {
    var DataFactory = function($http, $log){
        
        var lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

        var projects = [
            {
                id: 1,
                title : 'Project 1',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 2,
                title : 'Project 2',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'            },
            {
                id: 3,
                title : 'Project 3',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 4,
                title : 'Project 4',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            }, 
            {
                id: 5,
                title : 'Project 5',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 6,
                title : 'Project 6',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 7,
                title : 'Project 7',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 8,
                title : 'Project 8',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 9,
                title : 'Project 9',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 10,
                title : 'Project 10',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 11,
                title : 'Project 11',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            },
            {
                id: 12,
                title : 'Project 12',
                description: lorem,
                goal: '10',
                raised: '1.2',
                start_date: '10-02-2018',
                end_date: '10-3-2018',
                website: 'https://www.google.com'
            }
        ]

        return{
            getProjects : function(){
                return projects;
            },
            getProjectWithID: function(_id){
                var p  = null;
                for(var i = 0; i < projects.length; ++i){
                    p = projects[i];
                    if(p.id == _id)
                        return p;
                }
                return null;
            }
        };
    }
    
    DataFactory.$inject = ['$http', '$log'];
    angular.module('EthStarter').factory('DataFactory', DataFactory);

}());
