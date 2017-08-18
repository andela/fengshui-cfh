import users from '../app/controllers/users';
import answers from '../app/controllers/answers';
import questions from '../app/controllers/questions';
import avatars from '../app/controllers/avatars';
import index from '../app/controllers/index';
import game from '../app/controllers/game';
import mongoose from 'mongoose';
import winston from 'winston';
import invite from '../app/controllers/invite';
import middleware from './middlewares/authorization';

const User = mongoose.model('User');
const sg = require('sendgrid')('SG.SsgxbJ1IRiSImn2gI1qAkA.' +
 +  'VdN9m18YcsrOoc6-kpg_C3h4B207Ftxc_znG3dHE5qk');
const sendMail = (inviteeMail, gameLink, gameOwner) => {
   const request = sg.emptyRequest({
    method: 'POST',
     path: '/v3/mail/send',
     body: {
       personalizations: [
         {
           to: [
             {
               email: `${inviteeMail}`,
             },
           ],
           subject: 'Cards For Humanity',
         },
       ],
       from: {
         email: 'cardsforhumanity@fengshui-cfh.io',
       },
       content: [
         {
           type: 'text/html',
           value: `
           <a href="http://fengshui-cfh-staging.herokuapp.com//#!/">
             <img style="display: block; margin: auto;"
               src="http://i.imgur.com/FuXN2R2.jpg"/>
           </a>
           <h2 style="margin-top: 40px; text-align: center">
           Cards For Humanity player,
           <span style="color: rgba(203, 109, 81, 0.9)">${gameOwner}</span>,
            has invited you to their game. <br><br>
              <a href="${gameLink}">
                <div style="text-align: center">
                   <button style="background-color: rgb(41, 97, 127);
                    border: none; color: white; padding: 15px 32px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;">
                    CLICK HERE TO JOIN THE ROUGH RIDE
                   </button>
                 </div>
             </a> <br>
           </h2>
           <h3 style="text-align: center">
             You can also copy the link below and paste in your
             browser window. <br>
             <span style="display: block; margin-top: 4px;
              background-color: #bec5ce; height: 30px; padding-top: 6px;
              text-align: center;">
               ${gameLink}
             </span>
           </h3>
           `
         },
       ],
     },
   });
 
   sg.API(request)
     .then(() => {
       winston.info(`Mail to ${inviteeMail} successfully sent.`);
     })
     .catch(error =>
       winston.info(error)
     );
}
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
     const url = req.body.url;
     const userEmail = req.body.invitee;
     const gameOwner = req.body.gameOwner;
 
     sendMail(userEmail, url, gameOwner);
     res.send(`Invite sent to ${userEmail}`);
   });
   app.post('/friends', invite.addFriend);
   app.post('/notify', invite.sendNotification);
   app.post('/api/friends', invite.getFriends);
   app.post('/api/notify', invite.loadNotification);
   app.post('/api/read', invite.readNotification);
};


