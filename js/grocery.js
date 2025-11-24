// Grocery List functionality
let groceryItems = [];
let savedLists = [];

// Sample data for demonstration
const sampleItems = [
    { id: 1, name: "Organic Spinach", quantity: "2 bags", category: "Produce", price: 4.98, completed: false },
    { id: 2, name: "Sweet Potatoes", quantity: "3 lbs", category: "Produce", price: 4.47, completed: false },
    { id: 3, name: "Avocados", quantity: "4 pieces", category: "Produce", price: 6.00, completed: true },
    { id: 4, name: "Greek Yogurt", quantity: "1 container", category: "Dairy", price: 5.99, completed: true },
    { id: 5, name: "Salmon Fillets", quantity: "4 pieces", category: "Protein", price: 18.99, completed: false },
    { id: 6, name: "Chicken Breast", quantity: "2 lbs", category: "Protein", price: 12.99, completed: false },
    { id: 7, name: "Brown Rice", quantity: "1 bag", category: "Grains", price: 3.29, completed: false }
];

const sampleSavedLists = [
    { 
        id: 1, 
        name: "Weekly Meal Prep", 
        itemCount: 12, 
        created: "2 days ago",
        items: [
            { id: 101, name: "Chicken Breast", quantity: "3 lbs", category: "Protein", price: 19.47, completed: false },
            { id: 102, name: "Brown Rice", quantity: "2 bags", category: "Grains", price: 6.58, completed: false },
            { id: 103, name: "Broccoli", quantity: "2 lbs", category: "Produce", price: 3.98, completed: false }
        ]
    },
    { 
        id: 2, 
        name: "Keto Shopping", 
        itemCount: 8, 
        created: "1 week ago",
        items: [
            { id: 201, name: "Salmon Fillets", quantity: "6 pieces", category: "Protein", price: 28.49, completed: false },
            { id: 202, name: "Avocados", quantity: "6 pieces", category: "Produce", price: 9.00, completed: false },
            { id: 203, name: "Greek Yogurt", quantity: "2 containers", category: "Dairy", price: 11.98, completed: false }
        ]
    },
    { 
        id: 3, 
        name: "Healthy Snacks", 
        itemCount: 6, 
        created: "2 weeks ago",
        items: [
            { id: 301, name: "Almonds", quantity: "1 bag", category: "Other", price: 8.99, completed: false },
            { id: 302, name: "Apples", quantity: "5 lbs", category: "Produce", price: 4.99, completed: false }
        ]
    }
];

const frequentlyBought = ["Bananas", "Oatmeal", "Milk", "Eggs", "Bread", "Apples"];
const runningLow = ["Olive Oil", "Garlic", "Onions"];

document.addEventListener('DOMContentLoaded', function() {
    // Load items from localStorage or use sample data
    const savedItems = localStorage.getItem('groceryItems');
    if (savedItems) {
        groceryItems = JSON.parse(savedItems);
    } else {
        groceryItems = [...sampleItems];
        saveItems();
    }
    
    const savedListsData = localStorage.getItem('savedLists');
    if (savedListsData) {
        savedLists = JSON.parse(savedListsData);
        // Ensure all saved lists have items array (for backward compatibility)
        savedLists.forEach(list => {
            if (!list.items) {
                list.items = [];
            }
        });
    } else {
        savedLists = JSON.parse(JSON.stringify(sampleSavedLists)); // Deep copy
        saveLists();
    }
    
    // Initialize the page
    displayItems();
    updateStatistics();
    setupTabs();
    setupEventListeners();
    displaySavedLists();
    displaySuggestions();
});

function setupEventListeners() {
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', addItem);
    
    // Enter key on inputs
    document.getElementById('itemNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addItem();
    });
    document.getElementById('itemQuantityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addItem();
    });
    
    // Action buttons
    document.getElementById('exportListBtn').addEventListener('click', exportList);
    document.getElementById('clearCompletedBtn').addEventListener('click', clearCompleted);
    document.getElementById('startShoppingBtn').addEventListener('click', startShopping);
    document.getElementById('newListBtn').addEventListener('click', createNewList);
    document.getElementById('shareListBtn').addEventListener('click', shareList);
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update button styles
            tabButtons.forEach(b => {
                b.classList.remove('border-green-600', 'text-green-600');
                b.classList.add('text-gray-700');
            });
            this.classList.add('border-green-600', 'text-green-600');
            this.classList.remove('text-gray-700');
            
            // Show/hide tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            if (tabName === 'current') {
                document.getElementById('currentListTab').classList.remove('hidden');
            } else if (tabName === 'saved') {
                document.getElementById('savedListsTab').classList.remove('hidden');
            } else if (tabName === 'suggestions') {
                document.getElementById('suggestionsTab').classList.remove('hidden');
            }
        });
    });
}

function addItem() {
    const nameInput = document.getElementById('itemNameInput');
    const quantityInput = document.getElementById('itemQuantityInput');
    
    const name = nameInput.value.trim();
    const quantity = quantityInput.value.trim() || "1";
    
    if (!name) {
        alert('Please enter an item name');
        return;
    }
    
    // Determine category (simple logic - can be enhanced)
    let category = "Other";
    const nameLower = name.toLowerCase();
    if (nameLower.includes('spinach') || nameLower.includes('potato') || nameLower.includes('avocado') || nameLower.includes('tomato') || nameLower.includes('carrot')) {
        category = "Produce";
    } else if (nameLower.includes('yogurt') || nameLower.includes('milk') || nameLower.includes('cheese')) {
        category = "Dairy";
    } else if (nameLower.includes('chicken') || nameLower.includes('salmon') || nameLower.includes('beef') || nameLower.includes('meat')) {
        category = "Protein";
    } else if (nameLower.includes('rice') || nameLower.includes('bread') || nameLower.includes('pasta') || nameLower.includes('quinoa')) {
        category = "Grains";
    }
    
    // Generate a simple price estimate (in real app, this would come from a database)
    const price = (Math.random() * 20 + 2).toFixed(2);
    
    const newItem = {
        id: Date.now(),
        name: name,
        quantity: quantity,
        category: category,
        price: parseFloat(price),
        completed: false
    };
    
    groceryItems.push(newItem);
    saveItems();
    displayItems();
    updateStatistics();
    
    // Clear inputs
    nameInput.value = '';
    quantityInput.value = '';
    nameInput.focus();
}

function toggleItemComplete(itemId) {
    const item = groceryItems.find(i => i.id === itemId);
    if (item) {
        item.completed = !item.completed;
        saveItems();
        displayItems();
        updateStatistics();
    }
}

function deleteItem(itemId) {
    groceryItems = groceryItems.filter(i => i.id !== itemId);
    saveItems();
    displayItems();
    updateStatistics();
}

function displayItems() {
    const container = document.getElementById('groceryItemsContainer');
    
    // Group items by category
    const itemsByCategory = {};
    groceryItems.forEach(item => {
        if (!itemsByCategory[item.category]) {
            itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
    });
    
    // Sort categories
    const categoryOrder = ["Produce", "Dairy", "Protein", "Grains", "Other"];
    const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
    
    container.innerHTML = sortedCategories.map(category => {
        const items = itemsByCategory[category];
        const itemsHtml = items.map(item => `
            <div class="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                <div class="flex items-center space-x-3 flex-1">
                    <input 
                        type="checkbox" 
                        ${item.completed ? 'checked' : ''} 
                        onchange="toggleItemComplete(${item.id})"
                        class="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    >
                    <div class="flex-1">
                        <span class="${item.completed ? 'line-through text-gray-400' : 'text-gray-800'} font-medium">${item.name}</span>
                        <span class="text-gray-500 text-sm ml-2">${item.quantity}</span>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-800 font-medium">$${item.price.toFixed(2)}</span>
                    <button 
                        onclick="deleteItem(${item.id})"
                        class="text-red-500 hover:text-red-700 transition"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="bg-white rounded-lg shadow-sm">
                <div class="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800">${category}</h3>
                    <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${items.length} items</span>
                </div>
                <div>
                    ${itemsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function updateStatistics() {
    const completed = groceryItems.filter(i => i.completed).length;
    const total = groceryItems.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalPrice = groceryItems.reduce((sum, item) => sum + item.price, 0);
    const categories = new Set(groceryItems.map(i => i.category)).size;
    
    document.getElementById('itemsCompleted').textContent = `${completed}/${total}`;
    document.getElementById('shoppingProgress').textContent = `${progress}%`;
    document.getElementById('estimatedTotal').textContent = `$${totalPrice.toFixed(2)}`;
    document.getElementById('categoriesCount').textContent = categories;
}

function clearCompleted() {
    if (confirm('Are you sure you want to clear all completed items?')) {
        groceryItems = groceryItems.filter(i => !i.completed);
        saveItems();
        displayItems();
        updateStatistics();
    }
}

function exportList() {
    const listText = groceryItems.map(item => {
        const check = item.completed ? '✓' : '☐';
        return `${check} ${item.name} - ${item.quantity} - $${item.price.toFixed(2)}`;
    }).join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function startShopping() {
    alert('Shopping mode activated! Check off items as you shop.');
    // In a real app, this could switch to a shopping mode view
}

function createNewList() {
    if (groceryItems.length > 0) {
        // Ask if user wants to save current list
        const saveCurrent = confirm('Do you want to save your current list before creating a new one?');
        if (saveCurrent) {
            const listName = prompt('Enter a name for the current list:');
            if (listName) {
                // Create a deep copy of items to avoid reference issues
                const itemsCopy = groceryItems.map(item => ({ ...item, id: Date.now() + Math.random() }));
                savedLists.push({
                    id: Date.now(),
                    name: listName,
                    itemCount: groceryItems.length,
                    created: 'Just now',
                    items: itemsCopy
                });
                saveLists();
                displaySavedLists();
            }
        }
    }
    
    // Clear current list
    groceryItems = [];
    saveItems();
    displayItems();
    updateStatistics();
}

function shareList() {
    const listText = groceryItems.map(item => {
        const check = item.completed ? '✓' : '☐';
        return `${check} ${item.name} - ${item.quantity}`;
    }).join('\n');
    
    if (navigator.share) {
        navigator.share({
            title: 'My Grocery List',
            text: listText
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(listText).then(() => {
            alert('List copied to clipboard!');
        });
    }
}

function displaySavedLists() {
    const container = document.getElementById('savedListsContainer');
    
    if (savedLists.length === 0) {
        container.innerHTML = '<p class="text-gray-600 col-span-3 text-center py-8">No saved lists yet.</p>';
        return;
    }
    
    container.innerHTML = savedLists.map(list => {
        const itemCount = list.items ? list.items.length : list.itemCount || 0;
        return `
        <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${list.name}</h3>
            <p class="text-sm text-gray-600 mb-4">${itemCount} items • Created ${list.created}</p>
            <div class="flex items-center justify-between">
                <button 
                    onclick="loadList(${list.id})"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                    Load List
                </button>
                <div class="flex space-x-2">
                    <button 
                        onclick="editList(${list.id})"
                        class="p-2 text-gray-600 hover:text-gray-800 transition"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button 
                        onclick="deleteList(${list.id})"
                        class="p-2 text-red-500 hover:text-red-700 transition"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

function displaySuggestions() {
    const frequentlyContainer = document.getElementById('frequentlyBoughtContainer');
    const runningLowContainer = document.getElementById('runningLowContainer');
    
    frequentlyContainer.innerHTML = frequentlyBought.map(item => `
        <button 
            onclick="addSuggestionItem('${item}')"
            class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
            <span>${item}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
        </button>
    `).join('');
    
    runningLowContainer.innerHTML = runningLow.map(item => `
        <button 
            onclick="addSuggestionItem('${item}')"
            class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
            <span>${item}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
        </button>
    `).join('');
}

function addSuggestionItem(itemName) {
    document.getElementById('itemNameInput').value = itemName;
    document.getElementById('itemQuantityInput').value = '1';
    document.getElementById('itemNameInput').focus();
    // Switch to Current List tab
    document.querySelector('[data-tab="current"]').click();
}

function loadList(listId) {
    const list = savedLists.find(l => l.id === listId);
    if (!list) {
        alert('List not found');
        return;
    }
    
    // Check if list has items
    if (!list.items || list.items.length === 0) {
        alert('This list has no items to load.');
        return;
    }
    
    // Ask user if they want to replace or merge with current list
    if (groceryItems.length > 0) {
        const action = confirm(`Current list has ${groceryItems.length} items. Do you want to replace them with "${list.name}"?\n\nClick OK to replace, Cancel to merge.`);
        if (action) {
            // Replace current list
            groceryItems = list.items.map(item => ({ ...item, id: Date.now() + Math.random(), completed: false }));
        } else {
            // Merge lists (add items that don't already exist)
            const existingNames = new Set(groceryItems.map(item => item.name.toLowerCase()));
            const newItems = list.items
                .filter(item => !existingNames.has(item.name.toLowerCase()))
                .map(item => ({ ...item, id: Date.now() + Math.random(), completed: false }));
            groceryItems = [...groceryItems, ...newItems];
        }
    } else {
        // No current items, just load the list
        groceryItems = list.items.map(item => ({ ...item, id: Date.now() + Math.random(), completed: false }));
    }
    
    saveItems();
    displayItems();
    updateStatistics();
    
    // Switch to Current List tab
    document.querySelector('[data-tab="current"]').click();
}

function editList(listId) {
    const list = savedLists.find(l => l.id === listId);
    if (list) {
        const newName = prompt('Enter new name:', list.name);
        if (newName) {
            list.name = newName;
            saveLists();
            displaySavedLists();
        }
    }
}

function deleteList(listId) {
    if (confirm('Are you sure you want to delete this list?')) {
        savedLists = savedLists.filter(l => l.id !== listId);
        saveLists();
        displaySavedLists();
    }
}

function saveItems() {
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
}

function saveLists() {
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
}

// Make functions available globally for onclick handlers
window.toggleItemComplete = toggleItemComplete;
window.deleteItem = deleteItem;
window.addSuggestionItem = addSuggestionItem;
window.loadList = loadList;
window.editList = editList;
window.deleteList = deleteList;

