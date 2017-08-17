angular.module('mean', ['ngCookies', 'ngResource', 'ui.bootstrap', 'ui.route', 'mean.system', 'mean.directives'])
  .config(['$routeProvider',
    ($routeProvider) => {
      $routeProvider
          .when('/', {
            templateUrl: 'views/index.html'
          })
          .when('/app', {
            templateUrl: '/views/app.html',
          })
          .when('/privacy', {
            templateUrl: '/views/privacy.html',
          })
          .when('/bottom', {
            templateUrl: '/views/bottom.html'
          })
          .when('/signin', {
            templateUrl: '/views/signin.html'
          })
          .when('/signup', {
            templateUrl: '/views/signup.html'
          })
          .when('/choose-avatar', {
            templateUrl: '/views/choose-avatar.html'
          })
<<<<<<< HEAD
          .when('/dashboard', {
            templateUrl: '/views/dashboard.html'
          })
=======
>>>>>>> ab2210e73908e268c1e287e3d36941daca9317e2
          .when('/gametour', {
            templateUrl: '/views/onboard.html'
          })
          .otherwise({
            redirectTo: '/'
          });
    }
  ]).config(['$locationProvider',
    ($locationProvider) => {
      $locationProvider.hashPrefix('!');
    }
  ]).run(['$rootScope', ($rootScope) => {
    // const self = this;
    $rootScope.safeApply = (fn) => {
      const phase = $rootScope.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (fn && (typeof (fn) === 'function')) {
          fn();
        }
      } else {
        $rootScope.$apply(fn);
      }
    };
  }])
  .run(['DonationService', (DonationService) => {
    window.userDonationCb = (donationObject) => {
      DonationService.userDonated(donationObject);
    };
  }]);

angular.module('mean.system', []);
angular.module('mean.directives', []);
