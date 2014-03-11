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

  this.logout = function() {
    $.ajax({
      url: "/api/session",
      success: initLoginRegView,
      type: "DELETE"
    });
  }
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
  $.ajax({
    url: "/api/session",
    type: "GET",
    data: credentials,
    success: function(response) {
      var responseObj = JSON.parse(response);
      if (responseObj.success) {
        $.ajax({
          url: "/api/user",
          data: JSON.stringify(credentials),
          success: function(response) {
            responseObj = JSON.parse(response);
            initTodoView(responseObj.user);  
          },
          contentType: 'application/json; charset=utf-8'
        });      
      } else {
        context.message(responseObj.message);
      }
    }
  });
}

function regUser(user, context) {
  $.ajax({
    url: "/api/user",
    type: "POST",
    data: JSON.stringify(user),
    success: function(response) {
      var responseObj = JSON.parse(response);
      if (responseObj.success) {
        initTodoView(responseObj.user);  
      } else {
        context.message(responseObj.message);
      }
    },
    contentType: 'application/json; charset=utf-8'
  });
}

function saveUserTodos(todos, context) {
  $.ajax({
    url: "/api/todos",
    type: "POST",
    data: JSON.stringify({ todos : todos }),
    success: function(response) {
      var responseObj = JSON.parse(response);
      context.message(responseObj.message);
    },
    contentType: 'application/json; charset=utf-8'
  });
}

initLoginRegView();