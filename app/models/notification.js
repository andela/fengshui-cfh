const mongoose = require('mongoose');

const Schema = mongoose.Schema;
 /**
  * Question Schema
  */
const notificationSchema = new Schema({
  to: String,
  from: String,
  message: String,
  link: String,
  read: Number // 1 should be mark as read
});
mongoose.model('Notificate', notificationSchema);
