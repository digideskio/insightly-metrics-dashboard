'use strict';

angular.module('rustApp')
  .controller('MainCtrl', ['$rootScope', '$scope', '$log', '$state', 'Insightly', 'ngTableParams', '$filter', '$timeout', function ($rootScope, $scope, $log, $state, Insightly, ngTableParams, $filter, $timeout) {
		$scope.dataLoaded = false;
		$scope.lastRefreshed = Insightly.getLastRefreshDate();
		
		$scope.init = function () {
			if ( ! $rootScope.loggedIn ) {
				$log.warn('not logged in');
				$state.go('login');
			} else {
				$scope.lastRefreshed = Insightly.getLastRefreshDate();
				Insightly.getMonthlyTeamStats(syncData, false);
			}
		};
		$scope.init();
		
		$scope.refresh = function() {
			$scope.dataLoaded = false;
			
			$timeout(function() {
				Insightly.getMonthlyTeamStats(syncData, true);
				$scope.$apply();
			}, 500);
		};
		
		function syncData(teamData) {
			$scope.tableParamsMain = new ngTableParams({
				page: 1,
				count: 10,
				sorting: {
						name: 'asc'
				}
			},
			{
				total: teamData.length,
				getData: function($defer, params) {
					var orderedData = params.sorting() ?$filter('orderBy')(teamData, params.orderBy()) : teamData;
					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				}
			});
			$scope.dataLoaded = true;
			$timeout( function() {
				$scope.$apply();
			},1500);
			
		}

  }]);

