angular.module('davinc')
  .controller('HomeCtrl', [

    '$scope', '$rootScope', '$routeParams', '$timeout',
    '$http', '$location', 'Will',

    function($scope, $rootScope, $routeParams, $timeout,
      $http, $location, Will) {

      Module.addPostScript(function() {
        Will.init(1600, 600);
      });

      window.prerenderReady = true;
    }
  ]);
