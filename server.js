
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import passport from 'passport';
import logger from 'mean-logger';
import io from 'socket.io';

dotenv.config();
/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// if test env, load example file
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('./config/config');
const auth = require('./config/middlewares/authorization');
const mongoose = require('mongoose');
// Bootstrap db connection
mongoose.connect(config.db);

// Bootstrap models
const modelsPath = `${__dirname}/app/models`;

const walk = (path) => {
  fs.readdirSync(path).forEach((file) => {
    const newPath = `${path}/${file}`;
    const stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.(js|coffee)/.test(file)) {
        require(newPath);
      }
    } else if (stat.isDirectory()) {
      walk(newPath);
    }
  });
};
walk(modelsPath);

// bootstrap passport config
require('./config/passport')(passport);

const app = express();

app.use((req, res, next) => {
  res.locals.bar = 'jwtToken';
  next();
});

// express settings
require('./config/express')(app, passport, mongoose);

// Bootstrap routes
require('./config/routes')(app, passport, auth);

// Start the app by listening on <port>
const port = config.port;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
// game logic handled here
require('./config/socket/socket')(ioObj);

// initialize socket to listen for chat messagesList

// Initializing logger
logger.init(app, passport, mongoose);

// expose app
export default app;