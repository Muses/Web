
module.exports = function mwSessionFactory($resource, mwConfig)
{
	// Setup the session service.
	var mwSession = $resource(
		mwConfig.path.service + 'session',
		{},
		{
			start: {
				method: 'POST'
			},
			destroy: {
				method: 'DELETE'
			}
		}
	);

	return mwSession;
};