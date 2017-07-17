const jwt = require('jsonwebtoken');
const users = require('./users');
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    _ = require('underscore');

/**
 * Redirect users to /#!/app (forcing Angular to reload the page)
 */
exports.play = function(req, res) {
  if (Object.keys(req.query)[0] === 'custom') {
    let token = req.headers.authorization;
    if (token){
      token = token.split(' ');
      token = token[1];
    }
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' }).status(403);
          // res.redirect('/#!/signin?error=Failed to authenticate token');
        } else {
          return res.json({ success: true, message: 'Token Correct', ded: decoded }).status(200);
        //  req.decoded = decoded;
          // next();
        }
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
      // res.redirect('/#!/signin?error=No_token_provided');
    }
    // res.redirect('/#!/app?custom');
  } else {
    res.redirect('/#!/app');
  }
};

exports.render = function(req, res) {
  res.render('index', {
    user: req.user ? JSON.stringify(req.user) : 'null'
  });
};
