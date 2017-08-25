import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const rootPath = path.normalize(path.join(__dirname, '/../..'));

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  db: process.env.MONGOHQ_URL
};
