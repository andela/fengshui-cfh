/**
 * Module dependencies.
 */
<<<<<<< HEAD
const mongoose = require('mongoose');
=======
import mongoose from 'mongoose';
>>>>>>> af1723de30d4ba21dea5081790404e924c2ca405

const Game = mongoose.model('Game');


/**
 * Save user game data
 * @param {object} req - request object sent to a route
 * @param {object} res -  response object from the route
 * @returns {object} - returns stored game data
 */
exports.startGame = (req, res) => {
  const game = new Game();

  game.gameOwner = req.body.gameOwner;
  game.gameId = req.params.id;
  game.gameWinner = req.body.gameWinner;
  game.date = new Date();
  game.gamePlayers = req.body.gamePlayers;

  if (req.token) {
    game.save((error) => {
      if (error) {
        return error;
      }
      res.json(game);
    });
  } else {
    res.json({ message: 'Please login to access this feature' });
  }
};

