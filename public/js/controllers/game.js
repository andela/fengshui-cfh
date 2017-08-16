angular.module('mean.system')
.controller('GameController', ['$scope', 'game', '$timeout', '$location', 'MakeAWishFactsService', 'socket', '$dialog','$http', '$anchorScroll', ($scope, game, $timeout, $location, MakeAWishFactsService, socket, $dialog, $anchorScroll, $http) => {
  $scope.hasPickedCards = false;
  $scope.winningCardPicked = false;
  $scope.showTable = false;
  $scope.modalShown = false;
  $scope.game = game;
  $scope.pickedCards = [];
  $scope.messagesList = '';
  $scope.chatControler = '^';
  $scope.charactersLeft = 100;
  $scope.showChatStatus = false;
  $scope.chatter = {};
  let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
  $scope.makeAWishFact = makeAWishFacts.pop();

  $scope.pickCard = (card) => {
    if (!$scope.hasPickedCards) {
      if ($scope.pickedCards.indexOf(card.id) < 0) {
        $scope.pickedCards.push(card.id);
        if (game.curQuestion.numAnswers === 1) {
          $scope.sendPickedCards();
          $scope.hasPickedCards = true;
        } else if (game.curQuestion.numAnswers === 2 &&
          $scope.pickedCards.length === 2) {
          $scope.hasPickedCards = true;
          $timeout($scope.sendPickedCards, 300);
        }
      } else {
        $scope.pickedCards.pop();
      }
    }
  };

  $scope.pointerCursorStyle = () => {
    if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
      return { cursor: 'pointer' };
    }
    return {};
  };

  $scope.sendPickedCards = () => {
    game.pickCards($scope.pickedCards);
    $scope.showTable = true;
  };

  $scope.cardIsFirstSelected = (card) => {
    if (game.curQuestion.numAnswers > 1) {
      return card === $scope.pickedCards[0];
    }
    return false;
  };

  $scope.cardIsSecondSelected = (card) => {
    if (game.curQuestion.numAnswers > 1) {
      return card === $scope.pickedCards[1];
    }
    return false;
  };

  $scope.firstAnswer = ($index) => {
    if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
      return true;
    }
    return false;
  };

  $scope.secondAnswer = ($index) => {
    if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
      return true;
    }
    return false;
  };

  $scope.showFirst = card => game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;


  $scope.showSecond = card => game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;


  $scope.isCzar = () => game.czar === game.playerIndex;

  $scope.isPlayer = $index => $index === game.playerIndex;


  $scope.isCustomGame = () => !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';


  $scope.isPremium = $index => game.players[$index].premium;

  $scope.currentCzar = $index => $index === game.czar;

  $scope.winningColor = ($index) => {
    if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
      return $scope.colors[game.players[game.winningCardPlayer].color];
    }
    return '#f9f9f9';
  };

  $scope.pickWinning = (winningSet) => {
    if ($scope.isCzar()) {
      game.pickWinning(winningSet.card[0]);
      $scope.winningCardPicked = true;
    }
  };

  $scope.winnerPicked = () => game.winningCard !== -1;

  $scope.startGame = () => {
    swal({
      title: 'Starting Game',
      text: 'Are you sure you want to start?',
      type: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Wait a little',
      confirmButtonText: 'Start Game Now'
    }).then(() => {
      game.startGame();
    });
  };

  $scope.abandonGame = () => {
    game.leaveGame();
    $location.path('/');
  };

    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
  $scope.$watch('game.round', () => {
    $scope.hasPickedCards = false;
    $scope.showTable = false;
    $scope.winningCardPicked = false;
    $scope.makeAWishFact = makeAWishFacts.pop();
    if (!makeAWishFacts.length) {
      makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    }
    $scope.pickedCards = [];
  });

    // In case player doesn't pick a card in time, show the table
  $scope.$watch('game.state', () => {
    if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
      $scope.showTable = true;
    }
    if ($scope.game.state === 'game dissolved' || $scope.game.state === 'game ended') {
      const gameData = { gameId: $scope.game.gameID,
        gameOwner: $scope.game.players[0].username,
        gameWinner: $scope.game.players[game.gameWinner].username,
        gamePlayers: $scope.game.players
      };

      $http.post(`/api/games/${game.gameID}/start`, gameData);
      window.location(`/api/games/${game.gameID}/start`, gameData);
    }
  });

  $scope.$watch('game.gameID', () => {
    if (game.gameID && game.state === 'awaiting players') {
      if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
        $location.search({});
      } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
        $location.search({ game: game.gameID });
        if (!$scope.modalShown) {
          setTimeout(() => {
            const link = document.URL;
            const txt = 'Give the following link to your friends so they can join your game: ';
            $('#lobby-how-to-play').text(txt);
            $('#oh-el').css({ 'text-align': 'center', 'font-size': '22px', background: 'white', color: 'black' }).text(link);
          }, 200);
          $scope.modalShown = true;
        }
      }
    }
  });
  $scope.changeFormOpenIcon = () => {
    if ($scope.chatControler === '^') {
      $scope.chatControler = 'v';
    } else {
      $scope.chatControler = '^';
    }
  };

  $scope.charactersRemaining = (event) => {
    const myMessage = (event).trim();
    const messageLength = myMessage.length;
    $scope.charactersLeft = 100 - messageLength;
  };

  $scope.submitWithEnter = (event) => {
    if (event.which === 13) {
      event.preventDefault();
      $scope.chat();
    }
  };

  $scope.chat = (event) => {
    const IndividualPlayer = $scope.game.players[$scope.game.playerIndex].username;
    const playerAvatar = $scope.game.players[$scope.game.playerIndex].avatar;
    const timeSent = new Date(Date.now()).toLocaleString();
    const time = (timeSent.split(','))[1];
    const gameID = $scope.game.gameID;
    if (event !== '' && event !== undefined) {
      const newMessage = {
        sender: IndividualPlayer,
        message: event,
        date: time,
        avater: playerAvatar,
        gameID
      };
      game.chat(newMessage);
      $scope.message = '';
      $scope.charactersLeft = 100;
    }
  };

  $scope.gotoBottom = () => {
    $location.hash('bottom');
    $anchorScroll();
  };

  $scope.showChat = () => {
    $scope.showChatStatus = !$scope.showChatStatus;
  };

  socket.on('reply chat', (data) => {
    const message = [];
    Object.keys(data.chat).forEach((key) => {
      message.push(data.chat[key]);
    });
    $scope.messagesList = message;
    $scope.gotoBottom();
  });

  if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
    game.joinGame('joinGame', $location.search().game);
  } else if ($location.search().custom) {
    game.joinGame('joinGame', null, true);
  } else {
    game.joinGame();
  }
}]);
