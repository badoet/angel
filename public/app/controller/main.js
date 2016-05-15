angular.module('davinc')
  .controller('MainCtrl', [

    '$scope', '$rootScope', '$timeout',
    '$http', '$location', 'Will', 'FileUploader',

    function($scope, $rootScope, $timeout,
      $http, $location, Will, FileUploader) {

      var uploader = new FileUploader();

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

      $scope.load = function(e) {
        Will.load(e);
      };

      window.prerenderReady = true;
    }
  ]);
