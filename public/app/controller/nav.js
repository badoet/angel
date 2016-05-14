angular.module('davinc')
  .controller('NavCtrl', [

    '$scope', '$rootScope', '$timeout',

    function($scope, $rootScope, $timeout) {

      $scope.openNav = function() {
        $rootScope.state.modalMenu.open();
      };

    }
  ]);
