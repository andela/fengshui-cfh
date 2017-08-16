import jwt from 'jsonwebtoken';

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request response
 * Redirect users to /#!/app (forcing Angular to reload the page)
 */
exports.play = (req, res) => {
  if (Object.keys(req.query)[0] === 'custom') {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(' ');
      token = token[1];
    }
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        let result;
        if (err) {
          result = res.json({ success: false, message: 'Failed to authenticate token.' }).status(403);
        } else {
          result = res.json({ success: true, message: 'Token Correct', ded: decoded }).status(200);
        }
        return result;
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
  } else {
    res.redirect('/#!/app');
  }
};

exports.render = (req, res) => {
  res.render('index', {
    user: req.user ? JSON.stringify(req.user) : 'null'
  });
};

exports.gameTour = (req, res) => {
  location.reload();
  res.redirect('/#!/gametour');
};
