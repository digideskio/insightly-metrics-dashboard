'use strict';

angular.module('rustApp')
.config(['$stateProvider','$urlRouterProvider', function ($stateProvider,$urlRouterProvider) {
	$urlRouterProvider.otherwise('/');
	$stateProvider
		.state('main',{
			url:'/',
			templateUrl: '/partials/main.html',
			controller: 'MainCtrl',
		})
		.state('login',{
			url:'/login',
			templateUrl: '/partials/login.html',
			controller: 'LoginCtrl',
		})
		.state('topEarners',{
			url:'/topearners',
			templateUrl: '/partials/topearners.html',
			controller: 'TopEarnersCtrl',
		});

}]);
