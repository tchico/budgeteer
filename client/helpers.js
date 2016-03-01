
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
  budget_list: function(){
      var distinctEntries = _.uniq(
          Budget.find({}, {sort: {name:1}, fields: {name:true}}).fetch().map(
              function(x) {
                return x.name;
              }), true);
      var fav_budget = Preferences.findOne({name: "favourite_budget"});
      var budget_list = [];
      var b_set_fav = false;
      for(i in distinctEntries){
        var budget_entry = {'name': distinctEntries[i]};
        if(fav_budget && fav_budget.value == distinctEntries[i]){
          budget_entry['fav'] = b_set_fav = true;
        }
        if((i == distinctEntries.length - 1) && !b_set_fav){
          //if we haven't found a fav so far then set this guy as the fav.b_set_fav
          budget_entry['fav'] = true
        }
        budget_list.push(budget_entry);
      }
      return budget_list;
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

