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
	 * Use lib.legacy.js, lib.modern.js, and app.js in src/scripts to generate the corresponding build files.
	 */
	var scriptFiles = {
		'build/scripts/lib.legacy.js': 'src/scripts/lib.legacy.js',
		'build/scripts/lib.modern.js': 'src/scripts/lib.modern.js',
		'build/scripts/app.js': 'src/scripts/app.js'
	};

	/*
	 * Use src/styles/application.less to generate build/styles/application.css
	 */
	var styleFiles = {
		'build/styles/application.css': 'src/styles/application.less'
	};

	// Get the path to the app config.
	var appConfigPath = path.join(__dirname, 'etc/app.js');
	var appConfig = {};

	// Check if a app config file exists.
	if (fs.existsSync(appConfigPath)) {

		// Load the app config settings and merge with defaults.
		lodash.extend(appConfig, require(appConfigPath));
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
						app: appConfig,
						debug: true
					}
				},
				files: [ layoutFiles ]
			},
			release: {
				options: {
					data: {
						app: appConfig,
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
					'build/scripts/lib.legacy.js': 'build/scripts/lib.legacy.js',
					'build/scripts/lib.modern.js': 'build/scripts/lib.modern.js',
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
				src: 'src/scripts/respond.min.js',
				dest: 'build/scripts/respond.min.js'
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

	// Register a task to create a debug build.
	grunt.registerTask('debug', ['clean', 'jade:debug', 'less:debug', 'browserify:debug', 'copy', 'rename']);
	grunt.registerTask('release', ['clean', 'jade:release', 'less:release', 'browserify:release', 'uglify', 'copy', 'rename']);

	// Register a default task as an alias to debug.
	grunt.registerTask('default', ['debug']);
};
