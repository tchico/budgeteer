function checkUserValid(){
  if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
}

//CATEGORIES
function removeChildFromParent(parentCategory, categoryName){
  var parent = BudgetCategory.findOne({name: parentCategory, owner: Meteor.userId()});
  if(!parent){
    throw new Meteor.Error("Parent "+parentCategory+" category not found!");  
  }
  var childs = parent.child_categories || [];
  if(childs.indexOf(categoryName) >= 0){
    childs.splice(childs.indexOf(categoryName));
    BudgetCategory.update(
       { _id: parent._id},
       {$set: {child_categories: childs}}
    );  
  }
}

function addChildToParent(parentCategory, categoryName){
  var parent = BudgetCategory.findOne({name: parentCategory, owner: Meteor.userId()});
  if(!parent){
    throw new Meteor.Error("Parent "+parentCategory+" category not found!");  
  }
  var childs = parent.child_categories || [];
  if(childs.indexOf(categoryName) == -1){
    childs.push(categoryName);
    BudgetCategory.update(
       { _id: parent._id},
       {$set: {child_categories: childs}}
    );
  }
}

function hasParent(category){
  return category.parent_category && category.parent_category != category.name;
}


//BUDGETS
function createBudget(budgetName, categoryName){
  Budget.insert({
    name: budgetName,
    category: categoryName,
    amount: INITIAL_AMOUNT,
    owner: Meteor.userId(),
    createdAt: new Date()
  });
}

function addCategoryToBudgets(categoryName){
    var budgetNames = getBudgetsList();
    budgetNames.forEach(function(budget){
      createBudget(budget.name, categoryName);
    });
}

//ACCOUNTS
function createAccount(accountName, type, bank, initialAmount, currencyCode){
  Account.insert({
    name: accountName,
    type: type,
    bank: bank,
    balance: initialAmount,
    currency_id: currencyCode,
    owner: Meteor.userId(),
    createdAt: new Date()
  });
}

//TRANSACTIONS
function createTransaction(date, category, type, account, amount){
  Transaction.insert({
      date: date,
      category: category,
      type: type,
      account: account,
      amount: amount,
      owner: Meteor.userId(),
      createdAt: new Date()
  });
}



// METEOR METHODS
Meteor.methods({
  // CATEGORIES //
  addCategory: function (categoryName, parentCategory, type) {
    // Make sure the user is logged in before inserting a task
    checkUserValid();
 
    var exists = BudgetCategory.find({'name': categoryName, 'owner': Meteor.userId()}).count();
    if(exists){
      throw new Meteor.Error("Category already exists");
    }

    if(parentCategory && parentCategory != categoryName){
      var parent = BudgetCategory.findOne({'name': parentCategory, 'owner': Meteor.userId()});
      if(!parent){
        throw new Meteor.Error("Parent Category not found");
      }else{
        addChildToParent(parentCategory, categoryName);
      }
    }

    BudgetCategory.insert({
      name: categoryName,
      parent_category: parentCategory,
      type: type,
      owner: Meteor.userId(),
      created_date: new Date()
    });

    //When creating a category, add it to existing budgets.
    addCategoryToBudgets(categoryName);
  },

  addCategoryToBudgets: function(categoryName){
    var category = BudgetCategory.findOne({'name': categoryName});
    if (category.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    if(category.child_categories && category.child_categories.length){
      throw new Meteor.Error("Category has child categories associated.");  
    }

    addCategoryToBudgets(categoryName);
  },
  
  deleteCategory: function (categoryId) {
    var category = BudgetCategory.findOne({'_id': categoryId});
    if (category.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    if(category.child_categories && category.child_categories.length){
      throw new Meteor.Error("Category has child categories associated.");  
    }
    if(hasParent(category)){
      var parentCategory = BudgetCategory.findOne({'name': category.parent_category, 
                                                    'owner': Meteor.userId()});
      if(parentCategory){
        removeChildFromParent(parentCategory.name, category.name);
      }
    }
    BudgetCategory.remove(categoryId);
  },

  moveNode: function(categoryName, oldParentName, newParentName){
    checkUserValid();
    console.log('Moving node: '+ categoryName + '..' + oldParentName +'..'+ newParentName);
    if(!categoryName){
      throw new Meteor.Error("Category name invalid");
    }
    
    var category = BudgetCategory.findOne({name: categoryName, owner: Meteor.userId()});
    if(!category){
      throw new Meteor.Error("Category not found!");  
    }

    //update the oldParent
    if(oldParent){
      removeChildFromParent(oldParentName, categoryName);
    }

    //update the new parent
    if(newParentName){
      addChildToParent(newParentName, categoryName);
    }

    //update the category and set the new parent
    BudgetCategory.update(category._id, {$set: {parent_category: newParentName}});
  },

  removeCategoryFromBudgets: function(categoryName){
    checkUserValid();
    if(!categoryName){
      throw new Meteor.Error("Category name invalid");
    }
    
    var category = BudgetCategory.findOne({name: categoryName, owner: Meteor.userId()});
    if(!category){
      throw new Meteor.Error("Category not found!");  
    }

    //remove the category from the budgets
    var budgetNames = getBudgetsList();
    budgetNames.forEach(function(budget){
      var budgetLines = Budget.find({name: budget.name,
                                     category: categoryName, 
                                     owner: Meteor.userId()});
      budgetLines.forEach(function(b){
        Budget.remove({_id: b._id});
      });
    });
  },


  // BUDGET
  createBudget: function(budgetName){
    checkUserValid();
    var budget = Budget.findOne({name: budgetName, owner: Meteor.userId()});
    if(budget){
      throw new Meteor.Error("That name is already taken!");  
    }

    var categories = BudgetCategory.find({owner: Meteor.userId()}).fetch();
    categories.forEach(function(category){
      createBudget(budgetName, category.name);
    });
  },

  deleteBudget: function(budgetName){
    checkUserValid();
    var budget = Budget.findOne({name: budgetName, owner: Meteor.userId()});
    if(!budget){
      throw new Meteor.Error("Budget not found");  
    }
    
    var budgetCategories = Budget.find({name: budgetName.toString(), 
                                        owner: Meteor.userId()}).fetch();
    budgetCategories.forEach(function(category){
      Budget.remove({_id: category._id}); 
    });  
  },

  favouriteBudget: function(budgetName){
    checkUserValid();
    var budget = Budget.findOne({name: budgetName, owner: Meteor.userId()});
    if(!budget){
      throw new Meteor.Error("Budget not found");  
    }
    
    var pref = Preferences.findOne({name: "favourite_budget", 
                                 owner: Meteor.userId()});
    if(pref){
      Preferences.update(
         { _id: pref._id},
         {$set: {value: budgetName}}
      ); 
    } else {
      Preferences.insert({
        name: "favourite_budget",
        value: budgetName,
        owner: Meteor.userId(),
        created_date: new Date()
      });
    } 
  },

  updateBudgetCategoryAmount: function(budgetName, category, month, newAmount){
    checkUserValid();
    var budget = Budget.findOne({name: budgetName, 
                                 category: category,
                                 owner: Meteor.userId()});
    if(!budget){
      throw new Meteor.Error("Budget/Cat."+ budgetName+"/"+category+" not found");  
    }

    var amounts = budget.amount;
    amounts[month] = newAmount;

    Budget.update(
       { _id: budget._id},
       {$set: {amount: amounts}}
    ); 
  },


  //ACCOUNTS
  createAccount: function(accountName, type, bank, initialAmount, currencyCode){
    checkUserValid();
    var account = Account.findOne({name: accountName, owner: Meteor.userId()});
    if(account){
      throw new Meteor.Error("That account name is already taken!");  
    }

    createAccount(accountName, type, bank, initialAmount, currencyCode);
  },

  deleteAccount: function(accountName){
    checkUserValid();
    var account = Account.findOne({name: accountName, owner: Meteor.userId()});
    if(!account){
      throw new Meteor.Error("Account not found");  
    }
    
    Account.remove({_id: account._id}); 
  },

  //TRANSACTIONS
  createTransaction: function(date, category, type, account, amount){
    checkUserValid();

    createTransaction(date, category, type, account, amount);
  },
});