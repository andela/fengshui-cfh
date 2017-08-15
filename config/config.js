import _ from 'underscore';
import allJs from '../config/env/all';

// Load app configuration

module.exports = _.extend(allJs,
    require(`${__dirname}/../config/env/${process.env.NODE_ENV}.json`) || {});
