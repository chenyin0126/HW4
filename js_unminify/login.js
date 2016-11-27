$("table").addClass("mdl-shadow--2dp animated zoomInDown");
$(".loginButton").addClass("mdl-shadow--2dp animated rotateInUpRight");
$(".signUpButton").addClass("mdl-shadow--2dp animated rotateInUpLeft");
$(".tableTitle").addClass('animated fadeInDown');

Parse.initialize("fQA6Nbiwo2gCK1EH9eOH3YwU0S96nLnM6rEjkjiW", "p6LeZCW3qLA6OcH0Pkfhz714pAsZOdZFJd33aLpl");
var redCross = ' <span style="color: #F44336">&#10006;</span>';
var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
function onClickSignUp() {
  checkInputs( function (email, password) {
  var user = new Parse.User();
  user.set("username", email);
  user.set("password", password);
  user.set("email", email);

  user.signUp(null, {
    success: function(user) {
      analyticsSignup();
      var signUpText = document.getElementById("signUpMessage");
      signUpText.style.display = "block";
    },
    error: function(user, error) {
      showError(error.message);
    }
  });
  });
}

function onClickLogIn() {
  checkInputs(function (email, password) {
  Parse.User.logIn(email, password, {
    success: function(user) {
      analyticsAppOpen();
      window.location.href = 'welcome.min.html';
    },
    error: function(user, error) {
      showError('Email password does not match');
    }
  });});
}

function checkInputs(callback) {
  var email = document.getElementById("usermail").value;
  var password = document.getElementById("password").value;

  if (!email) {
    showError('Please enter your Email address ');
  } else if (!re.test(email)) {
    showError('Invalid Email Address ');
  } else if (!password) {
    showError('Please enter your password ');
  } else {
    callback(email, password);
  }
}

function showError(message) {
  var errorText = document.getElementById('signInMessage');
  errorText.innerHTML = message + redCross;
  errorText.style.display = 'block';
}

function hideError() {
  var errorText = document.getElementById('signInMessage');
  errorText.innerHTML = '';
  errorText.style.display = 'none';
}

function analyticsAppOpen(){
  var dimensions = {};
  Parse.Analytics.track('App Opens', dimensions);
}

function analyticsSignup(){
  var dimensions = {};
  Parse.Analytics.track('Signup', dimensions);
}