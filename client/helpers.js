//subscritpions
Meteor.subscribe("budget_categories");
Meteor.subscribe("budget");


//helpers
Template.navigation.helpers({
  b_user: function () {
  	var emails = Meteor.user().emails;
  	if(emails.length){
  		return Meteor.user().emails[0]['address'];
  	}
    return Meteor.user().username;
  }
});

//CATEGORIES
Template.categories.helpers({
  categories: function () {
      return BudgetCategory.find({}, {sort: {created_date: -1}});
  },
  parents: function () {
      return BudgetCategory.find({}, {sort: {name: 1}});
  }
});


