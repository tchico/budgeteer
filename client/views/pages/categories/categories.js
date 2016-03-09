Template.categories.rendered = function(){
	$(".select2_parent").select2({
	        placeholder: "Select a parent",
	        allowClear: true,
	});
};


//functions
function deleteCategory(categoryId){
  Meteor.call("deleteCategory", categoryId,
                  function(error,result){
                    if(error){
                      toastr.error(error.error);
                    }else{
                        toastr.success('Category deleted'); 
                    }
                  });
};

function createCategory(type, categoryName, parentCategoryName){
    //add category
    Meteor.call("addCategory", 
              categoryName, 
              parentCategoryName, 
              type, 
              function(error,result){
                if(error){
                    toastr.error(error.error);
                }else{
                    toastr.success('Category added');   
                }
          });
}

function removeCategoryFromBudgets(categoryName){
    //remove category
    Meteor.call("removeCategoryFromBudgets", 
          categoryName, 
          function(error,result){
            if(error){
                toastr.error(error.error);
            }
      });
}

function addCategoryToBudgets(categoryName){
    Meteor.call("addCategoryToBudgets", 
          categoryName, 
          function(error,result){
            if(error){
                toastr.error(error.error);
            }
      });
}

function hasBudgetData(categoryName){
    return Budget.find({category: categoryName, 
                        amount: {$ne: INITIAL_AMOUNT}}).count() > 0;
}

//CATEGORIES
Template.categories.events({
    "submit .form-inline-add-income": function (event, template) {
        // Prevent default browser form submit
        event.preventDefault();
 
        // Get value from form element
        var categoryName = event.target.category_name.value;
 
        //add category
        createCategory('Income', categoryName, categoryName);
        template.find(".form-inline-add-income").reset();
    },

    "submit .form-inline-add-expense": function (event, template) {
        // Prevent default browser form submit
        event.preventDefault();
 
        // Get value from form element
        var categoryName = event.target.category_name.value;
 
        //add category
        createCategory('Expense', categoryName, categoryName);
        template.find(".form-inline-add-expense").reset();
    },

    "submit .form-inline-add-sub-category": function (event, template) {
        // Prevent default browser form submit
        event.preventDefault();
        // Get value from form element
        var categoryName = event.target.category_name.value;
        var parentName = this.name;
        var type = this.type;
 
        // check first if the user wants to delete the budget data
        // for the parent category
        if(hasBudgetData(parentName)){
            swal({
                title: "Adding sub category to a category with budget!",
                text: "This will remove the category "+parentName+" from all your budgets!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, continue.",
                closeOnConfirm: false
            }, function () {
                removeCategoryFromBudgets(parentName);
                //add category
                createCategory(type, categoryName, parentName);
                template.find(".form-inline-add-sub-category").reset();
                swal("Completed!", 
                     "Category Created. Your category "+parentName+" was removed from budgets.", 
                     "success");
            });
        }else{
            //add category
            createCategory(type, categoryName, parentName);
            template.find(".form-inline-add-sub-category").reset();
        }
    },

    "click .delete": function () {
        var categoryName = this.name;
        var categoryId = this._id;
        var parentName = this.parent_category;
        var parent = BudgetCategory.findOne({name: parentName});
        var addParentToBudgets = (parent && 
                                  parent.child_categories && 
                                  parent.child_categories.length == 1);

        swal({
                title: "Delete category!",
                text: "This will remove the category "+categoryName+" from all your budgets!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, continue.",
                closeOnConfirm: !addParentToBudgets
            }, function () {
                removeCategoryFromBudgets(categoryName);
                deleteCategory(categoryId);
                //if this category is an only child then we must reintroduce the
                // parent category to the budgets
                if(addParentToBudgets){
                    addCategoryToBudgets(parentName);
                    swal("Parent category alert!",
                         "This removed the only sub-category of "+parentName+
                         ". "+parentName+" will now appear in the budgets screen.",
                         "success");
                }
            });
    }
  });