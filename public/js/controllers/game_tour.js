angular.module('tour', []).controller('GameTourController', GameTourController);

function GameTourController($location) {

  const gameTour = introJs();
  gameTour.setOptions({
    steps: [{
      intro: 'Welcome to the game Cards for Humanity, You want to play this game?, then let me take you on a tour.'
    },
    {
      element: '#logo',
      intro: 'This is Cards for humanity official logo'
    },
    {
      element: '#question-container-outer',
      intro: 'Game needs a minimum of 3 players to start. Wait for the minimum number of players and start the game.',
    },
    {
      element: '#timer-container',
      intro: 'Choose an answer to the current question. After time out, CZAR then select a favorite answer. whoever submitted CZAR\'s favorite answer wins the round.'
    },
    {
      element: '#abandon-game-button',
      intro: 'Played enough? Click this button to quit the game'
    },
    {
      element: '#tweet-container',
      intro: 'Share game experience with friends on twitter'
    },
    {
      element: '#answers-container',
      intro: 'These are the rules of the game',
    }
    ]
  });
  gameTour.start()
         .onexit(() => {
           $location.path('/');
         });
}
