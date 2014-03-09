var monk = require('monk');
var config = require('./config.json');

var db = monk(config.DB_HOST, {
  username : config.DB_USER,
  password : config.DB_PASS
});

exports.users = db.get("users");