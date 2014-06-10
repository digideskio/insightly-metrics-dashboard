'use strict';

angular.module('rustApp')
  .controller('NavbarCtrl', ['$scope', '$state', '$rootScope', '$log', 'Insightly', '$timeout',  function ($scope, $state, $rootScope, $log, Insightly, $timeout) {

		$scope.logout = function(state) {
			$log.warn('logging out');
			Insightly.logout();
			$timeout(function() {
				$scope.$apply();
				$state.go('login');
			}, 200);
			
    };

    $scope.isActive = function(state) {
			return $state.is(state);
    };
    
  }]);
