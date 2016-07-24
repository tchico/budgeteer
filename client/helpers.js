//helpers
Template.registerHelper('arrayify', function (obj) {
    result = [];
    for (var key in obj) result.push({name: key, value: obj[key]});
    return result;
});

Template.navigation.helpers({
    b_user: function () {
        var emails = Meteor.user().emails;
        if (emails.length) {
            return Meteor.user().emails[0]['address'];
        }
        return Meteor.user().username;
    }
});

//CATEGORIES
Template.categories.helpers({
    categories_income: function () {
        return getAllCategories('Income');
    },
    categories_expense: function () {
        return getAllCategories('Expense');
    },
    parents: function () {
        return BudgetCategory.find({owner: Meteor.userId()}, {sort: {name: 1}});
    }
});

Template.category_detail.helpers({
    category_display_name: function () {
        return getCategoryDisplayName(this);
    },
    is_child_category: function () {
        return isCategoryLeaf(this);
    }
});


//BUDGET
Template.budget.helpers({
    categories: function (type, budgetName) {
        return getBudgetRows(type, budgetName);
    },
    category_display_name: function () {
        var category = BudgetCategory.findOne({name: this.category});
        return getCategoryDisplayName(category);
    },
    budget_list: getBudgetsList,
    summary: function (budgetName) {
        return getAggregatedBudgetTable(budgetName);
    },
    summary_column: function (value) {
        var css_class = "text-success";
        if (value < 0) {
            css_class = "text-danger";
        }
        return '<td class="' + css_class + '">' + value + '</td>';
    }
});


//ACCOUNTS
Template.accounts.helpers({
    accounts: function () {
        return getAccounts();
    },
    currencies: function() {
        return getCurrencyNames();
    }
});
