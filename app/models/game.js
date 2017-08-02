/**
 * Module dependencies.
 */
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Game Schema
 */
const GameSchema = new Schema({
  gameId: {
    type: String
  },
  gameOwner: {
    type: String
  },
  gameWinner: {
    type: String,
    default: '',
    trim: true
  },

  date: Date,

  gamePlayers: []
});

mongoose.model('Game', GameSchema);