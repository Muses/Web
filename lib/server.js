
// Load external dependencies.
var express = require('express');
var less = require('less-middleware');
var path = require('path');

// Server variables.
var server;

// Expose the options.
exports.options = {
	port: 8000
};

// Initialize the server.
exports.initialize = function() {

	// Instantiate the express server.
	server = express();

	// Setup basic middleware.
	server.use(express.logger('dev'));
	server.use(express.bodyParser());

	// Setup asset pipeline.
	server.set('views', __dirname + '/../src/layouts');
	server.set('view engine', 'jade');
	server.use(less({
		src: __dirname + '/../src',
		dest: __dirname + '/../build'
	}));
	server.use(express.static(__dirname + '/../src'));
	server.use(express.static(__dirname + '/../build'));

	// Setup error handling middleware.
	server.use(express.errorHandler());

	// Add the server locals.
	server.locals({
		app: require(path.join(__dirname, '../etc/app.js'))
	});

	// Setup server router.	
	server.use(server.router);

	// Handle layout requests.
	server.get('/layouts/*', function(req, res, next) {
		var layout = req.url.replace(/^\/layouts\//, '').replace(/\.html$/, '');
		res.render(layout, { pretty: true });
	});

	// Handle all other requests.
	server.get('*', function(req, res, next) {

		// If the request URL includes an extension, it is a resource that was not found via the static middleware.
		if (req.url.match(/\.[a-z0-9]+$/i)) {
			res.send(404, 'The requested resource was not found: ' + req.url);
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