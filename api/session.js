var pass = require('../pass');

exports.get = function(req, res) {
  pass.authenticate(req.query.email, req.query.password, function(err, user) {
    if (user) {
      req.session.regenerate(function() {
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name;
        res.end(JSON.stringify({
          "success" : true,
          "message" : "Authenticated",
        }));
      });
    } else {
      req.session.error = 'Authentication failed, please check your ' + ' username and password.';
      res.end(JSON.stringify({
        "success" : false,
        "message" : "Authentication failed"
      }));
    }
  });
};

exports.delete = function(req, res) {
  req.session.destroy();
  res.end(JSON.stringify({
    "success" : true,
    "message" : "Logged out"
  }));
};