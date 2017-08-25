const mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Notificate = mongoose.model('Notificate');

exports.addFriend = (req, res) => {
  const friendId = req.body.friendId,
    userId = req.body.user_id,
    button = req.body.checkButton;
  if (button === 'Addfriend') {
    User.findOneAndUpdate(
      { _id: userId },
      { $push: { friends: friendId } },
      { safe: true, upsert: true },
      (err) => {
        if (!err) {
          res.json(
            {
              succ: 'Successful',
              action: 'addfriend',
              friendId: req.body.friendId
            });
        }
      });
  } else {
    User.update(
      { _id: userId },
      { $pullAll: { friends: [friendId] } },
      (err) => {
        if (!err) {
          res.json(
            {
              succ: 'Successful',
              action: 'unfriend',
              friendId: req.body.friendId
            });
        }
      });
  }
};

exports.getFriends = (req, res) => {
  const userId = req.body.user_id;
  User.find(
    { _id: userId },
    (err, result) => {
      const userFriends = result[0].friends;
      res.send(userFriends);
    });
};

exports.loadNotification = (req, res) => {
  const userId = req.body.user_id;
  Notificate.find(
    {
      to: userId,
      read: 0
    },
    (err, result) => {
      res.send(result);
    });
};

exports.readNotification = (req, res) => {
  const id = req.body.notifyId;
  Notification.findOneAndUpdate(
    {
      _id: id },
    { $set: { read: 1 } },
    { new: true },
    () => {
      res.json(
        {
          succ: 'Update Successfully'
        });
    });
};

exports.sendNotification = (req, res) => {
  const link = req.body.url,
    userName = req.body.userName,
    message = `${userName} has just invited you to join a game`,
    friendList = req.body.friendList;
  let count = 0;
  friendList.forEach((friendId) => {
    const Notify = new Notificate(
      {
        to: friendId,
        from: userName,
        message,
        link,
        read: 0
      }
    );
    count += 1;
    Notify.save();
  });
  if (count === friendList.length) {
    res.json(
      {
        succ: 'Successful'
      });
  }
};
