var users = require('../users').users;
var pass = require('../pass');

exports.get = function(req, res) {
  res.end(JSON.stringify({
    "user" : req.session.user
  }));
};

exports.post =function(req, res) {
  var data = req.body;

  users.findOne({ email : data.email }, function(err, user) {
    if (err) throw err;
    if (user) {
      res.end(JSON.stringify({
        success: false,
        message: "User with email already registered"
      }));
      return;
    }
    var salt = pass.getSalt();
    pass.hash(data.password, function(err, salt, hash) {
      if (err) throw err;
      users.insert({ 
        username : data.username,
        email : data.email,
        hash: hash,
        salt: salt,
        todos: []
      }, function(err, user) {
        if (err) throw err;
        res.end(JSON.stringify({
          success: true,
          message: "User with name " + data.username + " registered",
        }));
      });
    });
  });
};