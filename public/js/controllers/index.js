angular.module('mean.system')
.controller('IndexController', ['$scope', '$http', '$timeout', 'Global', '$location', 'socket', 'game', 'AvatarService', ($scope, $http, $timeout, Global, $location, socket, game, AvatarService) => {
  $scope.global = Global;

  $scope.playAsGuest = () => {
    game.joinGame();
    $location.path('/app');
  };

  $scope.showError = () => {
    if ($location.search().error) {
      return $location.search().error;
    } else {
      return false;
    }
  };

  $scope.avatars = [];
  AvatarService.getAvatars()
    .then((data) => {
      $scope.avatars = data;
    });

  $scope.setAvatar = (x) => {
    $scope.avat = x;
  };

  $scope.submitform = () => {
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
                .then((response) => {
                  $scope.alert = `${response.data.message} You will be redirected after few minutes`;
                  window.localStorage.setItem('jwt', response.data.jwt);
                  $timeout(() => {
                    $location.path('/#!/');
                    location.reload();
                  }, 3000);
                }, (response) => {
                  $scope.alert = response.data.message;
                });
  };

  $scope.signIn = () => {
    const useremail = $scope.email;
    const userpassword = $scope.password;
    const data = {
      email: useremail,
      password: userpassword
    };
    // console.log(data);
    $http.post('/api/auth/signin', data)
    .then((response) => {
      console.log(data);
      if (response.data.message === 'successful login') {
        window.localStorage.setItem('jwt', response.data.token);
        $location.path('/#!/');
        $window.location.reload();
      } else {
        alert('Wrong email or user already exist');
      }
    })
  };

  $scope.logOut = () => {
    window.localStorage.removeItem('jwt');
    $http.get('/signout')
    .then((response) => {
      $scope.alert = response.data.message;
      if (response.data.message === 'Logged Out'){
        $location.path('/#!/');
        location.reload();
      }
    });
  };

  $scope.playGame = () => {
    $http({
      method: 'GET',
      url: '/app'
    }).then((response) => {
      $scope.myWelcome = response.data;
    }, (response) => {
      $scope.myWelcome = response.statusText;
    });
  };

  $scope.playGameCustom = () => {
    const token = window.localStorage.getItem('jwt');
    const config = { headers: {
      Authorization: `token ${token}`,
      Accept: 'application/json;odata=verbose'
    }
    };
    $http.get('/play?custom', config)
    .then((response) => {
      window.location = '/#!/app?custom';
    }, (response) => {
    });
  };
}]);
