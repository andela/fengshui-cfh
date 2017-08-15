
import express from 'express';
import flash from 'connect-flash';
import helpers from 'view-helpers';
import config from './config';

const mongoStore = require('connect-mongo')(express);

module.exports = (app, passport, mongoose) => {
  app.set('showStackError', true);
  app.use(express.compress({
    filter: (req, res) => {
      (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));
  app.use(express.favicon());
  app.use(express.static(`${config.root}/public`));
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'));
  }
  app.set('views', `${config.root}/app/views`);
  app.set('view engine', 'jade');
  app.enable('jsonp callback');

  app.configure(() => {
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({
      secret: 'MEAN',
      store: new mongoStore({
        url: config.db,
        collection: 'sessions',
        mongoose_connection: mongoose.connection
      })
    }));
    app.use(flash());
    app.use(helpers(config.app.name));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use((err, req, res, next) => {
      if (err.message.indexOf('not found')) return next();
      res.status(500).render('500', {
        error: err.stack
      });
    });
    app.use((req, res) => {
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      });
    });
  });
};
