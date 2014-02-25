var express = require('express');
var mongo = require('mongodb');
var monk = require('monk');

var config = require('./config.json');
var pass = require('./pass.js');

var db = monk(config.DB_HOST, {
  username : config.DB_USER,
  password : config.DB_PASS
});

var users = db.get("users");

var app = express();
app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
});

function authenticate(email, password, fn) {
  if (!module.parent) console.log('authenticating %s:%s', email, password);

  users.findOne({ email : email }, function(err, user) {
    if (!user) return fn(new Error('cannot find user'));
    pass.hash(password, user.salt, function(err, hash) {
      if (err) return fn(err);
      if (hash == user.hash) return fn(null, user);
      fn(new Error('invalid password'));
    });

  });
}

app.post('/login', function(req, res) {
  authenticate(req.body.email, req.body.password, function(err, user) {
    if (user) {
      req.session.regenerate(function() {
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name;
        res.end(JSON.stringify({
          "success" : true,
          "message" : "Authenticated",
          "user" : user
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
});

app.post('/register', function(req, res) {
  var data = req.body;

  users.findOne({ email : data.email}, function(err, user) {
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
          message: "User with name " + data.username + "registered",
          user: user
        }));
      });
    });
  });
});

app.post("/api/todos", function(req, res) {
  var id = parseInt(req.params.id);
  var data = req.body;

  if (!req.session.user) {
    res.end(JSON.stringify({
      success: false,
      message: "User not authenticated"
    }));
  }

  if (!data.todos || Object.prototype.toString.call(data.todos) !== '[object Array]') {
    res.end(JSON.stringify({
      success: false,
      message: "Invalid format"
    }));
  }

  var email = req.session.user.email;

  users.update({ email: email }, { $set: { todos: data.todos } }, function(err, count) {
    if (err) throw err;
    if (count) {
      res.end(JSON.stringify({
        success: true,
        message: "Todolist updated"
      }));
    } else {
      res.end(JSON.stringify({
        success: false,
        message: "User not found"
      }));
    }
  });
});

app.listen(config.PORT || process.env.PORT || 3000);