function checkUserValid(){
  if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
}

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



// METEOR METHODS
Meteor.methods({
  // TASKS //
  addCategory: function (category_name, parent_category, type) {
    // Make sure the user is logged in before inserting a task
    checkUserValid();
 
    var exists = BudgetCategory.find({'name': category_name, 'owner': Meteor.userId()}).count();
    if(exists){
      throw new Meteor.Error("Category already exists");
    }

    if(parent_category && parent_category != category_name){
      var parent = BudgetCategory.findOne({'name': parent_category, 'owner': Meteor.userId()});
      if(!parent){
        throw new Meteor.Error("Parent Category not found");
      }else{
        addChildToParent(parent_category, category_name);
      }
    }

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
    if(category.child_categories && category.child_categories.length){
      throw new Meteor.Error("Category has child categories associated.");  
    }
    if(hasParent(category)){
      var parent_category = BudgetCategory.findOne({'name': category.parent_category, 
                                                    'owner': Meteor.userId()});
      if(parent_category){
        removeChildFromParent(parent_category.name, category.name);
      }
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
  }
});