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
            toastr.error('Error logging out', error.reason)
          } else {
            Router.go("login");
          }
      });
        
    }
});

//CATEGORIES
Template.categories.events({
    "submit .form-inline": function (event) {
      // Prevent default browser form submit
      event.preventDefault();
 
      // Get value from form element
      var category_name = event.target.category_name.value;
      var parent_category = event.target.parent_category.value;
      var type = event.target.category_type.value;
 
      //add category
      Meteor.call("addCategory", 
                  category_name, 
                  parent_category, 
                  type, 
                  function(error){
                      notif_error('Error logging out', error);
                  });
      toastr.success('Category added');
    }
  });

