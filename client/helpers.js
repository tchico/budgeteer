//subscritpions
Meteor.subscribe("budget_categories");
Meteor.subscribe("budget");


//functions
function getAllCategories(type){
    return BudgetCategory.find({type: type, owner: Meteor.userId()}, 
                               {sort: {parent_category: 1, name: 1}});
};

function getAllLeafCategories(type){
  return BudgetCategory.find(
          {type: type,
           child_categories: {$exists: false}, //only want leaf categories
           owner: Meteor.userId()}, 
          {sort: {parent_category: 1, name: 1}});
};

function getCategoryDisplayName(category){
    if(category.name != category.parent_category){
      return category.parent_category + ' > ' + category.name;  
    }else{
      return category.name;
    }
};


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
  budget_list: function(){
      var distinctEntries = _.uniq(
          Budget.find({}, {sort: {name:1}, fields: {name:true}}).fetch().map(
              function(x) {
                return x.name;
              }), true);
       return distinctEntries;
  },
  summary: function(){
      return BudgetCategory.aggregate(
        [
           {
             $group:
               {
                 _id: { type: '$type' },
                 totalAmount: { $sum: "$amount" }
               }
           }
         ]
      );
  }
});



