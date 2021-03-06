import mongoose from 'mongoose';
import config from './config';

const LocalStrategy = require('passport-local').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = mongoose.model('User');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({
      _id: id
    }, (err, user) => {
      user.email = null;
      user.facebook = null;
      user.hashed_password = null;
      done(err, user);
    });
  });
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, done) => {
    User.findOne({
      email
    }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Unknown user'
        });
      }
      if (!user.authenticate(password)) {
        return done(null, false, {
          message: 'Invalid password'
        });
      }
      user.email = null;
      user.hashed_password = null;
      return done(null, user);
    });
  }
));

  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY || config.twitter.clientID,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || config.twitter.clientSecret,
    callbackURL: config.twitter.callbackURL
  },
  (token, tokenSecret, profile, done) => {
    User.findOne({ 'twitter.id_str': profile.id
    }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        user = new User({
          name: profile.displayName,
          username: profile.username,
          provider: 'twitter',
          twitter: profile._json
        });
        user.save((err) => {
          if (err) throw new Error(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
));

  passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID || config.facebook.clientID,
    clientSecret: process.env.FB_CLIENT_SECRET || config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({
      'facebook.id': profile.id
    }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: (profile.emails && profile.emails[0].value) || '',
          username: profile.username,
          provider: 'facebook',
          facebook: profile._json
        });
        user.save((err) => {
          if (err) throw new Error(err);
          user.facebook = null;
          return done(err, user);
        });
      } else {
        user.facebook = null;
        return done(err, user);
      }
    });
  }
));

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || config.github.clientID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET || config.github.clientSecret,
    callbackURL: config.github.callbackURL
  },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({
        'github.id': profile.id
      }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            username: profile.username,
            provider: 'github',
            github: profile._json
          });
          user.save((err) => {
            if (err) throw new Error(err);
            return done(err, user);
          });
        } else {
          return done(err, user);
        }
      });
    }
 ));

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || config.google.clientID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
   (accessToken, refreshToken, profile, done) => {
     User.findOne({
       'google.id': profile.id
     }, (err, user) => {
       if (err) {
         return done(err);
       }
       if (!user) {
         user = new User({
           name: profile.displayName,
           email: profile.emails[0].value,
           username: profile.username,
           provider: 'google',
           google: profile._json
         });
         user.save((err) => {
           if (err) throw new Error(err);
           return done(err, user);
         });
       } else {
         return done(err, user);
       }
     });
   }
  ));
};
