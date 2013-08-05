// Load external dependencies.
var fs = require('fs');
var lodash = require('lodash');
var path = require('path');

module.exports = function(grunt) {

	/*
	 * Search the src/layouts/ directory for files that have a .jade extension and put them in the
	 * build directory with an .html extension.
	 */
	var layoutFiles = {
		// Enable dynamic expansion.
		expand: true,
		// Src matches are relative to this path.
		cwd: 'src/layouts/',
		// Actual pattern(s) to match.
		src: ['**/*.jade'],
		// Destination path prefix.
		dest: 'build/layouts/',
		// Dest filepaths will have this extension.
		ext: '.html'
	};

	/*
	 * Use targets/legacy.js, targets/modern.js, and app.js in src/scripts to generate the corresponding build files.
	 */
	var scriptFiles = {
		'build/targets/legacy.js': 'src/targets/legacy.js',
		'build/targets/modern.js': 'src/targets/modern.js',
		'build/scripts/app.js': 'src/scripts/app.js'
	};

	/*
	 * Use src/styles/application.less to generate build/styles/application.css
	 */
	var styleFiles = {
		'build/styles/application.css': 'src/styles/application.less'
	};

	// Initialize the runtime options.
	var options = {
		app: {},
		path: {}
	};

	// Check if a app dist config file exists.
	if (fs.existsSync(path.join(__dirname, 'etc/app.dist.js'))) {

		// Load the app dist config settings and merge with defaults.
		lodash.extend(options.app, require(path.join(__dirname, 'etc/app.dist.js')));
	}

	// Check if a app config file exists.
	if (fs.existsSync(path.join(__dirname, 'etc/app.js'))) {

		// Load the app config settings and merge with defaults.
		lodash.extend(options.app, require(path.join(__dirname, 'etc/app.js')));
	}

	// Check if a path dist config file exists.
	if (fs.existsSync(path.join(__dirname, 'etc/path.dist.js'))) {

		// Load the path dist config settings and merge with defaults.
		lodash.extend(options.path, require(path.join(__dirname, 'etc/path.dist.js')));
	}

	// Check if a path config file exists.
	if (fs.existsSync(path.join(__dirname, 'etc/path.js'))) {

		// Load the path config settings and merge with defaults.
		lodash.extend(options.path, require(path.join(__dirname, 'etc/path.js')));
	}

	// Project configuration.
	grunt.initConfig({

		// Load the package configuration.
		pkg: grunt.file.readJSON('package.json'),

		// Setup the Clean tasks.
		clean: {
			build: {
				src: 'build/*',
				dot: false
			}
		},

		// Setup the Jade tasks.
		jade: {
			debug: {
				options: {
					pretty: true,
					data: {
						options: options,
						debug: true
					}
				},
				files: [ layoutFiles ]
			},
			release: {
				options: {
					data: {
						options: options,
						debug: false
					}
				},
				files: [ layoutFiles ]
			}
		},

		// Setup the Browserify tasks.
		browserify: {
			debug: {
				files: [ scriptFiles ],
				options: {
					debug: true
				}
			},
			release: {
				files: [ scriptFiles ],
				options: {
					debug: false
				}
			}
		},

		// Setup the Uglify tasks.
		uglify: {
			options: {
				mangle: {
					except: ['angular']
				}
			},
			release: {
				files: {
					'build/targets/legacy.js': 'build/targets/legacy.js',
					'build/targets/modern.js': 'build/targets/modern.js',
					'build/scripts/app.js': 'build/scripts/app.js'
				}
			}
		},

		// Setup the LESS tasks.
		less: {
			debug: {
				files: [ styleFiles ]
			},
			release: {
				options: {
					yuicompress: true,
					report: 'min'
				},
				files: [ styleFiles ]
			}
		},

		// Setup the Copy tasks.
		copy: {
			// Copy fonts from the source directory to the build directory.
			fonts: {
				expand: true,
				cwd: 'src/fonts/',
				src: ['**'],
				dest: 'build/fonts/'
			},
			// Copy icons from the source directory to the build directory.
			icons: {
				expand: true,
				cwd: 'src/icons/',
				src: ['**'],
				dest: 'build/icons/'
			},
			// Copy images from the source directory to the build directory.
			images: {
				expand: true,
				cwd: 'src/images/',
				src: ['**'],
				dest: 'build/images/'
			},
			// Copy Respond.js from the source directory to the build directory.
			respond: {
				src: 'src/targets/legacy/respond.min.js',
				dest: 'build/targets/legacy/respond.min.js'
			}
		},

		// Setup the Rename/Move tasks.
		rename: {
			// Move build/layouts/index.html to build/index.html
			'layouts/index': {
				src: 'build/layouts/index.html',
				dest: 'build/index.html'
			}
		},

		// Setup the Connect task.
		connect: {
			server: {
				options: {
					keepalive: true,
					port: 3001,
					hostname: '*',
					base: 'build'
				}
			}
		}
	});

	// Load the grunt plugins.
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-rename');

	// Register tasks for the debug and release builds.
	grunt.registerTask('debug', ['clean', 'jade:debug', 'less:debug', 'browserify:debug', 'copy', 'rename']);
	grunt.registerTask('release', ['clean', 'jade:release', 'less:release', 'browserify:release', 'uglify', 'copy', 'rename']);

	// Register a default task as an alias to debug.
	grunt.registerTask('default', ['debug']);
};
