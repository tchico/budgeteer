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
    parents: function (type) {
        return getAllParentCategories(type);
    }
});

Template.category_detail.helpers({
    category_display_name: function () {
        return getCategoryDisplayName(this);
    },
    is_child_category: function () {
        return isCategoryLeaf(this);
    },
    category_childs: function(){
        return getAllChildOfParent(this.name);
    }
});





//ACCOUNTS
Template.accounts.helpers({
    accounts: function () {
        return getAccounts();
    },
    currencies: function() {
        return getCurrencyNames();
    },
    currency: function(currencyCode){
        return getCurrencyByCode(currencyCode).name;
    }
});

//TRANSACTIONS
Template.transactions.helpers({
    accounts: function () {
        return getAccounts();
    },
    transactions: function(accountId) {
        return getTransactionsOfAccount(accountId);
    },
    categories: function(){
        return getAllLeafCategories();
    },
    categoryName: function(categoryId){
        var category = getCategory(categoryId);
        return category.name;
    },
    isType: function(type, compareType){
        return type == compareType;
    }
});
