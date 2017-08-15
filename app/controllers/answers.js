/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const Answer = mongoose.model('Answer');

/**
 * @param{Object} req
 * @param{Object} res
 * @param{Function} next
 * @param{Number} id
 * @return{void} void
 * List of Answers (for Game class)
 */
exports.answer = (req, res, next, id) => {
  Answer.load(id, (err, answer) => {
    if (err) return next(err);
    if (!answer) return next(new Error(`Failed to load answer ${id}`));
    req.answer = answer;
    next();
  });
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{void} void
 * List of Answers (for Game class)
 */
exports.show = (req, res) => {
  res.jsonp(req.answer);
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{void} void
 * List of Answers (for Game class)
 */
exports.all = (req, res) => {
  Answer.find({ official: true }).select('-_id').exec((err, answers) => {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(answers);
    }
  });
};

/**
 * @param{Function} cb
 * @return{void} void
 * List of Answers (for Game class)
 */
exports.allAnswersForGame = (cb) => {
  Answer.find({ official: true }).select('-_id').exec((err, answers) => {
    if (err) {
      throw new Error(err);
    } else {
      cb(answers);
    }
  });
};
