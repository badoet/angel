angular.module("davinc")
  .factory('Modal', [
    'LxDialogService', '$q', '$rootScope',
    function(LxDialogService, $q, $rootScope) {

      var Modal = function(id) {

        var self = this;
        this.defer = null;

        this.info = {
          modalTitle: "form",
          modalYes: "Ok",
          modalNo: "Close",
        };

        this.open = function() {
          LxDialogService.open(id);
          $rootScope.state.openedModal[id] = true;
          self.defer = $q.defer();
          return self.defer.promise;
        };

        this.close = function() {
          self.defer.reject();
          closeDialog();
        };

        this.result = function(data) {
          self.defer.resolve(data);
          closeDialog();
        };

        function closeDialog() {
          LxDialogService.close(id);
          delete $rootScope.state.openedModal[id];
          if (Object.keys($rootScope.state.openedModal).length === 0) {
            $( ".dialog-filter" ).remove();
          }
        }

      };

      return Modal;

    }
  ]);
