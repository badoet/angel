module.exports = function(grunt) {

  // Grunt configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['.tmp', 'public/js/**.min.js', 'public/js/lib/**.min.js'],

    preprocess: {
      options: {
        inline: true,
        context: {
          DEBUG: false
        }
      },
      html: {
        src: [
          'template/indexdist.html',
        ]
      },
      js: {
        src: 'public/app/app.js'
      }
    },

    html2js: {
      options: {
        base: "",
        rename: function(moduleName) {
          return "/" + moduleName;
        },
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        }
      },
      ikou: {
        src: [
          // 'template/home.html',
        ],
        dest: 'public/app/template.js'
      },
    },

    // copy templates to dist folder for usemin to update
    copy: {
      templates: {
        files: [
          {
            src: 'template/index.html',
            dest: 'template/indexdist.html',
          }
        ]
      },
    },

    useminPrepare: {
      html: 'template/**dist.html',
      options: {
        dest: 'public',
        root: 'public',
      }
    },

    usemin: {
      html: 'template/**dist.html',
      options: {
        root: "public",
        assetsDirs: ['public'],
        blockReplacements: {
          js: function (block){
            return '<script async src="' + block.dest + '"><\/script>';
          }
        }
      }
    },

    sass: {
      options: {
        sourceMap: false,
        includePaths: [
          'bower_components/bourbon/app/assets/stylesheets/',
          'bower_components/mdi/scss/'
        ],
        outputStyle: 'compressed'
      },
      dist: {
        files: {
          'public/css/davinc.css': 'scss/davinc.scss'
        }
      }
    },

    rev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 8
      },
      assets: {
        files: [{
          src: [
            // 'public/css/lib.css',
            // 'public/css/ikou.css',
            // 'public/css/ikouadmin.css',
            // 'public/js/lib/lib.min.js',
            // 'public/js/lib/lib.admin.min.js',
            // 'public/js/app.min.js',
            // 'public/js/admin.app.min.js',
          ]
        }]
      }
    },

    watch: {
      sass: {
        files: ['scss/**/*.{scss,sass}', 'scss/*.scss'],
        tasks: ['sass:dist', ],
      },
      js: {
        files: ['public/app/*.js', 'public/app/**/*js'],
        tasks: ['jshint', ],
      },
    },

    shell: {
      gofmt: {
        command: 'gofmt -w *.go',
        options: {
          stdout: true
        }
      },
      gobuild: {
        command: 'go build -o main main.go',
        options: {
          stdout: true
        }
      },
    },

    concat: {
      options: {
        separator: '\n',
      },
      libjs: {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/velocity/velocity.min.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-animate/angular-animate.min.js',
          'bower_components/angular-aria/angular-aria.min.js',
          'bower_components/angular-cookies/angular-cookies.min.js',
          'bower_components/angular-sanitize/angular-sanitize.min.js',
          'bower_components/angular-messages/angular-messages.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/lumx/dist/lumx.min.js',
          'bower_components/fastclick/lib/fastclick.js',
        ],
        dest: 'public/js/lib/lib.min.js',
      },
      js: {
        src: [
          'public/app/template.js',
          'public/js/app.min.js',
          'public/app/constant/config-production.js',
          'public/app/include_template.js',
        ],
        dest: 'public/js/app.min.js',
      },
    },

    cssmin: {
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      target: {
        files: {
          'davinc.css': ['davinc.css']
        }
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'public/app/*.js', 'public/app/**/*js']
    },

    uglify: {
      generated: {
        options: {
          screwIE8: true,
          preserveComments: false,
        }
      }
    }

  });

  // Load Grunt tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-usemin');

  // Run "grunt build" to concat+minify+revision CSS/JS files, update usemin
  // blocks in templates
  grunt.registerTask('build', [
    'jshint',
    'sass',
    'shell:gofmt',
    'clean',
    'shell:gobuild',
    'copy:templates', // copy templates
    'preprocess:js', // Remove DEBUG code from production builds
    'preprocess:html', // Remove DEBUG code from production builds
    'useminPrepare', // prepare an object of files that will be passed to concat and/or uglify
    // 'html2js:davinc',
    'concat:libjs',
    'concat:generated',
    'cssmin',
    'uglify:generated',
    'concat:js',
    'rev',
    'usemin', // replace usemin blocks with actual filepaths
  ]);


  // Run "grunt" to start the go server and watch scss files for recompilation
  grunt.registerTask('default', [
    'jshint',
    'sass',
    'concat:libjs',
    'watch',
  ]);



};
