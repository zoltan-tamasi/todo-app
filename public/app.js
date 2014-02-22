function loginUser(credentials) {
  $.post("/login", credentials, function(response) {
      $("#content");
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