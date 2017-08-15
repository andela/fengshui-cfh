angular.module('mean.system')
.factory('socket', ['$rootScope', ($rootScope) => {
  const socket = io.connect();
  return {
    on: (eventName, callback) => {
      socket.on(eventName, (...args) => {
        $rootScope.safeApply(() => {
          callback.apply(socket, args);
        });
      });
    },
    emit: (eventName, data, callback) => {
      socket.emit(eventName, data, () => {
      });
      $rootScope.safeApply((...args) => {
        if (callback) {
          callback.apply(socket, args);
        }
      });
    },
    removeAllListeners: (eventName, callback) => {
      socket.removeAllListeners(eventName, (...args) => {
        $rootScope.safeApply(() => {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);
