// import winston from 'winston';
import mongoose from 'mongoose';
import users from '../app/controllers/users';
import region from '../app/controllers/region';
import answers from '../app/controllers/answers';
import questions from '../app/controllers/questions';
import avatars from '../app/controllers/avatars';
import index from '../app/controllers/index';
import game from '../app/controllers/game';
import invite from '../app/controllers/invite';
import middleware from './middlewares/authorization';
import sendMail from './helper/sendMail';

const User = mongoose.model('User');

module.exports = (app, passport) => {
    // User Routes
  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/chooseavatars', users.checkAvatar);
  app.get('/signout', users.signout);

  // Setting up the users api
  app.post('/api/auth/users', users.create);
  app.post('/users/avatars', users.avatars);
  app.post('/api/auth/signin', users.jwtSignIn);

    // Donation Routes
  app.post('/donations', users.addDonation);
  app.get('/api/donations', users.ensureToken, users.getDonations);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);

  app.get('/users/me', users.me);
  app.get('/users/:userId', users.show);

    // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), users.authCallback);

  // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.authCallback);

    // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.signin);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.authCallback);

    // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), users.signin);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), users.authCallback);

    // Finish with setting up the userId param
  app.param('userId', users.user);

    // Answer Routes
  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
    // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

    // Question Routes
  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
    // Finish with setting up the questionId param
  app.param('questionId', questions.question);

    // Avatar Routes
  app.get('/avatars', avatars.allJSON);

    // Home route
  app.get('/play', index.play);
  app.get('/', index.render);
  app.get('/gametour', index.gameTour);

  // Game route
  app.post('/api/games/:id/start', users.ensureToken, game.startGame);

  // Set Region
  app.post('/region', region.setRegion);
  app.get('/api/games/history', users.ensureToken, game.getGameHistory);
  app.get('/api/leaderboard', users.ensureToken, game.getLeaderBoard);
  app.get('/api/search/users', middleware.requiresLogin, (req, res) => {
    User.find({}, (error, result) => {
      if (!(error)) {
        res.send(result);
      } else {
        res.send(error);
      }
    });
  });

  app.post('/inviteusers', middleware.requiresLogin, (req, res) => {
    sendMail(req, res);
  });
  app.post('/friends', invite.addFriend);
  app.post('/notify', invite.sendNotification);
  app.post('/api/friends', invite.getFriends);
  app.post('/api/notify', invite.loadNotification);
  app.post('/api/read', invite.readNotification);
};
