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
			columnDefs: [ 
				{targets: [1,2,3,4,5,6,7,8,9,10,11,12], 	      
				 type: "num",
		      	 className: 'cat_editable'
		    } ],
		    paging:   false,
		    searching: false,
	        info:     false
	    });

	    drawBudgetTable(budget.name);
	}

	openBudget(favourite_budget);
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
			var category = categoryDisplayName.split(">").pop().trim();
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

		    return(value);
		},
		{	
			callback: function( sValue, y ) {
                /* Redraw the table from the new data on the server */
                $('#editable-'+budgetName).dataTable().fnDraw();
            },
            onsubmit: function(settings, td) {
		        var input = $(td).find('input');
		        var original = input.val();
		        if ($.isNumeric(original)) {
		            console.log("Validation correct");
		            return true;
		        } else {
		            console.log("Validation failed. Ignoring");
		            td.reset();
		            toastr.error("Only numerical values");
		            return false;
		        }
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
	//get the budget categories and amounts
	var budgetCategories = getBudget(budgetName);

	//set the current select budget
	selectedBudget = budgetName;

	//clean the table before re-populating it
	var oTable = $('#editable-'+selectedBudget).DataTable();
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
	drawBudgetTable(selectedBudget);
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
	        selectedBudget = this.name;

	        var oTable = $('#editable-'+selectedBudget).DataTable();

	        openBudget(selectedBudget);

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

