'use strict';

angular.module('rustApp')
 .controller('TopEarnersCtrl', ['$rootScope', '$scope', '$log', '$state', 'Insightly', 'ngTableParams', '$filter', '$timeout', function ($rootScope, $scope, $log, $state, Insightly, ngTableParams, $filter, $timeout) {
		$scope.dataLoaded = false;
		
		
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
			$timeout( function() {
				Insightly.getMonthlyTeamStats(syncData, true);
			}, 500);
		};
		
		function syncData(teamData) {
			var topEarners = [];
			for(var i = teamData.length - 1; i >= 0; i--) {
				for(var i2 = teamData[i].topWinners.length - 1; i2 >= 0; i2--) {
					topEarners.push( teamData[i].topWinners[i2] );
				}
			}
			teamData = topEarners;
			
			$scope.tableParamsMain = new ngTableParams({
				page: 1,            // show first page
				count: 10,          // count per page
				sorting: {
						OPPORTUNITY_FIELD_3: 'asc' 
				}
			}, {
				total: teamData.length, 
				getData: function($defer, params) {
					var orderedData = params.sorting() ?$filter('orderBy')(teamData, params.orderBy()) : teamData;
					$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					$
				}
			});
			$scope.dataLoaded = true;
			$timeout( function() { 
				$scope.$apply();
			},1500);
		};
  }]);
