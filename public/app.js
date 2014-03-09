function TodoViewModel(user) {
  this.todos = ko.observableArray(user.todos);
  this.username = ko.observable(user.username);

  this.message = ko.observable("");

  this.addTodo = function() {
    this.todos.push({
      name : "New todo",
      priority : 2
    });
  }.bind(this);

  this.removeTodo = function(todo) {
    this.todos.remove(todo);
  }.bind(this);

  this.save = function() {
    saveUserTodos(this.todos(), this);
  }.bind(this);
}

function LoginViewModel() {
  this.email = ko.observable("");
  this.password = ko.observable("");
  this.username = ko.observable("");
  this.isReg = ko.observable(false);

  this.message = ko.observable("");

  this.login = function() {
    if (this.isReg()) {
      regUser({
        email : this.email(),
        password : this.password(),
        username : this.username()
      }, this);
    } else {
      loginUser({ 
        email : this.email(),
        password : this.password()
      }, this);
    }
  }
  
  this.setReg = function(val) {
    this.isReg(val);
    this.message("");
  }.bind(this);

  this.submitText = ko.computed(function() {
    return this.isReg() ? "Register" : "Login";
  }, this);
}

function initTodoView(user) {
  $("#content").html($("#todo-view").html());
  ko.applyBindings(new TodoViewModel(user), document.getElementById("todo_collection"));
}

function initLoginRegView() {
  $("#content").html($("#login-reg-view").html());
  ko.applyBindings(new LoginViewModel(), document.getElementById("login-reg-container"));
}

function loginUser(credentials, context) {
  $.get("/api/session", credentials, function(response) {
    var responseObj = JSON.parse(response);
    if (responseObj.success) {
      initTodoView(responseObj.user);  
    } else {
      context.message(responseObj.message);
    }
  });
}

function regUser(user, context) {
  $.post("/register", user, function(response) {
    var responseObj = JSON.parse(response);
    if (responseObj.success) {
      initTodoView(responseObj.user);  
    } else {
      context.message(responseObj.message);
    }
  }); 
}

function saveUserTodos(todos, context) {
  $.post("/api/todos", { todos : todos }, function(response) {
    var responseObj = JSON.parse(response);
    context.message(responseObj.message);
  });  
}

initLoginRegView();