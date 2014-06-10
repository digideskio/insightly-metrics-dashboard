'use strict';

angular.module('rustApp')
	.factory('Insightly', ['insightlyConfig', '$log', '$http', '$rootScope', '$cookies', '$timeout', '$filter', function Insightly(insightlyConfig, $log, $http, $rootScope, $cookies, $timeout, $filter) {
		var cache;
		var cacheLastUpdated;
		var callbackOnLoaded;
		
		function loadData() {
			if (cache) {
				callbackOnLoaded(cache);
			} else {
				cacheLastUpdated = null;
				$http({
					url: '/api/teams/monthlystats',
					method: 'POST'
				}).then(function(response) {
					cacheLastUpdated = $filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss');
					cache = response.data;
					callbackOnLoaded(cache);
				}, function(error) {
					$log.warn(error.data);
				});
			}
		}
		return {
			
			logout: function() {
				$rootScope.loggedIn = false;
				$cookies.key = '';
				$cookies.rememberMe = '';
				
			},
			
			/** RETURNS 200 or 401 (not authorized) **/
			login: function(params, onSuccess, onFailure) {
				$http({
					url: '/api/insightly/login',
					method: 'POST',
					data: params
				}).then(function(response) {
					$log.info(response);
					$rootScope.loggedIn = true;
					// If remember me wasn't selected, then we need to set an angular session only cookie for the key
					// otherwise the node server already would have generated a long term cookie
					if ( ! $cookies.key  ) { $cookies.key = response.data.key; }
					// create delay for cookies to refresh
					$timeout(function() {
						onSuccess();
					}, 200);
				}, function(error) {
				  onFailure(error);
				});
			},
			/** TEAM MONTHLY STAT MODEL
			{
					name: currentTeam,
					grossMargin: 0,
					valueWon : 0,
					valueOpen : 0,
					profitWon : 0,
					valueWonCount : 0,
					profitPerDay : 0,
					topWinners : []
				} 
			**/
			getLastRefreshDate : function() {
				return cacheLastUpdated;
			},
			
			getMonthlyTeamStats: function(onSuccess, shouldRefresh) {
				if (shouldRefresh === true) { cache = null;  }
				callbackOnLoaded = onSuccess;
				loadData();
			}
			
		};
	}]);
