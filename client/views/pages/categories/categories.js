Template.categories.rendered = function(){
	$(".select2_parent").select2({
	        placeholder: "Select a parent",
	        allowClear: true,
	});

	//init category tree
    /*
	$('#jstree_categories').jstree({
        'core' : {
            'check_callback' : true
        },
        'plugins' : [ 'types', 'dnd' ],
        'types' : {
            'default' : {
                'icon' : 'fa fa-folder'
            },
            'child' : {
                'icon' : 'fa fa-file-text-o'
            }
        }
    }).bind('move_node.jstree',function(event,data){
        var old_parent = data.new_instance._model.data[data.old_parent].text;
        var new_parent = data.new_instance._model.data[data.parent].text;
        var category_name = data.node.text;
        
        try{
            Meteor.call("moveNode", category_name, old_parent, new_parent);
        }catch(err){
            console.log(err);
            toastr.error('Error trying to move the category:'+err.message);
            jstree.rollback(data.rlbk);
        }
    });
    */
};


//functions
function deleteCategory(categoryId){
  Meteor.call("deleteCategory", categoryId,
                  function(error,result){
                    if(error){
                      toastr.error(error.error);
                    }else{
                        refreshTree();
                        toastr.success('Category deleted'); 
                    }
                  });
};

function refreshTree(){
    $('#jstree_categories').jstree("refresh");
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
                    refreshTree();
                    toastr.success('Category added');   
                }
          });
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
 
        //add category
        createCategory(type, categoryName, parentName);
        template.find(".form-inline-add-sub-category").reset();
    },

    "click .delete": function () {
      deleteCategory(this._id);
    },

    "click .edit": function () {
      deleteCategory(this._id);
    },


  });