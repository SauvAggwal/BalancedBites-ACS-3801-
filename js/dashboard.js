// Dashboard functionality
let waterGlasses = 0;
let mealPrepTasks = [];
let groceryItems = [];

// Sample data
const sampleTasks = [
    { id: 1, text: "Prep overnight oats for breakfasts", completed: true },
    { id: 2, text: "Marinate chicken for lunch meals", completed: true },
    { id: 3, text: "Chop vegetables for dinner sides", completed: false },
    { id: 4, text: "Cook quinoa batch for the week", completed: false }
];

const sampleGroceryItems = [
    "Chicken Breast (2 lbs)",
    "Salmon Fillets",
    "Quinoa (1 bag)",
    "Avocados (4)",
    "Mixed Vegetables",
    "Spinach (2 bags)",
    "Greek Yogurt",
    "Berries Mix"
];

document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    updateDate();
    
    // Load data from localStorage
    loadDashboardData();
    
    // Initialize dashboard
    updateStatistics();
    displayWeekOverview();
    displayMealPrepTasks();
    displayGroceryList();
    setupEventListeners();
});

function updateDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = dateString;
}

function loadDashboardData() {
    // Load water intake
    const savedWater = localStorage.getItem('waterGlasses');
    if (savedWater) {
        waterGlasses = parseInt(savedWater);
    } else {
        waterGlasses = 0;
    }
    
    // Load meal prep tasks
    const savedTasks = localStorage.getItem('mealPrepTasks');
    if (savedTasks) {
        mealPrepTasks = JSON.parse(savedTasks);
    } else {
        mealPrepTasks = [...sampleTasks];
        saveMealPrepTasks();
    }
    
    // Load grocery items from grocery list
    const savedGrocery = localStorage.getItem('groceryItems');
    if (savedGrocery) {
        const allItems = JSON.parse(savedGrocery);
        // Get first 8 items for dashboard preview
        groceryItems = allItems.slice(0, 8).map(item => item.name);
    } else {
        groceryItems = [...sampleGroceryItems];
    }
}

function setupEventListeners() {
    // Water intake
    document.getElementById('addWaterBtn').addEventListener('click', addWaterGlass);
    document.getElementById('waterInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addWaterGlass();
    });
    
    // Meal prep tasks
    document.getElementById('addTaskBtn').addEventListener('click', addMealPrepTask);
}

function updateStatistics() {
    // Get logged meals for today
    const loggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = loggedMeals.filter(meal => meal.date === today);
    
    // Calculate totals
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.nutrition.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.nutrition.protein, 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.nutrition.carbs, 0);
    const totalFat = todayMeals.reduce((sum, meal) => sum + meal.nutrition.fat, 0);
    
    // Get goals from progress data
    const progressData = JSON.parse(localStorage.getItem('progressData') || '{}');
    const calorieGoal = progressData.goals?.calories || 2000;
    const proteinGoal = progressData.goals?.protein || 120;
    const carbsGoal = 200; // Default
    const fatGoal = 65; // Default
    
    // Update summary cards
    document.getElementById('mealsLogged').textContent = `${todayMeals.length}/4`;
    document.getElementById('caloriesCount').textContent = totalCalories;
    document.getElementById('calorieGoal').textContent = calorieGoal;
    
    // Calculate streak
    const uniqueDates = new Set(loggedMeals.map(meal => meal.date));
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    let streak = 0;
    const todayDate = new Date(today);
    
    for (let i = 0; i < sortedDates.length; i++) {
        const date = new Date(sortedDates[i]);
        const expectedDate = new Date(todayDate);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
        } else {
            break;
        }
    }
    
    document.getElementById('streakDays').textContent = `${streak} days`;
    
    // Update nutrition progress
    const caloriesPercent = Math.min((totalCalories / calorieGoal) * 100, 100);
    const proteinPercent = Math.min((totalProtein / proteinGoal) * 100, 100);
    const carbsPercent = Math.min((totalCarbs / carbsGoal) * 100, 100);
    const fatPercent = Math.min((totalFat / fatGoal) * 100, 100);
    
    document.getElementById('caloriesDisplay').textContent = `${totalCalories} / ${calorieGoal}`;
    document.getElementById('caloriesProgress').style.width = `${caloriesPercent}%`;
    document.getElementById('caloriesRemaining').textContent = `${Math.max(0, calorieGoal - totalCalories)} cal remaining`;
    
    document.getElementById('proteinDisplay').textContent = `${Math.round(totalProtein)}g / ${proteinGoal}g`;
    document.getElementById('proteinProgress').style.width = `${proteinPercent}%`;
    
    document.getElementById('carbsDisplay').textContent = `${Math.round(totalCarbs)}g / ${carbsGoal}g`;
    document.getElementById('carbsProgress').style.width = `${carbsPercent}%`;
    
    document.getElementById('fatDisplay').textContent = `${Math.round(totalFat)}g / ${fatGoal}g`;
    document.getElementById('fatProgress').style.width = `${fatPercent}%`;
    
    // Update water glasses display
    updateWaterDisplay();
}

function addWaterGlass() {
    const input = document.getElementById('waterInput');
    const glasses = parseInt(input.value) || 1;
    
    if (glasses > 0 && glasses <= 8) {
        waterGlasses = Math.min(waterGlasses + glasses, 8);
        localStorage.setItem('waterGlasses', waterGlasses.toString());
        updateWaterDisplay();
        input.value = '';
    }
}

function updateWaterDisplay() {
    document.getElementById('waterGlasses').textContent = `${waterGlasses} of 8 glasses`;
    
    // Update glass indicators
    document.querySelectorAll('.water-glass').forEach((glass, index) => {
        if (index < waterGlasses) {
            glass.classList.remove('bg-gray-200');
            glass.classList.add('bg-blue-500');
        } else {
            glass.classList.remove('bg-blue-500');
            glass.classList.add('bg-gray-200');
        }
    });
}

function displayWeekOverview() {
    const container = document.getElementById('weekDays');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // Get logged meals to count meals per day
    const loggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    
    container.innerHTML = days.map((day, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const dateString = date.toISOString().split('T')[0];
        const dayMeals = loggedMeals.filter(meal => meal.date === dateString);
        const mealCount = dayMeals.length || (index < 2 ? 4 : index === 2 ? 4 : index === 3 ? 3 : index === 4 ? 4 : index === 5 ? 3 : 4);
        const isToday = dateString === today.toISOString().split('T')[0];
        const isPast = date < today && !isToday;
        
        return `
            <div class="flex flex-col items-center p-3 rounded-lg border ${isToday || isPast ? 'bg-green-50 border-green-200' : 'border-gray-200'}">
                <div class="text-sm font-medium text-gray-700 mb-2">${day}</div>
                <svg class="w-6 h-6 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <div class="text-lg font-semibold text-gray-800">${mealCount}</div>
                ${isToday || isPast ? `
                    <svg class="w-4 h-4 text-green-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                ` : ''}
            </div>
        `;
    }).join('');
}

function displayMealPrepTasks() {
    const container = document.getElementById('mealPrepTasks');
    
    if (mealPrepTasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No tasks yet. Add your first task!</p>';
        return;
    }
    
    container.innerHTML = mealPrepTasks.map(task => `
        <div class="flex items-center space-x-3">
            <input 
                type="checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id})"
                class="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            >
            <span class="${task.completed ? 'line-through text-gray-400' : 'text-gray-800'} flex-1">${task.text}</span>
            <button 
                onclick="deleteTask(${task.id})"
                class="text-red-500 hover:text-red-700"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

function addMealPrepTask() {
    const taskText = prompt('Enter a new meal prep task:');
    if (taskText && taskText.trim()) {
        const newTask = {
            id: Date.now(),
            text: taskText.trim(),
            completed: false
        };
        mealPrepTasks.push(newTask);
        saveMealPrepTasks();
        displayMealPrepTasks();
    }
}

function toggleTask(taskId) {
    const task = mealPrepTasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveMealPrepTasks();
        displayMealPrepTasks();
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        mealPrepTasks = mealPrepTasks.filter(t => t.id !== taskId);
        saveMealPrepTasks();
        displayMealPrepTasks();
    }
}

function displayGroceryList() {
    const container = document.getElementById('groceryListItems');
    
    if (groceryItems.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm col-span-4">No items in your grocery list yet.</p>';
        return;
    }
    
    container.innerHTML = groceryItems.map(item => `
        <div class="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
            <input type="checkbox" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
            <span class="text-sm text-gray-800">${item}</span>
        </div>
    `).join('');
}

function saveMealPrepTasks() {
    localStorage.setItem('mealPrepTasks', JSON.stringify(mealPrepTasks));
}

// Make functions available globally for onclick handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Update statistics when page becomes visible (in case meals were logged in another tab)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateStatistics();
    }
});

// Update water display on load
updateWaterDisplay();

