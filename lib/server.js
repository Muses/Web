
// Load external dependencies.
var browserify = require('browserify-middleware');
var express = require('express');
var fs = require('fs');
var less = require('express-less');
var morgan = require('morgan');
var errorhandler = require('errorhandler');
var lodash = require('lodash');
var path = require('path');

// Server variables.
var server;

// Expose the options.
exports.options = {
	port: 8000
};

// Setup the runtime options.
var runtime = {
	app: {},
	path: {}
};

// Load the runtime app dist settings if available.
if (fs.existsSync(path.join(__dirname, '../etc/app.dist.js'))) {
	lodash.extend(runtime.app, require(path.join(__dirname, '../etc/app.dist.js')));
}

// Load the runtime app settings if available.
if (fs.existsSync(path.join(__dirname, '../etc/app.js'))) {
	lodash.extend(runtime.app, require(path.join(__dirname, '../etc/app.js')));
}

// Load the runtime path dist settings if available.
if (fs.existsSync(path.join(__dirname, '../etc/path.dist.js'))) {
	lodash.extend(runtime.path, require(path.join(__dirname, '../etc/path.dist.js')));
}

// Load the runtime path settings if available.
if (fs.existsSync(path.join(__dirname, '../etc/path.js'))) {
	lodash.extend(runtime.path, require(path.join(__dirname, '../etc/path.js')));
}

// Initialize the server.
exports.initialize = function() {

	// Instantiate the express server.
	server = express();

	// Setup basic middleware.
	server.use(morgan('dev'));

	// Setup layouts middleware.
	server.set('views', __dirname + '/../src/layouts');
	server.set('view engine', 'jade');

	// Setup styles middleware.
	server.use(less(__dirname + '/../src', { debug: true }));

	// Setup scripts/targets middleware.
	server.use('/scripts', browserify(__dirname + '/../src/scripts'));
	server.use('/targets', browserify(__dirname + '/../src/targets'));

	// Setup static asset middleware.
	server.use(express.static(path.join(__dirname, '/../src')));

	// Setup error handling middleware.
	server.use(errorhandler());

	// Add the server locals.
	server.locals.options = runtime;

	// Handle layout requests.
	server.get('/layouts/*', function(req, res, next) {
		var layout = req.url.replace(/^\/layouts\//, '').replace(/\.html$/, '');
		res.render(layout, { pretty: true });
	});

	// Handle all other requests.
	server.get('*', function(req, res, next) {

		// If the request URL includes an extension, it is a resource that was not found via the static middleware.
		if (req.url.match(/\.[a-z0-9]+$/i)) {
			res.status(404).send('The requested resource was not found: ' + req.url);
		}
		// If the request URL starts with "/api", it is a service that has not been implemented.
		else if (req.url.match(/^\/api\//)) {
			res.status(400).send({
				message: "Not Implemented"
			});
		}
		// If the request did not include an extension, it is most likely trying to request page state so return the index page.
		else {
			res.render('index', { pretty: true });
		}
	});
};

// Start the server.
exports.listen = function() {

	// Make sure the server is initialized.
	if (!server) {
		throw new Error('The server has not been initialized.');
	}

	// Start the server.
	server.listen(exports.options.port, function() {
		console.info('Server listening on port %d', exports.options.port);
	});
};