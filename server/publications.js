
Meteor.publish("budget_categories", function () {
	return BudgetCategory.find(
	    { owner: this.userId }
	);
});

Meteor.publish("budget", function () {
	return Budget.find(
	    { owner: this.userId }
	);
});

Meteor.publish("preferences", function () {
	return Preferences.find(
	    { owner: this.userId }
	);
});

Meteor.publish("account", function () {
	return Account.find(
	    { owner: this.userId }
	);
});