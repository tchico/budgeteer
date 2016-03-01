//budget.js
Template.budget.rendered = function(){
	//initialize the data table
	$('#editable').dataTable({
		responsive: true,
        dom: 'T<"clear">lfrtip',
		columnDefs: [ {
	      targets: '_all',
	      className: 'cat_editable'
	    } ]
    });

    
    drawBudgetTable();
};



//FUNCTIONS
function drawBudgetTable(){
    var oTable = $('#editable').DataTable();
	
	/* Apply the jEditable handlers to the table */
    oTable.$('.cat_editable').editable(function(value, settings) { 
    		/* Get the position of the current data from the node */
			var aPos = oTable.fnGetPosition( this );
		    return(value);
		},
		{	
			"callback": function( sValue, y ) {
                /* Redraw the table from the new data on the server */
                oTable.fnDraw();
            },
        	"width": "90%",
        	"height": "100%"
    });

    oTable.draw();
};


function createBudget(budgetName){
	if(!budgetName){
		toastr.error('You need to provide a budget name');
		return;
	}
	Meteor.call("createBudget", budgetName,
                  function(error,result){
                    if(error){
                      toastr.error(error.error);
                    }else{
                        toastr.success('Budget created'); 
                    }
                  });
};

function getBudget(budgetName){
	if(!budgetName){
		toastr.error('You need to provide a budget name');
		return;
	}
	return Budget.find({name: budgetName.toString(), owner: Meteor.userId()}).fetch();
};

function getBudgetCategory(budget){
	return BudgetCategory.findOne({name: budget.category, owner: Meteor.userId()});
};

function openBudget(budgetName){
	var budgetCategories = getBudget(budgetName);
	var oTable = $('#editable').DataTable();
	//lean the table before re-populating it
	oTable.rows().remove().draw();

    for(i in budgetCategories){
    	var categoryBudget = budgetCategories[i];
    	var amounts = categoryBudget.amount;
    	var category = getBudgetCategory(categoryBudget);
		var displayName = getCategoryDisplayName(category);
    	oTable.row.add([displayName,
    					amounts.Jan,
    					amounts.Feb,
    					amounts.Mar,
    					amounts.Apr,
    					amounts.May,
    					amounts.Jun,
    					amounts.Jul,
    					amounts.Aug,
    					amounts.Sep,
    					amounts.Oct,
    					amounts.Nov,
    					amounts.Dec
    					]);
	}
	drawBudgetTable();
};

function getFavouriteBudget(){
	return Budget.findOne({favourite: true, 
						   owner: Meteor.userId()});
};



//EVENTS
Template.budget.events(
	{
		"submit .add-budget": function (event, template) {
	        // Prevent default browser form submit
	        event.preventDefault();
	 
	        // Get value from form element
	        var budgetName = event.target.name.value;
	 
	        //add category
	        createBudget(budgetName);
	        template.find(".add-budget").reset();
    	},
    	"click #open_budget": function (event, template) {
	        // Prevent default browser form submit
	        event.preventDefault();
	 
	        // Get value from form element
	        var budgetName = this.name;


	        var oTable = $('#editable').DataTable();

	        openBudget(budgetName);

	        toastr.info('Budget '+ budgetName +' opened.');
    	},
    	"click #delete_budget": function (event, template) {
	        // Prevent default browser form submit
	        event.preventDefault();
	 
	        // Get value from form element
	        var budgetName = this.name;

	        Meteor.call("deleteBudget", budgetName.toString(),
                  function(error,result){
                    if(error){
                      toastr.error(error.error);
                    }else{
                        toastr.success('Budget deleted'); 
                    }
                  });
    	},

    	"click #favourite_budget": function (event, template) {
	        // Prevent default browser form submit
	        event.preventDefault();
	 
	        // Get value from form element
	        var budgetName = this.name;

	        Meteor.call("favouriteBudget", budgetName,
              function(error,result){
                if(error){
                  	toastr.error(error.error);
                }else{
                	toastr.success('Budget set as favourite.'); 
                }
            });
    	},
	}
);

