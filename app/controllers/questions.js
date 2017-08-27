/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

const Question = mongoose.model('Question');

/**
 * @param{Object} req
 * @param{Object} res
 * @param{Function} next callback
 * @param{Number} id question id
 * @return{Function} callback
 * Find question by id
 */
exports.question = (req, res, next, id) => {
  Question.load(id, (err, question) => {
    if (err) return next(err);
    if (!question) return next(new Error(`Failed to load question ${id}`));
    req.question = question;
    next();
  });
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request response
 * Show an question
 */
exports.show = (req, res) => {
  res.jsonp(req.question);
};

/**
 * @param{Object} req
 * @param{Object} res
 * @return{Object} request response
 * List of Questions
 */
exports.all = (req, res) => {
  Question.find({ official: true, numAnswers: { $lt: 3 } }).select('-_id').exec((err, questions) => {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(questions);
    }
  });
};

/**
 * @param{Function} cb
 * @return{Void}
 * List of Questions (for Game class)
 */
exports.allQuestionsForGame = (cb) => {
  Question.find({ official: true, numAnswers: { $lt: 3 } }).select('-_id').exec((err, questions) => {
    if (err) {
      throw new Error(err);
    } else {
      cb(questions);
    }
  });
};
