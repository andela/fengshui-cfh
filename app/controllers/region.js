import localStorage from 'localStorage';

exports.setRegion = (req) => {
  localStorage.setItem('playerRegion', req.body.playerRegion);
};
