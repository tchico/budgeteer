//budget page; this holds the currently selected budget
DECIMAL_PLACES = 1;
Number.prototype.round = function() {
  return parseFloat( this.toFixed(DECIMAL_PLACES) );
};


months = {Jan: 1, Feb: 2, Mar: 3, Apr: 4, 
          May: 5, Jun: 6, Jul: 7, Aug: 8, 
          Sep: 9, Oct: 10, Nov:11, Dec: 12};

INITIAL_AMOUNT = {'Jan':0, 'Feb':0, 'Mar':0, 'Apr':0,
                 'May':0, 'Jun':0, 'Jul':0, 'Aug':0,
                 'Sep':0, 'Oct':0, 'Nov':0, 'Dec':0};

//functions
/**
 * Gets a list of all the category objects
 *
 * @return
 *   a cursor for category objects 
 */
getAllCategories = function (type){
    return BudgetCategory.find({type: type, owner: Meteor.userId()}, 
                               {sort: {parent_category: 1, name: 1}});
};

/**
 * Gets a list of all the category objects that are children
 *
 * @return
 *   a cursor for category objects 
 */
getAllLeafCategories = function (type){
  var filter = {$and: [
                      {$or: [{child_categories: {$exists: false}}, 
                             {child_categories: []}]},
                      {owner: Meteor.userId()}
                      ]};
  if(type){
    filter['type'] = type;
  }
  return BudgetCategory.find(
          filter, 
          {sort: {parent_category: 1, name: 1}});
};

/**
 * Determines if the param category is a leaf or not.
 * @param category object
 * @return
 *   boolean
 */
isCategoryLeaf = function(category){
  return category.child_categories == undefined || category.child_categories.length == 0;
};


/**
 * Gets the formatted display name of a category
 * composed as "parent > this_category"
 *
 * @return
 *   formatted string
 */
getCategoryDisplayName = function (category){
    if(category.name != category.parent_category){
      var parent = BudgetCategory.findOne({name: category.parent_category});
      return getCategoryDisplayName(parent) + ' > ' + category.name;  
    }else{
      return category.name;
    }
};

/**
 * Gets the name of the budget that is currently marked as favourite
 *
 * @return
 *   string
 */
getFavouriteBudget = function(){
  var fav_budget = Preferences.findOne({name: "favourite_budget"});
  return fav_budget ? fav_budget.value : undefined;
};

/**
 * Gets a list of all the budget names
 *
 * @return
 *   array of budget objects containing the name and favourite indicator.category
 *   example : [{fav: true, name: "2016"}, {name: "2017"}]
 */
getBudgetsList = function(){
  //get the distinct set of budget categories
  var distinctEntries = _.uniq(
          Budget.find({}, {sort: {name:1}, fields: {name:true}}).fetch().map(
              function(x) {
                return x.name;
              }), true);

  //mark the one that is the favourite
  var fav_budget = getFavouriteBudget();
  var budget_list = [];
  var b_set_fav = false;
  for(i in distinctEntries){
    var budget_entry = {'name': distinctEntries[i]};
    if(fav_budget && fav_budget == distinctEntries[i]){
      budget_entry['fav'] = b_set_fav = true;
    }
    if((i == distinctEntries.length - 1) && !b_set_fav){
      //if we haven't found a fav so far then set this guy as the fav.b_set_fav
      budget_entry['fav'] = true
    }
    budget_list.push(budget_entry);
  }
  return budget_list;
};

/**
 * DELETE
 */
getBudgetForCategory = function(){
  return Budget.find({name: selectedBudget, category: ""});
};


/**
 * builds an array of zeros
 *
 * @return
 *   array of 12 zeros
 */
function getMonthsZeroedArray(){
  return Array.apply(null, new Array(12)).map(Number.prototype.valueOf,0);
}

/**
 * gets the array with the rows of the aggregated table.
 *
 * @return
 *   array of arrays
 */
getAggregatedBudgetTable = function(budgetName){
    var aggregation = [];
    //aggregate the values of the income categories
    var income_budget_lines = getBudgetRows('Income', budgetName);
    var agg_i = getMonthsZeroedArray();
    agg_i.unshift('Income');
    income_budget_lines.forEach(function (b){
        for(m in b.amount){
          if(!agg_i[months[m]]) agg_i[months[m]] = 0;
          agg_i[months[m]] += parseFloat(b.amount[m]).round();
        }
      }
    );
    aggregation.push(agg_i);

    var expense_budget_lines = getBudgetRows('Expense', budgetName);
    var agg_e = getMonthsZeroedArray();
    agg_e.unshift('Expense');
    expense_budget_lines.forEach(function (b){
        for(m in b.amount){
          if(!agg_e[months[m]]) agg_e[months[m]] = 0;
          agg_e[months[m]] += parseFloat(b.amount[m]).round();
        }
      }
    );
    aggregation.push(agg_e);


    //calculate the balance
    var agg_b = ['Balance'];
    for(i = 1; i < agg_i.length; i++){
      agg_b[i] = (agg_i[i] - agg_e[i]).toFixed(DECIMAL_PLACES);
      agg_i[i] = agg_i[i].toFixed(DECIMAL_PLACES);
      agg_e[i] = agg_e[i].toFixed(DECIMAL_PLACES);
    }
    aggregation.push(agg_b);

    return aggregation;
};    

/**
 * Gets the Budget Objects where they have type and budgetName.
 *
 * @return
 *   Collection cursor
 */
getBudgetRows = function(type, budgetName){
  var categories = getAllLeafCategories(type);
  var categories_names = [];
  categories.forEach(function (cat) {
    categories_names.push(cat.name);
  });

  return Budget.find({category: {$in: categories_names},
                      name: budgetName});
};


/**
 * Gets the Accounts Objects 
 * @return
 *   Collection cursor
 */
getAccounts = function(){
  return Account.find({});
};






