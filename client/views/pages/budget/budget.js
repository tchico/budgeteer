//budget.js
Template.budget.rendered = function(){
	var budgetList = getBudgetsList();
	var favourite_budget = undefined;
	for(i in budgetList){
		var budget = budgetList[i];

		//store the favourite
		if(budget.fav){
			favourite_budget = budget.name;
		}

		//initialize the data table
		$('#editable-'+budget.name).dataTable({
			responsive: true,
	        dom: 'T<"clear">lfrtip',
		    paging:   false,
		    searching: false,
	        info:     false,
	        ordering: false
	    });

	    drawBudgetTable(budget.name);
	};

	//openBudget(favourite_budget);
};



//FUNCTIONS
function drawBudgetTable(budgetName){
    var oTable = $('#editable-'+budgetName).DataTable();
	
	/* Apply the jEditable handlers to the table */
    oTable.$('.cat_editable').editable(
    	function(value, settings) { 
    		/* Get the position of the current data from the node */
    		var table = $('#editable-'+budgetName).DataTable();
			var aPos = $('#editable-'+budgetName).dataTable().fnGetPosition( this );
			var month = table.column( aPos[1] ).header().textContent;
			var categoryDisplayName = table.row(aPos[0]).data()[0];
			var category = categoryDisplayName.split("&gt;").pop().trim();
			console.log('Budget '+ budgetName +
						': Set value '+ value + ' on Month ' + month + ' category ' + category);
    		
			Meteor.call('updateBudgetCategoryAmount', 
						budgetName,
						category,
						month,
						value,
						function(error,result){
			                if(error){
			                  toastr.error(error.error);
			                }else{
				              //do nothing
			                }
			              }
			           );

		    return value;
		},
		{	
			callback: function( sValue, y ) {
                /* 
                because reactive will append the value in the cell
                This is necessary to clean out the value that jeditable
                left in the cell. Otherwise the value would appear duplicated.
				*/
                $(this).text('');
                /* Redraw the table from the new data on the server */
                $('#editable-'+budgetName).dataTable().fnDraw();
            },
            onsubmit: function(settings, td) {
		        var input = $(td).find('input');
		        var original = input.val();
		        if ($.isNumeric(original)) {
		            console.debug("Validation correct");
		            return true;
		        } else {
		            console.debug("Validation failed. Ignoring");
		            td.reset();
		            toastr.error("Only numerical values");
		            return false;
		        }
		    },
        	"width": "90%",
        	"height": "100%",
        	"placeholder" : ""
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
	//get the budget categories and amounts
	var budgetCategories = getBudget(budgetName);
	if(!budgetName){
		console.error('Unable to open the budget');
	}

	//clean the table before re-populating it
	var oTable = $('#editable-'+budgetName).DataTable();
	oTable.rows().remove().draw();

    for(i in budgetCategories){
    	var categoryBudget = budgetCategories[i];
    	var amounts = categoryBudget.amount;
    	var category = getBudgetCategory(categoryBudget);
    	if(isCategoryLeaf(category)){
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
	}
	drawBudgetTable(budgetName);
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
    	"click .open_budget": function (event, template) {
	        // Prevent default browser form submit
	        event.preventDefault();
	 
	        // Get value from form element
	        var selectedBudget = this.name;

	        //openBudget(selectedBudget);

	        toastr.info('Budget '+ selectedBudget +' opened.');
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
                        //openBudget(getFavouriteBudget());
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

