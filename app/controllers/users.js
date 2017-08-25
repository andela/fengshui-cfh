/**
 * Module dependencies.
 */
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'),
  User = mongoose.model('User');
const avatars = require('./avatars').all();

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Void}
 * Auth callback
 */
exports.authCallback = (req, res) => {
  res.redirect('/chooseavatars');
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 * Show login form
 */
exports.signin = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signin?error=invalid');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 * Show sign up form
 */
exports.signup = (req, res) => {
  if (!req.user) {
    res.redirect('/#!/signup');
  } else {
    res.redirect('/#!/app');
  }
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 * Logout
 */
exports.signout = (req, res) => {
  req.logout();
  return res.json({
    message: 'Logged Out'
  });
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 * Session
 */
exports.session = (req, res) => {
  res.redirect('/');
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 * Check avatar - Confirm if the user who logged in via passport
 * already has an avatar. If they don't have one, redirect them
 * to our Choose an Avatar page.
 */
exports.checkAvatar = (req, res) => {
  if (req.user && req.user._id) {
    User.findOne({
      _id: req.user._id
    })
    .exec((err, user) => {
      if (user.avatar !== undefined) {
        res.redirect('/#!/');
      } else {
        res.redirect('/#!/choose-avatar');
      }
    });
  } else {
    // If user doesn't even exist, redirect to /
    res.redirect('/');
  }
};

/**
 * [creates a new User]
 * @method create
 * @param  {[type]} req [the user infomation sent from the frontend]
 * @param  {[type]} res [the result of the registration]
 * @return {[type]}     [the]
 */
exports.create = (req, res) => {
  if (req.body.name && req.body.password && req.body.email) {
    User.findOne({
      email: req.body.email
    }).exec((err, existingUser) => {
      if (!existingUser) {
        const user = new User(req.body);
        user.avatar = avatars[user.avatar];
        user.provider = 'local';
        user.save((err) => {
          if (err) {
            return res.json({
              message: 'Unknown Error'
            }).status(500);
          }
          req.logIn(user, (err) => {
            if (err) {
              return res.json({
                message: 'Internal Server Error'
              }).status(500);
            }
            const newUser = {
              name: req.body.name,
              email: req.body.email
            };
            const token = jwt.sign({
              exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
              data: newUser
            }, process.env.JWT_SECRET);
            return res.json({
              message: 'Registration Successful',
              jwt: token
            }).status(200);
          });
        });
      } else {
        return res.json({
          message: 'Existing User'
        }).status(400);
      }
    });
  } else {
    return res.json({
      message: 'Registration Incomplete'
    }).status(400);
  }
};

/*
 * [signin a user]
 * @method jwtSignIn
 * @param  {[type]} req [the user infomation sent from the frontend]
 * @param  {[type]} res [the result of the registration]
 * @return {[type]} Object
 */
exports.jwtSignIn = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'Enter all required field' });
  }
  User.findOne({
    email: req.body.email
  }).exec((error, existingUser) => {
    if (error) {
      return res.status(500).json({
        message: 'Server Login Error'
      });
    }
    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    if (!existingUser.authenticate(req.body.password)) {
      return res.status(400).json({
        message: 'Invalid Login details'
      });
    }
    req.logIn(existingUser, () => {
      const newUser = {
        name: existingUser.name,
        email: existingUser.email
      };
      const token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        data: newUser
      }, process.env.JWT_SECRET);
      return res.status(200).json({ message: 'successful login', token });
    });
  });
};

exports.ensureToken = (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    token = token.split(' ');
    token = token[1];
  }
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.json({ success: false, message: 'Failed to authenticate token.' }).status(403);
      } else {
        req.token = decoded;
        // result = res.json({ success: true, message: 'Token Correct', decoded }).status(200);
        next();
      }
    });
  } else {
    res.status(400).send({ success: false, message: 'No token provided' });
    // res.redirect('/#!/signin?error=No_token_provided');
  }
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 * Assign avatar to user
 */
exports.avatars = (req, res) => {
  // Update the current user's profile to include the avatar choice they've made
  if (req.user && req.user._id && req.body.avatar !== undefined &&
    /\d/.test(req.body.avatar) && avatars[req.body.avatar]) {
    User.findOne({
      _id: req.user._id
    })
    .exec((err, user) => {
      user.avatar = avatars[req.body.avatar];
      user.save();
    });
  }
  return res.redirect('/');
};

exports.addDonation = (req, res) => {
  if (req.body && req.user && req.user._id) {
    // Verify that the object contains crowdrise data
    if (req.body.amount && req.body.crowdrise_donation_id && req.body.donor_name) {
      User.findOne({
        _id: req.user._id
      })
      .exec((err, user) => {
        // Confirm that this object hasn't already been entered
        let duplicate = false;
        for (let i = 0; i < user.donations.length; i += 1) {
          if (user.donations[i].crowdrise_donation_id === req.body.crowdrise_donation_id) {
            duplicate = true;
          }
        }
        if (!duplicate) {
          user.donations.push(req.body);
          user.premium = 1;
          user.save();
        }
      });
    }
  }
  res.send();
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 *  Show profile
 */
exports.show = (req, res) => {
  const user = req.profile;
  res.render('users/show', {
    title: user.name,
    user
  });
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request object
 * Send User
 */
exports.me = (req, res) => {
  res.jsonp(req.user || null);
};

/**
 * @param{Object} req
 * @param{Object} res
 * @param{Function} next
 * @param{Number} id
 * @return{Object} request object
 * @return{Object} request object
 * Find user by id
 */
exports.user = (req, res, next, id) => {
  User
    .findOne({
      _id: id
    })
    .exec((err, user) => {
      if (err) return next(err);
      if (!user) return next(new Error(`Failed to load User ${id}`));
      req.profile = user;
      next();
    });
};

exports.getDonations = (req, res) => {
  User.findOne({ username: req.token.id }, (err, user) => {
    if (err) {
      res.status(500).send({ error: 'An error occured' });
    } else {
      res.json({ donations: user.donations });
    }
  });
};
