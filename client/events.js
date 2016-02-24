


//events
Template.login.events({
    "submit .m-t": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var email = event.target.email.value;
      var password = event.target.password.value;
 
      //Login
      Meteor.loginWithPassword(email, password, function(error){
          if(error){
              console.log(error.reason);
          } else {
              Router.go("home");
          }
      });
    }
  });

Template.register.events({
    "submit .m-t": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var name = event.target.name.value;
      var email = event.target.email.value;
      var password = event.target.password.value;
 
      //Login
      Accounts.createUser(
        {username: name, email: email, password: password},
        function(error){
          if(error){
              console.log(error.reason);
          } else {
              Router.go("home");
          }
      });
    }
  });

Template.navigation.events({
    "click #logout": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      //Logout
      Meteor.logout(function(error){
          if(error){
              console.log(error.reason);
              toastr.error('Error logging out');
          } else {
              Router.go("login");
          }
      });
        
    }
});

Template.topNavbar.events({
    "click #logout": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      //Logout
      Meteor.logout(function(error){
          if(error){
            console.log(error.reason);
            toastr.error('Error logging out');
          } else {
            Router.go("login");
          }
      });
        
    }
});



