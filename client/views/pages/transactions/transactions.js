Template.transactionTable.onCreated(function () {

    // 1. Initialization

    var instance = this;

    // 2. Autorun
    instance.autorun(function () {

        // subscribe to the posts publication
        var subscription = instance.subscribe('transactions');

        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            console.log("> Received posts. \n\n")
        } else {
            console.log("> Subscription is not ready yet. \n\n");
        }
    });

    // 3. Cursor

    instance.transactions = function(accountId) {
        return getTransactionsOfAccount(accountId);
    }

});

Template.transactionTable.onRendered(function () {
    var template = this;

    template.subscribe('transactions', function () {
        // Wait for the data to load using the callback
        Tracker.afterFlush(function () {
            // Use Tracker.afterFlush to wait for the UI to re-render
            loadTransactionTemplates();
        });
    });
});



//TRANSACTIONS HELPERS
Template.transactions.helpers({
    accounts: function () {
        return getAccounts();
    },
    categories: function(){
        return getAllLeafCategories();
    }
});

Template.transactionTable.helpers({
        transactionsOfAccount: function (accountId) {
            return Template.instance().transactions(accountId);
        },
        categoryName: function(categoryId){
            var category = getCategory(categoryId);
            return category.name;
        },
        isType: function(type, compareType){
            return type == compareType;
        }
    }
);


//FUNCTIONS
function loadTransactionTemplates() {

    // Initialize i-check plugin
    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    });

    $("[data-toggle=tooltip]").tooltip();

    $('.input-group.date').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true
    });


    $('#transaction_amount').maskMoney();
    $("#category").select2({
        placeholder: "Select a category",
        allowClear: true
    });
    $("#account_id").select2({
        placeholder: "Select an account",
        allowClear: true
    });


    //initialize the data table
    var accountList = getAccounts().fetch();
    for(i in accountList) {
        var account = accountList[i];

        loadTransactionTemplate(account.name);
    }
}

function loadTransactionTemplate(templateName){
    //initialize the data table
    $('#editable-' + templateName).DataTable({
        retrieve: true,
        responsive: true,
        dom: 'T<"clear">lfrtip',
        paging: true,
        searching: true,
        info: false,
        ordering: true
    });

    drawTransactionTable(templateName);
}

function drawTransactionTable(accountName){
    var oTable = $('#editable-'+accountName).DataTable();

    /* Apply the jEditable handlers to the table */
    oTable.$('.cat_editable').editable(
        function(value, settings) {
            /* Get the position of the current data from the node */
            var table = $('#editable-'+accountName).DataTable();
            var aPos = $('#editable-'+accountName).dataTable().fnGetPosition( this );
            var month = table.column( aPos[1] ).header().textContent;
            var idDisplay = table.row(aPos[0]).data()[0];
            var id = idDisplay.split("&gt;").pop().trim();
            console.log('Account '+ accountName +
                ': Set amount '+ value + ' on transction ' + id );

            Meteor.call('updateTransactionAmount',
                accountName,
                id,
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
                $('#editable-'+accountName).dataTable().fnDraw();
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
}

function createTransaction(date, category, description, type, account, amount){
    console.log("creating the transaction ("
            +date+", "
            +category+", "
            +description+", "
            +type+", "
            +account+", "
            +amount+")");

    if(!date || !category || !description || !type || !account || !amount){
        toastr.error('You need to provide all fields for a transaction');
        return;
    }

    Meteor.call("createTransaction", date, category, description, type, account, amount,
        function(error,result){
            if(error){
                toastr.error(error.error);
            }else{
                toastr.success('Transaction created');
                $("#create-transaction")[0].reset();
            }
        });
}


function deleteTransaction(transactionId) {
    if (!transactionId) {
        toastr.error('You need to provide an transaction Id');
        return false;
    }
    Meteor.call("deleteTransaction",
        transactionId,
        function(error, result) {
            if (error) {
                toastr.error(error.error);
            } else {
                toastr.success('Transaction deleted');
            }
        });
    return true;
}


Template.transactions.events({
    "click #add_transaction": function(event, template) {
        // Prevent default browser form submit
        event.preventDefault();

        $("#create_transaction_panel").slideDown();
    },
    "click #cancel_add_transaction": function(event, template) {
        // Prevent default browser form submit
        event.preventDefault();

        $("#create_transaction_panel").hide();
        $("#create-transaction")[0].reset();
    },
    "submit #create-transaction": function(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        var date = event.target.date.value;
        var category = event.target.category.value;
        var type = event.target.type.value;
        var account = event.target.account_id.value;
        var amount = event.target.transaction_amount.value;
        var description = event.target.description.value;

        //add account
        createTransaction(date, category, description, type, account, amount);
    },
    "click #transaction-edit": function (event) {
        // Prevent default browser form submit
        event.preventDefault();


    },
    "click #transaction-delete": function (event) {
        // Prevent default browser form submit
        event.preventDefault();

        var transactionDescription = this.description;
        var transactionId = this._id;

        swal({
            title: "Delete transaction!",
            text: "This will remove the transaction with description: " + transactionDescription + " !",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, continue.",
            closeOnConfirm: true
        }, function() {
            deleteTransaction(transactionId);
        });
    },
    "click .collapse-link": function (event, template) {
        // Prevent default browser form submit
        event.preventDefault();

        loadTransactionTemplate("kbc");
    }
});