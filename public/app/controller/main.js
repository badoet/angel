angular.module('davinc')
  .controller('MainCtrl', [

    '$scope', '$rootScope', '$timeout',
    '$http', '$location', 'Will',

    function($scope, $rootScope, $timeout,
      $http, $location, Will) {

      Module.addPostScript(function() {
        Will.init(1600, 600);
      });

      $scope.clear = function() {
        Will.clear();
      };

      $scope.useBrush = function() {
        Will.useBrush();
      };

      $scope.useEraser = function() {
        Will.useEraser();
      };

      window.prerenderReady = true;
    }
  ]);
