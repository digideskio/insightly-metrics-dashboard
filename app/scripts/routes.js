'use strict';

angular.module('rustApp')
.config(['$stateProvider','$urlRouterProvider', function ($stateProvider,$urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider
		.state('main',{
			url:'/',
			templateUrl: 'views/partials/main.html',
			controller: 'MainCtrl',
		})
		.state('login',{
			url:'/login',
			templateUrl: 'views/partials/login.html',
			controller: 'LoginCtrl',
		})
		.state('topEarners',{
			url:'/topearners',
			templateUrl: 'views/partials/topearners.html',
			controller: 'TopEarnersCtrl',
		});

}]);
