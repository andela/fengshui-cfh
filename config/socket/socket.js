import mongoose from 'mongoose';
import firebase from 'firebase';
import Game from './game';
import Player from './player';
import config from '../firebaseconfig';
import avatar from '../../app/controllers/avatars';

const User = mongoose.model('User');
firebase.initializeApp(config);

const avatars = avatar.all();
// Valid characters to use to generate random private game IDs
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

module.exports = (io) => {
  const allGames = {};
  const allPlayers = {};
  const gamesNeedingPlayers = [];
  let gameID = 0;

  const fireGame = (player, socket) => {
    let game;
    if (gamesNeedingPlayers.length <= 0) {
      // change id from 1 to timestamp
      gameID += new Date().getTime();
      const gameIDStr = gameID.toString();
      game = new Game(gameIDStr, io);
      allPlayers[socket.id] = true;
      game.players.push(player);
      allGames[gameID] = game;
      gamesNeedingPlayers.push(game);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
    } else {
      // players are upto minimum numbers
      game = gamesNeedingPlayers[0];
      allPlayers[socket.id] = true;
      game.players.push(player);
      socket.join(game.gameID);
      socket.gameID = game.gameID;
      game.assignPlayerColors();
      game.assignGuestNames();
      game.sendUpdate();
      game.sendNotification(`${player.username} has joined the game!`);
      if (game.players.length >= game.playerMaxLimit) {
        gamesNeedingPlayers.shift();
        game.prepareGame();
      }
    }
  };
  const createGameWithFriends = (player, socket) => {
    let isUniqueRoom = false;
    let uniqueRoom = '';
    // Generate a random 6-character game ID
    while (!isUniqueRoom) {
      uniqueRoom = '';
      for (let i = 0; i < 6; i += 1) {
        uniqueRoom += chars[Math.floor(Math.random() * chars.length)];
      }
      if (!allGames[uniqueRoom] && !(/^\d+$/).test(uniqueRoom)) {
        isUniqueRoom = true;
      }
    }
    const game = new Game(uniqueRoom, io);
    allPlayers[socket.id] = true;
    game.players.push(player);
    allGames[uniqueRoom] = game;
    socket.join(game.gameID);
    socket.gameID = game.gameID;
    game.assignPlayerColors();
    game.assignGuestNames();
    game.sendUpdate();
  };
  const getGame = (player, socket, requestedGameId, createPrivate) => {
    requestedGameId = requestedGameId || '';
    createPrivate = createPrivate || false;
    if (requestedGameId.length && allGames[requestedGameId]) {
      const game = allGames[requestedGameId];
      // Ensure that the same socket doesn't try to join the same game
      // This can happen because we rewrite the browser's URL to reflect
      // the new game ID, causing the view to reload.
      // Also checking the number of players, so node doesn't crash when
      // no one is in this custom room.
      if (game.state === 'awaiting players' && (!game.players.length ||
        game.players[0].socket.id !== socket.id)) {
        // Put player into the requested game
        allPlayers[socket.id] = true;
        game.players.push(player);
        socket.join(game.gameID);
        socket.gameID = game.gameID;
        game.assignPlayerColors();
        game.assignGuestNames();
        game.sendUpdate();
        game.sendNotification(`${player.username} has joined the game!`);
        if (game.players.length >= game.playerMaxLimit) {
          gamesNeedingPlayers.shift();
          game.prepareGame();
        }
      } else {
        // TODO: Send an error message back to this user saying the game has already started
        const message = 'The game has already started';
        socket.emit('beforeStart', message);
      }
    } else if (createPrivate) {
      createGameWithFriends(player, socket);
    } else {
      fireGame(player, socket);
    }
  };
  const exitGame = (socket) => {
    if (allGames[socket.gameID]) { // Make sure game exists
      const game = allGames[socket.gameID];
      delete allPlayers[socket.id];
      if (game.state === 'awaiting players' ||
        game.players.length - 1 >= game.playerMinLimit) {
        game.removePlayer(socket.id);
      } else {
        game.stateDissolveGame();
        for (let j = 0; j < game.players.length; j += 1) {
          game.players[j].socket.leave(socket.gameID);
        }
        game.killGame();
        delete allGames[socket.gameID];
      }
    }
    socket.leave(socket.gameID);
  };

  const joinGame = (socket, data) => {
    const player = new Player(socket);
    data = data || {};
    player.userID = data.userID || 'unauthenticated';
    if (data.userID !== 'unauthenticated') {
      User.findOne({
        _id: data.userID
      }).exec((err, user) => {
        if (err) {
          return err; // Hopefully this never happens.
        }
        if (!user) {
          // If the user's ID isn't found (rare)
          player.username = 'Guest';
          player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
        } else {
          player.username = user.name;
          player.premium = user.premium || 0;
          player.avatar = user.avatar || avatars[Math.floor(Math.random() * 4) + 12];
        }
        getGame(player, socket, data.room, data.createPrivate);
      });
    } else {
      // If the user isn't authenticated (guest)
      player.username = 'Guest';
      player.avatar = avatars[Math.floor(Math.random() * 4) + 12];
      getGame(player, socket, data.room, data.createPrivate);
    }
  };
  io.sockets.on('connection', (socket) => {
    socket.emit('id', { id: socket.id });

    socket.on('pickCards', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickCards(data.cards, socket.id);
      }
    });

    socket.on('pickWinning', (data) => {
      if (allGames[socket.gameID]) {
        allGames[socket.gameID].pickWinning(data.card, socket.id);
      }
    });
    socket.on('joinGame', (data) => {
      if (!allPlayers[socket.id]) {
        joinGame(socket, data);
      }
    });

    socket.on('joinNewGame', (data) => {
      exitGame(socket);
      joinGame(socket, data);
    });

    socket.on('startGame', () => {
      const thisGame = allGames[socket.gameID];
      if (allGames[socket.gameID]) {
        if (thisGame.players.length >= thisGame.playerMinLimit) {
          // Remove this game from gamesNeedingPlayers so new players can't join it.
          gamesNeedingPlayers.forEach((game, index) => {
            if (game.gameID === socket.gameID) {
              return gamesNeedingPlayers.splice(index, 1);
            }
          });
          thisGame.prepareGame();
          thisGame.sendNotification('The game has begun!');
        } else {
          const message = 'You need a minimum of 3 player to start game';
          socket.emit('beforeStart', message);
        }
      }
    });

    socket.on('leaveGame', () => {
      exitGame(socket);
    });
    socket.on('disconnect', () => {
      exitGame(socket);
    });

    socket.on('send chat', (data) => {
    //  var game = new Game();
      const thisGame = allGames[socket.gameID];
      // pass game id to identify each game
      firebase.database().ref(`chat/${data.gameID}/`).push().set(data);
      // thisGame.sendChat(data);
      const ref = firebase.database().ref(`chat/${data.gameID}/`).orderByKey();
      ref.on('value', (snapshot) => {
        thisGame.sendChat(snapshot);
      }, (errorObject) => {
        throw new Error(errorObject);
      });
    });
  });
};
