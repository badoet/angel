angular.module('davinc')
  .controller('HomeCtrl', [

    '$scope', '$rootScope', '$routeParams', '$timeout',
    '$http', '$location', 'Will',

    function($scope, $rootScope, $routeParams, $timeout,
      $http, $location, Will) {

      Module.addPostScript(function() {
        Will.init(1600, 600);
      });

      $scope.clear = function() {
        Will.clear();
      };

      window.prerenderReady = true;
    }
  ]);
