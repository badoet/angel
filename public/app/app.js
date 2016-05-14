angular.module("davinc", [
    "ngRoute",
    "ngSanitize",
    'ngAnimate',
    'ngAria',
    'ngMessages',
    "lumx",
  ])

  .config([
    '$routeProvider', '$locationProvider', '$compileProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $compileProvider, $httpProvider) {

      $locationProvider.html5Mode(true);
      $locationProvider.hashPrefix('!');

      $compileProvider.debugInfoEnabled(false);
      $httpProvider.useApplyAsync(true);
      $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      $httpProvider.defaults.headers.post['Content-Type'] = 'application/json';
      $httpProvider.defaults.headers.put['Content-Type'] = 'application/json';

      $routeProvider.
      when('/', {
        templateUrl: '/template/home.html',
        controller: "HomeCtrl",
      }).
      otherwise({
        redirectTo: '/'
      });
    }
  ])

  .run([
    "$rootScope", "$q", "$http", '$location', '$window',
    function($rootScope, $q, $http, $location, $window) {

      FastClick.attach(document.body);

      $rootScope.modalState = {
        loadingText: "",
      };

      $rootScope.currentNav = '/';
      $rootScope.$on('$routeChangeStart', function(e, next, curr) {
        if (next.$$route && next.$$route.resolve) {
          // Show a loading message until promises are not resolved
          $rootScope.state.loadingView = true;
        }
      });
      $rootScope.$on("$routeChangeSuccess", function(e, curr, prev) {
        $rootScope.currentNav = $location.path();
        $window.scrollTo(0, 0); // bring scroll back to the top of the page
      });

      $rootScope.state = {
        init: true,
        loadingView: true,
        processing: false,
        browserWidth: 0,
      };
    }
  ]);
