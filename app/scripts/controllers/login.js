'use strict';

angular.module('rustApp')
  .controller('LoginCtrl', ['$scope', '$log', '$state', 'Insightly','$cookies', '$timeout', function ($scope, $log, $state, Insightly, $cookies, $timeout) {
		$scope.loginFailed = false;
		$scope.apiKey = '';
		

		
		$scope.login = function() {
			
			if ($scope.rememberMe) {
				$cookies.rememberMe = true;
			} else {
				$cookies.rememberMe = false;
			}
			// cookie timeout
			$timeout(function() {
				Insightly.login( { key : $scope.apiKey }, function () {
					$log.info('logged in successfully');
					$scope.loginFailed = false;
					$state.go('main');
					
				},  function (err) {
					$log.info('loggin failed');
					$scope.loginFailed = true;
					
				});	
			}, 200);
		};
  }]);
