
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
      return getAllCategories('Income');
  },
  categories_expense: function () {
      return getAllCategories('Expense');
  },
  parents: function () {
      return BudgetCategory.find({owner: Meteor.userId()}, {sort: {name: 1}});
  }
});

Template.category_detail.helpers({
  category_display_name: function(){
      return getCategoryDisplayName(this);
  }
});

Template.category_tree.helpers({
  categories_income: function () {
      return getAllCategories('Income');
  },
  categories_expense: function () {
      return getAllCategories('Expense');
  },
});


//BUDGET
Template.budget.helpers({
  categories_income: function () {
      return getAllLeafCategories('Income');
  },
  categories_expense: function () {
      return getAllLeafCategories('Expense');
  },
  category_display_name: function(){
      return getCategoryDisplayName(this);
  },
  budget_list: getBudgetsList,
  summary: function(){
      return getAggregatedBudgetTable(selectedBudget);
  },
  selected_budget: function(){
    console.log('selected_budget:'+selectedBudget);
    return selectedBudget;
  },
  budget_for_category: getBudgetForCategory,
});

