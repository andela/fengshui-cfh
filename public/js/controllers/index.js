angular.module('mean.system')
.controller('IndexController', ['$scope', '$http', '$timeout', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, $http, $timeout, Global, $location, socket, game, AvatarService) {
  $scope.global = Global;

  $scope.playAsGuest = function() {
    game.joinGame();
    $location.path('/app');
  };

  $scope.showError = function() {
    if ($location.search().error) {
      return $location.search().error;
    } else {
      return false;
    }
  };

  $scope.avatars = [];
  AvatarService.getAvatars()
    .then(function(data) {
      $scope.avatars = data;
    });

  $scope.setAvatar = function(x){
    $scope.avat = x;
  };

  $scope.submitform = function(){
    const username = $scope.name;
    const useremail = $scope.email;
    const userpassword = $scope.password;
    const userselectedAvatar = $scope.avat;
    const url = '/api/auth/users';
    const data = {
      name: username,
      email: useremail,
      password: userpassword,
      avatar: userselectedAvatar
    };
    $http.post(url, data)
                .then(function mySuccess(response) {
                  $scope.alert = response.data.message + ' You will be redirected after few minutes';
                  window.localStorage.setItem('jwt', response.data.jwt);
                  $timeout(function () {
                    $location.path('/#!/');
                    location.reload();
                  }, 3000);
                }, function myError(response) {
                  $scope.alert = response.data.message;
                });
  };

  $scope.logOut = function(){
    window.localStorage.removeItem('jwt');
    $http.get('/signout')
    .then(function(response) {
      $scope.alert = response.data.message;
      if (response.data.message === 'Logged Out'){
        $location.path('/#!/');
        location.reload();
      }
    });
  };

  $scope.playGame = function(){
    console.log(window.localStorage.getItem('jwt'));
    $http({
      method: 'GET',
      url: '/app'
    }).then(function mySuccess(response) {
      $scope.myWelcome = response.data;
    }, function myError(response) {
      $scope.myWelcome = response.statusText;
    });
  };

  $scope.playGameCustom = function(){
    const token = window.localStorage.getItem('jwt');
    const config = { headers: {
      Authorization: `token ${token}`,
      Accept: 'application/json;odata=verbose'
    }
  }
    $http.get('/play?custom', config)
    .then(function mySuccess(response) {
      window.location = '/#!/app?custom';
    }, function myError(response) {
    });
  };
}]);
