var users = require('../users').users;

exports.post = function(req, res) {
  var data = req.body;
  if (!data.todos || Object.prototype.toString.call(data.todos) !== '[object Array]') {
    res.end(JSON.stringify({
      success: false,
      message: "Invalid format"
    }));
    return;
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
};