/**
 * Module dependencies.
*/
const localStorage = require('localStorage');

/**
* Find user by id
 */
exports.setRegion = (req, res) => {
  localStorage.setItem('player_region', req.body.player_region);
};
