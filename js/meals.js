// Meal Tracking functionality
let allMeals = [];
let loggedMeals = [];
let recentFoods = [];

// Default goals
const defaultGoals = {
    calories: 2000,
    protein: 120
};

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load meals from JSON
        const response = await fetch('js/Balanced_Bites.Meals.json');
        if (response.ok) {
            allMeals = await response.json();
        }
    } catch (error) {
        console.error('Error loading meals:', error);
    }
    
    // Load logged meals from localStorage
    const savedMeals = localStorage.getItem('loggedMeals');
    if (savedMeals) {
        loggedMeals = JSON.parse(savedMeals);
    }
    
    // Load recent foods from localStorage
    const savedRecent = localStorage.getItem('recentFoods');
    if (savedRecent) {
        recentFoods = JSON.parse(savedRecent);
    }
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = today;
    
    // Initialize
    setupEventListeners();
    setupTabs();
    updateDate();
    displayLoggedMeals();
    displayFoodDatabase();
    displayRecentFoods();
});

function setupEventListeners() {
    // Log meal button
    document.getElementById('logMealBtn').addEventListener('click', openLogMealModal);
    
    // Date picker
    document.getElementById('datePicker').addEventListener('change', updateDate);
    
    // Modal buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeLogMealModal);
    document.getElementById('cancelLogBtn').addEventListener('click', closeLogMealModal);
    document.getElementById('logMealForm').addEventListener('submit', logMeal);
    
    // Click outside modal to close
    document.getElementById('logMealModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLogMealModal();
        }
    });
    
    // Food database search
    document.getElementById('searchFoodInput').addEventListener('input', filterFoodDatabase);
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
            
            if (tabName === 'today') {
                document.getElementById('todayTab').classList.remove('hidden');
            } else if (tabName === 'database') {
                document.getElementById('databaseTab').classList.remove('hidden');
            } else if (tabName === 'recent') {
                document.getElementById('recentTab').classList.remove('hidden');
            }
        });
    });
}

function updateDate() {
    const selectedDate = document.getElementById('datePicker').value;
    displayLoggedMeals();
    updateStatistics();
}

function openLogMealModal() {
    // Set current time as default
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    document.getElementById('mealTimeInput').value = timeString;
    
    // Reset form
    document.getElementById('logMealForm').reset();
    document.getElementById('mealTimeInput').value = timeString;
    
    document.getElementById('logMealModal').classList.remove('hidden');
}

function closeLogMealModal() {
    document.getElementById('logMealModal').classList.add('hidden');
}

function logMeal(e) {
    e.preventDefault();
    
    const selectedDate = document.getElementById('datePicker').value;
    const mealName = document.getElementById('mealNameInput').value;
    const mealType = document.getElementById('mealTypeInput').value;
    const mealTime = document.getElementById('mealTimeInput').value;
    const calories = parseFloat(document.getElementById('caloriesInput').value);
    const protein = parseFloat(document.getElementById('proteinInput').value);
    const carbs = parseFloat(document.getElementById('carbsInput').value);
    const fat = parseFloat(document.getElementById('fatInput').value);
    
    const newMeal = {
        id: Date.now(),
        name: mealName,
        type: mealType,
        time: mealTime,
        date: selectedDate,
        nutrition: {
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat
        }
    };
    
    loggedMeals.push(newMeal);
    saveLoggedMeals();
    
    // Add to recent foods if not already there
    const recentIndex = recentFoods.findIndex(f => f.name.toLowerCase() === mealName.toLowerCase());
    if (recentIndex === -1) {
        recentFoods.unshift({
            name: mealName,
            nutrition: newMeal.nutrition,
            lastUsed: selectedDate
        });
        // Keep only last 20 recent foods
        if (recentFoods.length > 20) {
            recentFoods = recentFoods.slice(0, 20);
        }
        saveRecentFoods();
    } else {
        recentFoods[recentIndex].lastUsed = selectedDate;
        saveRecentFoods();
    }
    
    closeLogMealModal();
    displayLoggedMeals();
    displayRecentFoods();
    updateStatistics();
}

function logMealFromDatabase(meal) {
    const selectedDate = document.getElementById('datePicker').value;
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    
    const newMeal = {
        id: Date.now(),
        name: meal.Name,
        type: 'Lunch', // Default, user can edit later
        time: timeString,
        date: selectedDate,
        nutrition: {
            calories: meal.Nutrition.calories,
            protein: meal.Nutrition.protein,
            carbs: meal.Nutrition.carbs,
            fat: meal.Nutrition.fat
        }
    };
    
    loggedMeals.push(newMeal);
    saveLoggedMeals();
    
    // Add to recent foods
    const recentIndex = recentFoods.findIndex(f => f.name.toLowerCase() === meal.Name.toLowerCase());
    if (recentIndex === -1) {
        recentFoods.unshift({
            name: meal.Name,
            nutrition: meal.Nutrition,
            lastUsed: selectedDate
        });
        if (recentFoods.length > 20) {
            recentFoods = recentFoods.slice(0, 20);
        }
    } else {
        recentFoods[recentIndex].lastUsed = selectedDate;
    }
    saveRecentFoods();
    
    displayLoggedMeals();
    displayRecentFoods();
    updateStatistics();
    
    // Switch to Today's Meals tab
    document.querySelector('[data-tab="today"]').click();
}

function displayLoggedMeals() {
    const selectedDate = document.getElementById('datePicker').value;
    const container = document.getElementById('loggedMealsContainer');
    const noMealsMessage = document.getElementById('noMealsMessage');
    
    // Filter meals for selected date
    const dateMeals = loggedMeals.filter(meal => meal.date === selectedDate);
    
    // Sort by time
    dateMeals.sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });
    
    if (dateMeals.length === 0) {
        container.innerHTML = '';
        noMealsMessage.classList.remove('hidden');
        return;
    }
    
    noMealsMessage.classList.add('hidden');
    
    // Format date for display
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    
    container.innerHTML = `
        <p class="text-sm text-gray-600 mb-4">Meals logged for ${formattedDate}</p>
        ${dateMeals.map(meal => `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="text-lg font-semibold text-gray-800">${meal.name}</h3>
                            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">${meal.type}</span>
                        </div>
                        <p class="text-sm text-gray-600 mb-3">Logged at ${formatTime(meal.time)}</p>
                        <div class="flex space-x-6 text-sm">
                            <div>
                                <span class="text-gray-600">Protein: </span>
                                <span class="font-medium text-gray-800">${meal.nutrition.protein}g</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Carbs: </span>
                                <span class="font-medium text-gray-800">${meal.nutrition.carbs}g</span>
                            </div>
                            <div>
                                <span class="text-gray-600">Fat: </span>
                                <span class="font-medium text-gray-800">${meal.nutrition.fat}g</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <div class="text-xl font-bold text-gray-800">${meal.nutrition.calories}</div>
                            <div class="text-xs text-gray-500">cal</div>
                        </div>
                        <button 
                            onclick="editMeal(${meal.id})"
                            class="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                            Edit
                        </button>
                        <button 
                            onclick="deleteMeal(${meal.id})"
                            class="text-red-500 hover:text-red-700"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

function displayFoodDatabase() {
    const container = document.getElementById('foodDatabaseContainer');
    
    if (allMeals.length === 0) {
        container.innerHTML = '<p class="text-gray-600 col-span-3 text-center py-8">Loading meals...</p>';
        return;
    }
    
    container.innerHTML = allMeals.map(meal => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <h3 class="font-semibold text-gray-800 mb-2">${meal.Name}</h3>
            <p class="text-sm text-gray-600 mb-3">${meal.Description}</p>
            <div class="flex justify-between items-center mb-3">
                <div class="text-sm">
                    <div class="text-gray-600">Cal: <span class="font-medium text-gray-800">${meal.Nutrition.calories}</span></div>
                    <div class="text-gray-600">P: <span class="font-medium text-gray-800">${meal.Nutrition.protein}g</span></div>
                </div>
                <div class="text-sm">
                    <div class="text-gray-600">C: <span class="font-medium text-gray-800">${meal.Nutrition.carbs}g</span></div>
                    <div class="text-gray-600">F: <span class="font-medium text-gray-800">${meal.Nutrition.fat}g</span></div>
                </div>
            </div>
            <button 
                onclick="logMealFromDatabaseHelper('${meal._id.$oid}')"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
                Add to Log
            </button>
        </div>
    `).join('');
}

function displayRecentFoods() {
    const container = document.getElementById('recentFoodsContainer');
    const noRecent = document.getElementById('noRecentFoods');
    
    if (recentFoods.length === 0) {
        container.innerHTML = '';
        noRecent.classList.remove('hidden');
        return;
    }
    
    noRecent.classList.add('hidden');
    
    container.innerHTML = recentFoods.slice(0, 10).map(food => `
        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div class="flex-1">
                <h4 class="font-medium text-gray-800">${food.name}</h4>
                <p class="text-xs text-gray-500">${food.nutrition.calories} cal • P: ${food.nutrition.protein}g • C: ${food.nutrition.carbs}g • F: ${food.nutrition.fat}g</p>
            </div>
            <button 
                onclick="quickLogMeal('${food.name.replace(/'/g, "\\'")}', ${JSON.stringify(food.nutrition).replace(/"/g, '&quot;')})"
                class="ml-4 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
                Add
            </button>
        </div>
    `).join('');
}

function quickLogMeal(name, nutrition) {
    const selectedDate = document.getElementById('datePicker').value;
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    
    const newMeal = {
        id: Date.now(),
        name: name,
        type: 'Snack',
        time: timeString,
        date: selectedDate,
        nutrition: nutrition
    };
    
    loggedMeals.push(newMeal);
    saveLoggedMeals();
    
    displayLoggedMeals();
    updateStatistics();
    
    // Switch to Today's Meals tab
    document.querySelector('[data-tab="today"]').click();
}

function filterFoodDatabase() {
    const searchTerm = document.getElementById('searchFoodInput').value.toLowerCase();
    const container = document.getElementById('foodDatabaseContainer');
    
    const filteredMeals = allMeals.filter(meal => 
        meal.Name.toLowerCase().includes(searchTerm) ||
        meal.Description.toLowerCase().includes(searchTerm)
    );
    
    if (filteredMeals.length === 0) {
        container.innerHTML = '<p class="text-gray-600 col-span-3 text-center py-8">No meals found matching your search.</p>';
        return;
    }
    
    container.innerHTML = filteredMeals.map(meal => `
        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <h3 class="font-semibold text-gray-800 mb-2">${meal.Name}</h3>
            <p class="text-sm text-gray-600 mb-3">${meal.Description}</p>
            <div class="flex justify-between items-center mb-3">
                <div class="text-sm">
                    <div class="text-gray-600">Cal: <span class="font-medium text-gray-800">${meal.Nutrition.calories}</span></div>
                    <div class="text-gray-600">P: <span class="font-medium text-gray-800">${meal.Nutrition.protein}g</span></div>
                </div>
                <div class="text-sm">
                    <div class="text-gray-600">C: <span class="font-medium text-gray-800">${meal.Nutrition.carbs}g</span></div>
                    <div class="text-gray-600">F: <span class="font-medium text-gray-800">${meal.Nutrition.fat}g</span></div>
                </div>
            </div>
            <button 
                onclick="logMealFromDatabaseHelper('${meal._id.$oid}')"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
                Add to Log
            </button>
        </div>
    `).join('');
}

function updateStatistics() {
    const selectedDate = document.getElementById('datePicker').value;
    const dateMeals = loggedMeals.filter(meal => meal.date === selectedDate);
    
    const totalCalories = dateMeals.reduce((sum, meal) => sum + meal.nutrition.calories, 0);
    const totalProtein = dateMeals.reduce((sum, meal) => sum + meal.nutrition.protein, 0);
    const mealsCount = dateMeals.length;
    
    // Check if selected date is today
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    document.getElementById('totalCalories').textContent = totalCalories;
    document.getElementById('totalProtein').textContent = `${Math.round(totalProtein)}g`;
    document.getElementById('mealsLogged').textContent = mealsCount;
    document.getElementById('mealsLoggedPeriod').textContent = isToday ? 'today' : 'on this date';
}

function editMeal(mealId) {
    const meal = loggedMeals.find(m => m.id === mealId);
    if (!meal) return;
    
    // Pre-fill form with meal data
    document.getElementById('mealNameInput').value = meal.name;
    document.getElementById('mealTypeInput').value = meal.type;
    document.getElementById('mealTimeInput').value = meal.time;
    document.getElementById('caloriesInput').value = meal.nutrition.calories;
    document.getElementById('proteinInput').value = meal.nutrition.protein;
    document.getElementById('carbsInput').value = meal.nutrition.carbs;
    document.getElementById('fatInput').value = meal.nutrition.fat;
    
    // Open modal
    openLogMealModal();
    
    // Update form submit to edit instead of create
    const form = document.getElementById('logMealForm');
    const oldSubmit = form.onsubmit;
    form.onsubmit = function(e) {
        e.preventDefault();
        
        meal.name = document.getElementById('mealNameInput').value;
        meal.type = document.getElementById('mealTypeInput').value;
        meal.time = document.getElementById('mealTimeInput').value;
        meal.nutrition.calories = parseFloat(document.getElementById('caloriesInput').value);
        meal.nutrition.protein = parseFloat(document.getElementById('proteinInput').value);
        meal.nutrition.carbs = parseFloat(document.getElementById('carbsInput').value);
        meal.nutrition.fat = parseFloat(document.getElementById('fatInput').value);
        
        saveLoggedMeals();
        closeLogMealModal();
        displayLoggedMeals();
        updateStatistics();
        
        form.onsubmit = oldSubmit;
    };
}

function deleteMeal(mealId) {
    if (confirm('Are you sure you want to delete this meal?')) {
        loggedMeals = loggedMeals.filter(m => m.id !== mealId);
        saveLoggedMeals();
        displayLoggedMeals();
        updateStatistics();
    }
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function saveLoggedMeals() {
    localStorage.setItem('loggedMeals', JSON.stringify(loggedMeals));
}

function saveRecentFoods() {
    localStorage.setItem('recentFoods', JSON.stringify(recentFoods));
}

// Helper function to log meal from database by ID
function logMealFromDatabaseHelper(mealId) {
    const meal = allMeals.find(m => m._id.$oid === mealId);
    if (meal) {
        logMealFromDatabase(meal);
    }
}

// Make functions available globally for onclick handlers
window.logMealFromDatabaseHelper = logMealFromDatabaseHelper;
window.quickLogMeal = quickLogMeal;
window.editMeal = editMeal;
window.deleteMeal = deleteMeal;

