if(Meteor.isServer) {
	BudgetCategory.allow({
            insert: function () {
                return true;
            },
            update: function () {
                return true;
            },
            remove: function () {
                return true;
            }
        }
	);
    Budget.allow({
            insert: function () {
                return true;
            },
            update: function () {
                return true;
            },
            remove: function () {
                return true;
            }
        }
    );
    Account.allow({
            insert: function () {
                return true;
            },
            update: function () {
                return true;
            },
            remove: function () {
                return true;
            }
        }
    );
    Transaction.allow({
            insert: function () {
                return true;
            },
            update: function () {
                return true;
            },
            remove: function () {
                return true;
            }
        }
    );
    Preferences.allow({
            insert: function () {
                return true;
            },
            update: function () {
                return true;
            },
            remove: function () {
                return true;
            }
        }
    );

    Meteor.publish("budget_categories", function () {
        return BudgetCategory.find(
            {owner: this.userId}
        );
    });

    Meteor.publish("budget", function () {
        return Budget.find(
            {owner: this.userId}
        );
    });

    Meteor.publish("preferences", function () {
        return Preferences.find(
            {owner: this.userId}
        );
    });

    Meteor.publish("account", function () {
        return Account.find(
            {owner: this.userId}
        );
    });

    Meteor.publish("transactions", function () {
        return Transaction.find(
            {owner: this.userId}
        );
    });
}
