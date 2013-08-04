
// Instantiate the application module.
var module = angular.module('mWeb', [
	'ui.router'
]);

// Register the login replay queue service.
module.service('LoginReplayQueue', [
	'$q', require('./login/replayqueue.js')
]);

// Setup the application runtime.
module.run([
	'$rootScope', '$window', function($rootScope, $window) {

		// Check if there is a config callback.
		if (angular.isFunction($window.mConfigCallback)) {

			// Bind the application settings to the root scope.
			$rootScope.app = $window.mConfigCallback();
		}
	}
]);