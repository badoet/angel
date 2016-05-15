angular.module('davinc')
  .controller('MainCtrl', [

    '$scope', '$rootScope', '$timeout',
    '$http', '$location', 'Will', 'FileUploader',

    function($scope, $rootScope, $timeout,
      $http, $location, Will, FileUploader) {

      var uploader = new FileUploader();

      Module.addPostScript(function() {
        Will.init(1600, 600);

        // var url = location.toString();
        // url = url.substring(0, url.lastIndexOf("/")) + "/will/ship.will";

        // var request = new XMLHttpRequest();

        // request.onreadystatechange = function() {
        //    if (this.readyState == this.DONE) {
        //     Will.restore(this.response);
        //   }
        // };

        // request.open("GET", url, true);
        // request.responseType = "arraybuffer";
        // request.send();
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

      $scope.loadWill = function(filename) {
        Will.loadWill(filename);
      };

      window.prerenderReady = true;
    }
  ]);
