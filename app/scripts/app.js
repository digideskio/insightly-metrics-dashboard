'use strict';

angular.module('rustApp', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ui.router',
	'ui.bootstrap',
	'ngTable'
])
.run(function ($rootScope, $log, $state, $cookies) {
	$log.info('app activted');
	if ($cookies.key) {
		$rootScope.loggedIn = true;
	} else {
		$rootScope.loggedIn = false;
	}

})
