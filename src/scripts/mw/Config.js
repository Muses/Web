
/**
 * The Muses Config Provider.
 *
 * @return {Object} The configuration object.
 */
module.exports = function mwConfigFactory() {

	// Initialize the configuration object.
	var mwConfig = {};

	// Check if there is a config callback.
	if (angular.isFunction(mwConfigCallback)) {

		// Load the configuration from the callback.
		mwConfig = mwConfigCallback();
	}

	return mwConfig;
};