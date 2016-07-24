Template.accounts.rendered = function() {

    // Initialize i-check plugin
    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    });

    // Show bank details according to type of account
    $(".bank-account").click(function() {
        $(".bank-related").slideDown("slow");
    });
    $(".no-bank").click(function() {
        $(".bank-related").slideUp("slow");
    });
    $('.bank-account').find('.iradio_square-green').find('.iCheck-helper').click(function() {
        $(".bank-related").slideDown("slow");
    });
    $('.no-bank').find('.iradio_square-green').find('.iCheck-helper').click(function() {
        $(".bank-related").slideUp("slow");
    });

    $("[data-toggle=tooltip]").tooltip();

};

//FUNCTIONS
function createAccount(accountName, type, bank, initialAmount) {
    if (!accountName) {
        toastr.error('You need to provide an account name');
        return false;
    }
    if (!type) {
        toastr.error('You need to select an account type');
        return false;
    }
    if (!initialAmount) {
        toastr.error('You need to provide an account name');
        return false;
    }
    Meteor.call("createAccount",
        accountName, type, bank, initialAmount,
        function(error, result) {
            if (error) {
                toastr.error(error.error);
            } else {
                toastr.success('Account created');
            }
        });
    return true;
}

function deleteAccount(accountName) {
    if (!accountName) {
        toastr.error('You need to provide an account name');
        return false;
    }
    Meteor.call("deleteAccount",
        accountName,
        function(error, result) {
            if (error) {
                toastr.error(error.error);
            } else {
                toastr.success('Account deleted');
            }
        });
    return true;
}

Template.accounts.events({
    "click #add_account": function(event, template) {
        // Prevent default browser form submit
        event.preventDefault();

        $("#create_account_panel").slideDown();
    },
    "click #cancel_add_account": function(event, template) {
        // Prevent default browser form submit
        event.preventDefault();

        $("#create_account_panel").hide();
        $("#create-account")[0].reset();
    },
    "click #delete_account": function(event, template) {
        // Prevent default browser form submit
        event.preventDefault();
        var accountName = this.name;

        swal({
            title: "Delete account!",
            text: "This will remove the account " + accountName + " from all your transactions!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, continue.",
            closeOnConfirm: true
        }, function() {
            deleteAccount(accountName);
        });

        
    },
    "submit #create-account": function(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        var accountName = event.target.account_name.value;
        var type = event.target.type.value;
        var bank = event.target.bank.value;
        var initialAmount = event.target.initial_amount.value;

        //add account
        if (createAccount(accountName, type, bank, initialAmount)) {
            $("#create_account_panel").hide();
            $("#create-account")[0].reset();
        }
    }
});