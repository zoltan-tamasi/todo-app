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
  app.use(app.router);
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

app.get("/", function(req, res) {
  res.sendfile("form.html");
});

app.post('/login', function(req, res) {
  authenticate(req.body.email, req.body.password, function(err, user) {
    if (user) {
      req.session.regenerate(function() {
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name;
        res.redirect('');
      });
    } else {
      req.session.error = 'Authentication failed, please check your ' + ' username and password.';
      res.redirect('login');
    }
  });
});

app.post('/register', function(req, res) {
  var data = req.body;

  users.findOne({ email : data.email}, function(err, user) {
    if (err) throw err;
    if (user) {
      res.end("User with email already registered");
      return;
    }
    var salt = pass.getSalt();
    pass.hash(data.password, function(err, salt, hash) {
      if (err) throw err;
      users.insert({ 
        username : data.username,
        email : data.email,
        hash: hash,
        salt: salt
      }, function(err, user) {
        if (err) throw err;
        res.end("User with name " + data.username + "registered");
      });
    });
  });
});

app.get("/api/user", function(req, res) {
  var data = req.body;

  users.findOne({ username : data.username }, function(err, user) {
    
  });
});

app.put("/api/user", function(req, res) {
  var data = req.body;

  users.insert(data, {safe: true}, function(err, records) {
    if (err) throw err;
    console.log("User added with id " + records[0]._id);
  });
  
}); 

app.get("/api/todos/:id", function(req, res) {
  var id = parseInt(req.params.id);

  users.findOne({ id : id }, function(err, user) {
    if (err) throw err;
    res.end(JSON.stringify(user.todos));
  });
});

app.put("/api/todos/:id", function(req, res) {
  var id = parseInt(req.params.id);
  var data = req.body;

  if (!data.todos) {
    res.end("Invalid format\n");
  }

  users.update({ id: id }, { $set: { todos: data.todos } }, function(err, count) {
    if (err) throw err;
    res.end(count ? "Todolist updated\n" : "User with given id not found\n");
  });
});

app.post("/api/todos/:id", function(req, res) {
  var id = parseInt(req.params.id);
  var data = req.body;

  if (!data.todo) {
    res.end("Invalid format\n");
  }
  users.update({ id: id }, { $push: { todos: data.todo } }, function(err, count) {
    if (err) throw err;
    res.end(count ? "Todolist updated\n" : "User with given id not found\n");
  });
});

app.listen(3000);