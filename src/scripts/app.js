
// Instantiate the application module.
var module = angular.module('mwApp', [
	'ngResource', 'ui.state'
]);

// Register the config.
module.factory('mwConfig', require('./mw/Config'));

// Register the login queue.
module.service('mwLoginQueue', [
	'$q', require('./mw/LoginQueue')
]);

// Register the login interceptor.
module.factory('mwLoginInterceptor', [
	'$injector', '$q', '$rootScope', 'mwLoginQueue', require('./mw/LoginInterceptor')
]);

// Register the session service.
module.factory('mwSession', [
	'$resource', 'mwConfig', require('./mw/Session')
]);

// Register the identity.
module.factory('mwIdentity', [
	'$rootScope', 'mwSession', 'mwConfig', require('./mw/Identity')
]);

// Register the login form controller.
module.controller('mwLoginController', [
	'$scope', 'mwIdentity', 'mwLoginQueue', require('./mw/LoginController')
]);

// Configure $http to use the login interceptor.
module.config([
	'$httpProvider', function($httpProvider) {
		$httpProvider.responseInterceptors.push('mwLoginInterceptor');
	}
]);

// Configure the application states.
module.config([
	'$stateProvider', '$locationProvider', '$urlRouterProvider', 'mwConfigProvider', function($stateProvider, $locationProvider, $urlRouterProvider, mwConfigProvider)
	{
		// The config is not injectable yet so we have to get it from the provider.
		var mwConfig = mwConfigProvider.$get();

		// Configure the default route.
		$urlRouterProvider.otherwise(mwConfig.path.page);

		// Configure the app to use push state routing.
		$locationProvider.html5Mode(true).hashPrefix('#');
	}
]);

// Setup the application runtime.
module.run([
	'$rootScope', 'mwConfig', 'mwIdentity', function($rootScope, mwConfig, mwIdentity) {

		// Bind the application config to the root scope.
		$rootScope.mwConfig = mwConfig;

		// Bind the identity to the root scope.
		$rootScope.mwIdentity = mwIdentity;
	}
]);
