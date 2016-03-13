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
	        ordering: false,
	        "columnDefs": [
	            { "visible": false, "targets": 13 }
	        ],
	        "drawCallback": function ( settings ) {
	            var api = this.api();
	            var rows = api.rows( {page:'current'} ).nodes();
	            var last=null;
	 
	            api.column(13, {page:'current'} ).data().each( function ( group, i ) {
	                if ( last !== group ) {
	                    $(rows).eq( i ).before(
	                        '<tr class="group"><td colspan="13">'+group+'</td></tr>'
	                    );
	 
	                    last = group;
	                }
	            } );
	        }
	    });

	    drawBudgetTable(budget.name);
	};

	
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

	        toastr.info('Budget '+ selectedBudget +' opened.');
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

    	"click #open_delete_modal": function (event, template) {
	        // Prevent default browser form submit
	        event.preventDefault();
	 		
	        // Get value from form element
        	var budgetName = this.name;

	        $('#delete_modal-'+budgetName).modal('show');
    	},
	}
);


Template.deleteModalTemplate.rendered = function(){
	// Move modal to body
    // Fix Bootstrap backdrop issu with animation.css
    $('#delete_budget').click(function(){
    	$('#delete_modal').modal('hide');
    });
}

Template.deleteModalTemplate.events(
{
	"click #delete_budget": function (event, template) {
        // Prevent default browser form submit
        event.preventDefault();
 
        // Get value from form element
        var budgetName = template.data;
        $('#delete_modal-'+budgetName).modal('hide');
        Meteor.call("deleteBudget", budgetName.toString(),
              function(error,result){
                if(error){
                  	toastr.error(error.error);
                }else{
                    toastr.warning('Budget deleted'); 
                }
                //hide the modal backdrop because it's not being hidden by the 
                //modal('hide')
                $('.modal-backdrop').hide();
                $('body').removeClass('modal-open');
                //because the deleted budget will still be the active one
                //then we must active the favourite one
                var tab_name = $('.fa-star').parent('.open_budget').attr('href');
                $('.fa-star').parent('.open_budget').parent().toggleClass('active');
                $(tab_name).toggleClass('active');
              });
        
	}
});

