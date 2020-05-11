// Storage Controller
const StorageController = (function() {
    // Public methods
    return {
        // Store Item in the localStorage
        storeItem: function(item) {
            let items;
            // Check if any items in localStorage
            if(localStorage.getItem('items') === null) {
                items = [];
                // Push new item
                items.push(item)
                // Set localStorage
                localStorage.setItem('items', JSON.stringify(items))
            } else {
                // Parse the items array to be an object
                items = JSON.parse(localStorage.getItem('items'))

                // push new item
                items.push(item)

                // Turn it back to string
                localStorage.setItem('items', JSON.stringify(items))
            }
        },
        getItems: function() {
            let items;
            if(localStorage.getItem('items') === null) {
                items = []
            } else {
                items = JSON.parse(localStorage.getItem('items'))
            }
            return items
        },
        updateItem: function(updatedItem) {
            // Get items from storage
            let items = JSON.parse(localStorage.getItem('items'))
            // Update the item
            items.map((item, index) => {
                if(updatedItem.id === item.id) {
                    items.splice(index, 1, updatedItem)
                }
            })
            // Save back to localStorage
            localStorage.setItem('items', JSON.stringify(items))
        },
        deleteItem: function(id) {
            let items = JSON.parse(localStorage.getItem('items'))
            if(items.length > 0) {
                items = items.map(item => item).filter(item => item.id !== id)
            }
            localStorage.setItem('items', JSON.stringify(items))
        },
        clearAllItems: function() {
            localStorage.removeItem('items')
        }
    }
})()


// Item Controller
const ItemController = (function() {
    const Item = function(id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    // Data Structure / State
    const data = {
        items: StorageController.getItems(),
        currentItem: null,
        totalCalories: 0
    }

    return {
        getItems: function() {
            return data.items;
        },
        addItem: function(name, calories) {
            // Create ID
            let ID;
            if(data.items.length > 0){
                ID = data.items[data.items.length - 1].id + 1
            } else {
                ID = 0;
            }

            const parsedCalories = parseInt(calories);
            // Create new item
            newItem = new Item(ID, name, parsedCalories)

            data.items.push(newItem)

            return newItem;
        },
        itemNameValidation: function(name) {
            let validate = false;
            let reg = /^[A-Za-z ]{2,30}$/;
            if(reg.test(name)){
                validate = true
            }
            return validate
        },
        itemCaloriesValidation: function(calories) {
            let validate = false;
            let reg = /^[0-9]{2,10}$/
            if(reg.test(calories)){
                validate = true
            }
            return validate
        },
        getTotalCalories: function(){
            if(data.items.length >= 1) {
                const calories = data.items.map(item => item.calories).reduce((result, item) => result + item)
                data.totalCalories = calories
            }
              return data.totalCalories
        },
        getItemById: function(id) {
            const item = data.items.filter(item => item.id === id)
            // filter function will return an array, we want to get the first item in that array
            return item[0]
        },
        getCurrentItem: function() {
            return data.currentItem;
        },
        setCurrentItem: function(item){
            data.currentItem = item
        },
        updateItem: function(name, calories){
            // Parse input
            calories = parseInt(calories)

            let updatedItem = null;

            data.items.forEach(item => {
                if(item.id === data.currentItem.id) {
                    item.name = name;
                    item.calories = calories;
                    updatedItem = item
                }
            })
            return updatedItem
        },
        clearAllItems: function() {
            data.items = []
        },
        deleteItem: function(id) {
            let deletedItem = null;
            data.items = data.items.map(item => item).filter(item => {
                if(item.id === id) {
                    deletedItem = item
                }
                return item.id !== id
            })
            console.log(deletedItem)
            data.totalCalories -= deletedItem.calories
            return deletedItem
        },
        logData: function() {
            return data;
        }
    }
})();

// UI Controller
const UIController = (function() {
    const UISelectors = {
        itemList: '#item-list',
        items: '#item-list li',
        btnAdd: '.add-btn',
        btnUpdate: '.update-btn',
        btnDelete: '.delete-btn',
        btnBack: '.back-btn',
        btnClear: '.clear-btn',
        inItemNames: '#item-name',
        inItemCalories: '#item-calories',
        cardContent: '.card-content',
        addForm: '#add-form',
        totalCalories: '.total-calories'
    }
    

    // Public methods
    return {
        populateItemList: function(items){
            let HTMLTemplate = `<li class="collection-header"><h5>Food Items Consumed</h5></li>`;
            items.forEach(function(item) {
                HTMLTemplate += `
                <li class="collection-item" id="item-${item.id}">
                    <strong>${item.name}: </strong><em>${item.calories} Calories</em>
                    <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
                </li>
                `;
            })
            document.querySelector(UISelectors.itemList).innerHTML = HTMLTemplate;
        },
        getSelectors: function() {
            return UISelectors
        },
        getItemInput: function() {
            return {
                name: document.querySelector(UISelectors.inItemNames).value,
                calories: document.querySelector(UISelectors.inItemCalories).value
            }
        },
        addItemToForm: function() {
            console.log(ItemController.getCurrentItem())
            document.querySelector(UISelectors.inItemNames).value = ItemController.getCurrentItem().name
            document.querySelector(UISelectors.inItemCalories).value = ItemController.getCurrentItem().calories
            UIController.editState();
        },
        addListItem: function(item) {
            // Show list
            document.querySelector(UISelectors.itemList).style.display = 'block'
            // Create li element
            const li = document.createElement('li');
            // Add class
            li.className = 'collection-item'
            // Add ID
            li.id = `item-${item.id}`
            // Add HTML
            li.innerHTML = 
            `<strong>${item.name}: </strong><em>${item.calories} Calories</em>
            <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>`
            // Insert item
            document.querySelector(UISelectors.itemList).insertAdjacentElement('beforeend', li)
        },
        updateListItem: function(item) {
            let listItems = document.querySelectorAll(UISelectors.items);
            // Turn node list into array
            listItems = Array.from(listItems)
            listItems.forEach(function(listItem) {
                const itemID = listItem.getAttribute('id')

                if(itemID === `item-${item.id}`) {
                    document.querySelector(`#${itemID}`).innerHTML = `
                        <strong>${item.name}: </strong><em>${item.calories} Calories</em>
                        <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
                    `
                }
            })
        },
        removeItems: function() {
           let listItems = document.querySelectorAll(UISelectors.items)
           listItems = Array.from(listItems)
           listItems.forEach(item => {
               item.remove()
           })
        },
        deleteListItem: function(id) {
            const itemID = `#item-${id}`
            const itemElement = document.querySelector(itemID)
            itemElement.remove();
        },
        refreshForm: function() {
            document.querySelector(UISelectors.inItemNames).value = ''
            document.querySelector(UISelectors.inItemCalories).value = ''
        },
        hideList: function() {
            document.querySelector(UISelectors.itemList).style.display = 'none';
        },
        showAlert: function() {
            // Select card title to append alert
            const card = document.querySelector(UISelectors.cardContent)
            // Create alert
            const alert = document.createElement('div');
            // Add ClassName
            alert.className = 'alert red'
            // Add html
            alert.innerHTML = `
            <p><i class="fa fa-exclamation-circle"></i>Please check your input.</p>
            `
            const form = document.querySelector(UISelectors.addForm)

            // Add alert to DOM
            card.insertBefore(alert, form);

             // Clear alert after 3 seconds
            setTimeout(function(){
                document.querySelector('.alert').remove()
            }, 3000)
        },
        displayInvalidInput: function(targetInput){
            const inName = document.querySelector(UISelectors.inItemNames);
            const inCalories = document.querySelector(UISelectors.inItemCalories);
            if(targetInput === 'name'){
                inName.className = 'invalid';
            }
            else if(targetInput === 'calories') {
                inCalories.className = 'invalid';
            }
        },
        removeInvalidInput: function(targetInput) {
            const inName = document.querySelector(UISelectors.inItemNames);
            const inCalories = document.querySelector(UISelectors.inItemCalories);
            if(targetInput === 'name'){
                inName.classList.replace('invalid', 'valid')
            }
            else if(targetInput === 'calories') {
                inCalories.classList.replace('invalid', 'valid');
            }
        },
        showTotalCalories: function(totalCalories){
            document.querySelector(UISelectors.totalCalories).textContent = totalCalories
        },
        initState: function() {
            UIController.refreshForm();
            // When we are in the init state, we want to hide all the button except for the add button
            document.querySelector(UISelectors.btnAdd).style.display = 'inline'
            document.querySelector(UISelectors.btnUpdate).style.display = 'none'
            document.querySelector(UISelectors.btnDelete).style.display = 'none'
            document.querySelector(UISelectors.btnBack).style.display = 'none'
        },
        editState: function() {
            // When we are in the init state, we want all the buttons to be visible except for the add button
            document.querySelector(UISelectors.btnAdd).style.display = 'none'
            document.querySelector(UISelectors.btnUpdate).style.display = 'inline'
            document.querySelector(UISelectors.btnDelete).style.display = 'inline'
            document.querySelector(UISelectors.btnBack).style.display = 'inline'
        }
    }
    
})();

// App Controller
const App = (function(ItemController, UIController, StorageControler) {
    // Load Event Listeners
    const loadEventListeners = function() {
        const UISelectors = UIController.getSelectors();

        // Add Item Click Event
        document.querySelector(UISelectors.btnAdd).addEventListener('click', itemAddSubmit)

        // Update Item Click Event
        document.querySelector(UISelectors.itemList).addEventListener('click', itemUpdateClick)

        // Update Item Submit
        document.querySelector(UISelectors.btnUpdate).addEventListener('click', itemUpdateSubmit)

        // Back button click
        document.querySelector(UISelectors.btnBack).addEventListener('click', clearInput)

        // Delete button click
        document.querySelector(UISelectors.btnDelete).addEventListener('click', itemDeleteSubmit)

        // Clear all items click
        document.querySelector(UISelectors.btnClear).addEventListener('click', clearAllClick)

        // Disable submit on enter
        document.addEventListener('keypress', function(e) {
            if(e.keycode === 13 || e.which === 13){
                e.preventDefault()
                return false
            }
        })
        // Add Blur Events to validate input
        document.querySelector(UISelectors.inItemNames).addEventListener('blur', fieldsValidation)
        document.querySelector(UISelectors.inItemCalories).addEventListener('blur', fieldsValidation)
    }

    const itemAddSubmit = function(e) {
        const inputData = UIController.getItemInput()
        const fieldsValidated = fieldsValidation()
        
        // Check for name and calorie input
        if(inputData.name !== '' && inputData.calories !== '' && fieldsValidated) {
            // Add item to Data Structure
            const newItem = ItemController.addItem(inputData.name, inputData.calories)
            // Get total calories
            const totalCalories = ItemController.getTotalCalories();
            UIController.showTotalCalories(totalCalories)

            // Add item to UI
            UIController.addListItem(newItem);

            // Refresh the form
            UIController.refreshForm();

             // Store in the local storage
             StorageController.storeItem(newItem)
        } else {
            UIController.showAlert();
        }
        e.preventDefault()
    }

    const fieldsValidation = function() {
        const inputData = UIController.getItemInput()
        const nameValid = ItemController.itemNameValidation(inputData.name);
        const caloriesValid = ItemController.itemCaloriesValidation(inputData.calories);
        // Case invalid
        if (!nameValid && !caloriesValid){
            UIController.displayInvalidInput('name')
            UIController.displayInvalidInput('calories')
        } 
        else if (!nameValid && caloriesValid) {
            UIController.displayInvalidInput('name')
            UIController.removeInvalidInput('calories')
        }
        else if(nameValid && !caloriesValid) {
            UIController.displayInvalidInput('calories')
            UIController.removeInvalidInput('name')
        } else {
            UIController.removeInvalidInput('name')
            UIController.removeInvalidInput('calories')
        }
        return (nameValid && caloriesValid)
    }

    // Change to updateState
    const itemUpdateClick = function(e) {
        // Target the edit icon
        if(e.target.classList.contains('edit-item')){
            // Get the list id
            const listId = e.target.parentNode.parentNode.id
            // Get the actual id
            const id = parseInt(listId.split('-')[1])
            // Get Item By Id
            const item = ItemController.getItemById(id)
            // Set current item
            ItemController.setCurrentItem(item)
            // Add item to form
            UIController.addItemToForm();         
        }
        e.preventDefault()
    }

    // Update item
    const itemUpdateSubmit = function(e) {
        // Get input
        const input = UIController.getItemInput();
        const fieldsValidated = fieldsValidation()

        // Check for name and calorie input
        if(input.name !== '' && input.calories !== '' && fieldsValidated) {
            // Update Item
            const updatedItem = ItemController.updateItem(input.name, input.calories);

            // Update UI list item
            UIController.updateListItem(updatedItem)

            // Update localStorage
            StorageController.updateItem(updatedItem)

            // Get total calories
            const totalCalories = ItemController.getTotalCalories();
            UIController.showTotalCalories(totalCalories)

            // Refresh the form
            UIController.refreshForm();

            // back to initState
            UIController.initState();
        } else {
            UIController.showAlert();
        }
        e.preventDefault()
    }

    // Clear input
    const clearInput = function(e) {
        UIController.refreshForm();
        e.preventDefault()
    }

    const itemDeleteSubmit = function(e) {
        // Get current item
        const currentItem = ItemController.getCurrentItem();

        // Delete from state
        ItemController.deleteItem(currentItem.id)

        // Delete from localStorage
        StorageController.deleteItem(currentItem.id)

        // Get total calories
        const totalCalories = ItemController.getTotalCalories();
        UIController.showTotalCalories(totalCalories)

        

        // Delete list item from UI
        UIController.deleteListItem(currentItem.id)


        // Refresh form
        UIController.refreshForm();
   

        // back to initState
        UIController.initState();

        e.preventDefault();
    }

    const clearAllClick = function(e) {
        // Data Clear
        ItemController.clearAllItems()
        // UI Update
        UIController.removeItems()
        // Clear from localStorage
        StorageController.clearAllItems();
        // Update calories
        UIController.showTotalCalories(0)
        // Hide UL
        UIController.hideList();
 
        e.preventDefault()
    }

    return {
        init: function() {
            // Set initial state
            UIController.initState();

            // Fetch item from storage
            const items = ItemController.getItems();

            // Get total calories
            const totalCalories = ItemController.getTotalCalories();
            UIController.showTotalCalories(totalCalories)

            // Check if there is any item
            if(items.length === 0) {
                UIController.hideList();
            } else {
                // Populate list with items
                UIController.populateItemList(items)
            }
            
            // Load eventListeners
            loadEventListeners();
        }
    }
})(ItemController, UIController, StorageController);

App.init();