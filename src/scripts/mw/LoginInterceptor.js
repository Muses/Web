
module.exports = function mwLoginInterceptorFactory($injector, $q, $rootScope, mwLoginQueue) {

	/**
	 * The Login Interceptor.
	 */
	function mwLoginInterceptor() {

		var self = this, $http;

		/**
		 * The error handler.
		 *
		 * @param  {Object} response The response object.
		 *
		 * @return {$q.promise}      A promise object that has already been rejected.
		 */
		this.error = function(response)
		{
			// Check if $http is initialized.
			if (!$http) {

				// Lazy load $http to prevent circular references.
				$http = $injector.get('$http');
			}

			// Check if the request requires authentication.
			if (response.status === 401) {

				// Broadcast the login required event.
				$rootScope.$broadcast('mwLoginRequired');

				// Copy the config to avoid closure rewrite.
				var config = angular.extend({}, response.config);

				// Add the request to the queue.
				return mwLoginQueue.add(function() {
					return $http(config);
				});
			}

			// Reject the request.
			return $q.reject(response);
		};

		/**
		 * The promise wrapper.
		 *
		 * @param  {$q.promise} promise The promise object.
		 *
		 * @return {$q.promise}         Another promise object wrapped with the request interceptor error handler.
		 */
		return function(promise) {
			return promise.then(null, self.error);
		};
	}

	// Instantiate the login interceptor.
	return new mwLoginInterceptor();
};