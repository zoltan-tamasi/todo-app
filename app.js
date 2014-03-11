var express = require('express');

var config = require('./config.json');
var pass = require('./pass');


var session = require('./api/session');
var user = require('./api/user');
var todos = require('./api/todos');

var app = express();
app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
});

app.get('/api/session', session.get);

app.delete("/api/session", session.delete);

app.get('/api/user', pass.restrict, user.get);

app.post('/api/user', user.post);

app.post("/api/todos", pass.restrict, todos.post);

app.listen(config.PORT || process.env.PORT || 3000);