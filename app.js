//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    }
    Expense.prototype.getCalcPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
           sum = sum + curr.value; 
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return{
        addItem: function(type, des, val){
            
            var newItem, ID;
            
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 1;
            }
            
            //Create new item based on exp or inc type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);    
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //Pushing it into our data structure
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        },
        deleteItem: function(type, id){
            var ids, index;
            
            if(type){
                ids = data.allItems[type].map(function(curr){
                    return curr.id;
                });
                index = ids.indexOf(id);
            }
            
            
            if(index > -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){
            
            //Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            //Calculate the budget = income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage of the income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var perc = data.allItems.exp.map(function(curr){
               return curr.getCalcPercentage(); 
            });
            
            return perc;
        },
        getBudget: function(){
            return{
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    }
})();

//UI CONTROLLER
var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    var formatNumber = function(num, type){
        /*
        + or - before number
        exactly 2 deimal points
        comma seperating the thousands
        */

        var int, dec;

        
        num = Math.abs(num); //converting to number
        num = num.toFixed(2); //fixing the nmber to 2 decimal points
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    }
    
    var nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    }
    
    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, // Will be either exp or inc
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        addListItem: function(object, type){
            
            var html, element, newHTML;
            
            if(type === 'inc'){
                
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }else if(type === 'exp'){
                
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //2. Replace placeholder with some actual data
            newHTML = html.replace('%id%', object.id);
            newHTML = newHTML.replace('%description%', object.description);
            newHTML = newHTML.replace('%value%', formatNumber(object.value, type));
            
            //3.Insert the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            
        },
        deleteListItem: function(selectorID){
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields); //converting 'fields' to actual Array
            
            fieldsArr.forEach(function(element, index, array){
                element.value = "";
            });
            
            fieldsArr[0].focus();
            
        },
        
        displayBudget: function(obj){
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';    
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        displayPercentages: function(percentages){
            var fields;
            fields = document.querySelectorAll(DOMstrings.expPercentageLabel);
            
            nodeListForEach(fields, function(curr, index){
                if(percentages[index] > 0){
                    curr.textContent = percentages[index] + '%';
                }else{
                    curr.textContent = '---';
                }
               
            });
            
        },
        displayDate: function(){
            var now, month, months, year;
            
            now = new Date();
            
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Spetember', 'October', 'November', 'December'];
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function(){
            var fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(curr){
               curr.classList.toggle('red-focus'); 
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function(){
            return DOMstrings;
        }
    }
    
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListners = function(){
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event){

            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }
    
    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget()
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentages = function(){
        //1. Calculate and update Percentages
        budgetCtrl.calculatePercentages();

        //2. Get All percentages for exp
        percentages = budgetCtrl.getPercentages();

        //3. Display percentages for all exp
        UICtrl.displayPercentages(percentages); 
    }
    var ctrlAddItem = function(){
        
        var input, newItem, percentages;
        
        //1. Get input from UI
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
            //2. Add new Item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. calculate and Update budget
            updateBudget();
            
            //6. Calculate and Update percentages
            updatePercentages();
            
        }
    }
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);
        
        if(type){
            // 1. Delete the element form data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget on UI
            updateBudget();

            // 4. Calculate and update Percentages
        }
    }
    return{
        init: function(){
            console.log('Application has started.');
            UICtrl.displayDate();
            UICtrl.displayBudget(budgetCtrl.getBudget());
            setupEventListners();
        }
    }
    
})(budgetController, UIController);

//Starteing the Application
controller.init();