
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