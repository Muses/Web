
module.exports = function mwIdentityFactory($rootScope, mwSession)
{
	function mwIdentity()
	{
		var self = this;
		var keys = [];

		/**
		 * @var boolean True if the identity is a guest, false otherwise.
		 */
		this.guest = undefined;

		/**
		 * @var boolean True if the identity is loaded, false otherwise.
		 */
		this.loaded = false;

		/**
		 * Login the identity.
		 *
		 * @param object credentials The credentials object.
		 */
		this.login = function(credentials)
		{
			// Create the session.
			mwSession.start(credentials, this.loginSuccess, this.loginError);
		};

		/**
		 * Login Success Callback
		 *
		 * @param object data The data returned by the service.
		 */
		this.loginSuccess = function(data)
		{
			// Stash the keys being bound.
			keys = [];
			for (var i in data) {
				if (data.hasOwnProperty(i)) {
					keys.push(i);
				}
			}

			// Bind the identity.
			angular.extend(self, data);

			// Remove guest designation.
			self.guest = false;

			// Mark the identity as loaded.
			self.loaded = true;

			// Broadcast the login success event.
			$rootScope.$broadcast('mwLoginSuccess', self);
		};

		/**
		 * Login Error Callback
		 *
		 * @param object error The error returned by the service.
		 * @return void
		 * @since 1.0
		 */
		this.loginError = function(error)
		{
			// Mark the identity as loaded.
			self.loaded = true;

			// Broadcast the login success event.
			$rootScope.$broadcast('mwLoginError', error.data);
		};

		/**
		 * Logout the identity.
		 *
		 * @return void
		 * @since 1.0
		 */
		this.logout = function()
		{
			// Destroy the session.
			mwSession.destroy(function()
			{
				// Initialize the identity.
				self.initialize();
			});
		};

		/**
		 * Initialize the identity.
		 *
		 * @return void
		 * @since 1.0
		 */
		this.initialize = function()
		{
			// Initialize basic parameters.
			self.guest = true;

			// Reset the properties bound from the session.
			var key;
			for (key in keys)
			{
				delete self[key];
			}
		};

		// Initialize the identity.
		this.initialize();

		// Get the identity data from the session.
		mwSession.get(this.loginSuccess, this.loginError);

		// Monitor for the login required event.
		$rootScope.$on('mwLoginRequired', function(event)
		{
			self.loaded = true;
			self.guest = true;
		});
	}

	return new mwIdentity();
};
