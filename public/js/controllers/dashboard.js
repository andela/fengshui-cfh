angular.module('mean.system')
.controller('DashboardController', ['$scope', '$http', ($scope, $http) => {
  const token = window.localStorage.getItem('jwt');
  const config = { headers: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json;odata=verbose'
  } };

  $scope.leaderboardShow = false;
  $scope.gameHistoryShow = false;
  $scope.donationsShow = false;

  $scope.showLeaderboard = () => {
    $http.get('/api/leaderboard', config)
      .then((response) => {
        $scope.leaderboard = response.data.leaderBoard;
        if (response) {
          $scope.leaderboardShow = true;
          $scope.gameHistoryShow = false;
          $scope.donationsShow = false;
        }
      });
  };

  $scope.showGameHistory = () => {
    $http.get('/api/games/history', config)
      .then((response) => {
        $scope.gameHistory = response.data.history;
        if (response.data.history) {
          $scope.leaderboardShow = false;
          $scope.gameHistoryShow = true;
          $scope.donationsShow = false;
        }
      })
      .catch(() => {
        $scope.gameHistory = 'You have not played any game';
      });
  };

  $scope.showDonations = () => {
    $http.get('/api/donations', config)
      .then((response) => {
        $scope.donations = response.data.donations;
        if (response) {
          $scope.donationsShow = true;
          $scope.leaderboardShow = false;
          $scope.gameHistoryShow = false;
        }
      })
      .catch(() => {
        $scope.donations = '';
      });
  };
}]);
