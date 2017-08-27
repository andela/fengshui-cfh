 /* eslint-disable no-alert, no-console */
angular.module('mean.system')
.controller('IndexController', ['$scope', '$http', '$timeout', 'Global', '$location', '$window', 'socket', 'game', 'AvatarService', ($scope, $http, $timeout, Global, $location, $window, socket, game, AvatarService) => {
  $scope.global = Global;

  $scope.playAsGuest = () => {
    game.joinGame();
    $location.path('/app');
  };

  $scope.playWithStrangers = () => {
    if ($scope.region === undefined) {
      alert('Please Select your Region');
      return;
    }
    $scope.data = { playerRegion: $scope.region };
    $http.post('/setregion', $scope.data)
    .success((data) => {
      console.log(data);
    });
    const myModal = $('#select-region');
    myModal.modal('hide');
    $window.location.href = '/play';
  };

  $scope.playWithFriends = () => {
    if ($scope.region === undefined) {
      alert('Please Select your Region');
      return;
    }
    $scope.data = { playerRegion: $scope.region };
    $http.post('/setregion', $scope.data)
      .success((data) => {
        console.log(data);
      });
    const myModal = $('#select-region');
    myModal.modal('hide');
    $window.location.href = '/play';
  };

  $scope.showError = () => {
    if ($location.search().error) {
      return $location.search().error;
    }
    return false;
  };
  $scope.showRegion = () => {
    const myModal = $('#select-region');
    myModal.modal('show');
  };
  $scope.showRegionGuest = () => {
    const myModal = $('#select-region-guest');
    myModal.modal('show');
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
        location.reload();
        $location.path('/gametour');
      }, 3000);
    }, (response) => {
      $scope.alert = response.data.message;
    });
  };

  $scope.signIn = () => {
    $http.post('api/auth/signin', $scope.formData)
    .then((response) => {
      if (response.data.message === 'successful login') {
        window.localStorage.setItem('jwt', response.data.token);
        $location.path('/#!/');
        location.reload();
      }
    }, (response) => {
      $scope.alert = response.data.message;
    });
  };

  $scope.logOut = () => {
    window.localStorage.removeItem('jwt');
    $http.get('/signout')
    .then((response) => {
      $scope.alert = response.data.message;
      if (response.data.message === 'Logged Out') {
        $location.path('/#!/');
        location.reload();
      }
    });
  };

  $scope.playGame = () => {
    swal({
      title: 'Start a new game session',
      text: 'Are you sure you want to start?',
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Go back',
      confirmButtonText: 'Start Game'
    }).then(() => {
      $http({
        method: 'GET',
        url: '/play'
      }).then(() => {
        $location.path('/app');
      });
    });
  };

  $scope.playGameCustom = () => {
    const token = window.localStorage.getItem('jwt');
    const config = { headers: {
      Authorization: `token ${token}`,
      Accept: 'application/json;odata=verbose'
    }
    };
    swal({
      title: 'Start a new game session',
      text: 'Are you sure you want start?',
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Go back',
      confirmButtonText: 'Start Game'
    }).then(() => {
      $http.get('/play?custom', config)
      .then(() => {
        window.location = '/#!/app?custom';
      }, () => {
      });
    });
  };
}]);
