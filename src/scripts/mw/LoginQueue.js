
module.exports = function mwLoginQueueFactory($q) {

	/**
	 * The Login Queue.
	 */
	function mwLoginQueue($q) {

		/**
		 * The request queue.
		 *
		 * @type {Array}
		 */
		this.queue = [];

		/**
		 * The processing state.
		 *
		 * @type {Boolean}
		 */
		this.processing = false;

		/**
		 * Add a replay function to the queue.
		 *
		 * @param  {Function} replay A function to execute.
		 *
		 * @return {$q.promise}      A $q promise object.
		 */
		this.add = function(replay) {

			// Create a new deferred operation.
			var deferred = $q.defer();

			// Push the retry function into the queue.
			this.queue.push(function() {

				// Execute the replay function.
				replay().then(deferred.resolve, deferred.reject);
			});

			return deferred.promise;
		};

		/**
		 * Process the queued requests.
		 */
		this.process = function() {

			// Don't allow concurrent processing.
			if (this.processing) {
				return;
			}

			// Start processing.
			this.processing = true;

			// Process each individual request.
			while (this.queue.length) {

				// Replay the individual request.
				(this.queue.shift())();
			}

			// End processing.
			this.processing = false;
		};
	}

	// Instantiate a login replay queue.
	return new mwLoginQueue($q);
};