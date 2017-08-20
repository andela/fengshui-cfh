import localStorage from 'localStorage';

exports.setRegion = (req) => {
  localStorage.setItem('player_region', req.body.player_region);
};
