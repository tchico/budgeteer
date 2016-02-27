//budget.js
Template.budget.rendered = function(){
    $('.dataTables-example').dataTable({
        responsive: true,
        "dom": 'T<"clear">lfrtip',
    });

    /* Init DataTables */
    var oTable = $('#editable').dataTable();

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
};


//FUNCTIONS
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
	        template.find("#name").reset();
    	},
	}
);

