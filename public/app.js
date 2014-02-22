function TodoViewModel(user) {
  var self = this;
  this.todos = ko.observableArray(user.todos);
  this.addTodo = function() {
    self.todos.push({
      name : "New todo",
      priority : 2
    });
  };
  this.removeTodo = function(todo) {
    this.todos.remove(todo);
  }.bind(this);
}

function initTodoView(user) {
  $("#content").html($("#todo-view").html());
  ko.applyBindings(new TodoViewModel(user), document.getElementById("todo_collection"));
}

function loginUser(credentials) {
  $.post("/login", credentials, function(response) {
      var responseObj = JSON.parse(response);
      initTodoView(responseObj.user);
  });
}

function LoginViewModel() {
  this.email = ko.observable("");
  this.password = ko.observable("");
  this.login = function() {
    loginUser({ 
      email : this.email(),
      password : this.password()
    });
  }
}

ko.applyBindings(new LoginViewModel(), document.getElementById("content"));