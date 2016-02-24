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
  categories_income: function () {
      return BudgetCategory.find({type: 'Income', owner: Meteor.userId()}, 
                                 {sort: {parent_category: 1, name: 1}});
  },
  categories_expense: function () {
      return BudgetCategory.find({type: 'Expense', owner: Meteor.userId()}, 
                                 {sort: {parent_category: 1, name: 1}});
  },
  parents: function () {
      return BudgetCategory.find({owner: Meteor.userId()}, {sort: {name: 1}});
  }
});

Template.category_detail.helpers({
  category_display_name: function(){
      if(this.name != this.parent_category){
        return this.parent_category + ' > ' + this.name;  
      }else{
        return this.name;
      }
  }
});

Template.edit_category.helpers({
  parents: function () {
      return BudgetCategory.find({owner: Meteor.userId(), type: this.type},
                                 {sort: {name: 1}});
  }
});

Template.category_tree.helpers({
  categories_expense: function () {
      var categories = BudgetCategory.find({'type': 'Expense', 'parent_category': ''}, 
                                           {sort: {name: 1}});
      return categories;
  },
  categories_income: function () {
      return BudgetCategory.find({'type': 'Income'}, {sort: {name: 1}});
  }
});




