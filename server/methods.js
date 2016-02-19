function checkUserValid(){
  if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
}

Meteor.methods({
  // TASKS //
  addCategory: function (category_name, parent_category, is_expense) {
    // Make sure the user is logged in before inserting a task
    checkUserValid();
 
    BudgetCategory.insert({
      name: category_name,
      parent_category: parent_category,
      type: type,
      owner: Meteor.userId(),
      created_date: new Date()
    });
  },
  
  deleteCategory: function (categoryId) {
    var category = BudgetCategory.findOne({'_id': categoryId});
    if (category.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    BudgetCategory.remove(categoryId);
  },

  addBudgetMonth: function (year, month, category, amount) {
    // Make sure the user is logged in before inserting
    checkUserValid();
 
    Budget.insert({
      year: year,
      month: month,
      category: category,
      amount: amount,
      owner: Meteor.userId(),
      createdAt: new Date()
    });
  }
});