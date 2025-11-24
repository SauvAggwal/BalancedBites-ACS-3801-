// Progress Tracking functionality
let weightChart, caloriesChart, macrosChart;
let progressData = {
    weight: [],
    calories: [],
    macros: [],
    goals: {
        weight: 165,
        calories: 2000,
        protein: 120
    },
    startingWeight: 180,
    currentWeight: 172
};

// Sample weight data for the past 6 months
const sampleWeightData = [
    { month: 'Jan', weight: 180 },
    { month: 'Feb', weight: 179 },
    { month: 'Mar', weight: 177 },
    { month: 'Apr', weight: 176 },
    { month: 'May', weight: 172 },
    { month: 'Jun', weight: 172 }
];

document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    const savedData = localStorage.getItem('progressData');
    if (savedData) {
        progressData = { ...progressData, ...JSON.parse(savedData) };
    } else {
        // Initialize with sample data
        progressData.weight = sampleWeightData;
        saveProgressData();
    }
    
    // Initialize
    setupEventListeners();
    setupTabs();
    updateStatistics();
    initializeCharts();
    displayAchievements();
});

function setupEventListeners() {
    // Set goal button
    document.getElementById('setGoalBtn').addEventListener('click', openSetGoalModal);
    
    // Modal buttons
    document.getElementById('closeGoalModalBtn').addEventListener('click', closeSetGoalModal);
    document.getElementById('cancelGoalBtn').addEventListener('click', closeSetGoalModal);
    document.getElementById('setGoalForm').addEventListener('submit', setGoal);
    
    // Click outside modal to close
    document.getElementById('setGoalModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSetGoalModal();
        }
    });
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
            
            if (tabName === 'weight') {
                document.getElementById('weightTab').classList.remove('hidden');
            } else if (tabName === 'calories') {
                document.getElementById('caloriesTab').classList.remove('hidden');
                if (!caloriesChart) {
                    initializeCaloriesChart();
                }
            } else if (tabName === 'macros') {
                document.getElementById('macrosTab').classList.remove('hidden');
                if (!macrosChart) {
                    initializeMacrosChart();
                }
            } else if (tabName === 'achievements') {
                document.getElementById('achievementsTab').classList.remove('hidden');
            }
        });
    });
}

function initializeCharts() {
    initializeWeightChart();
}

function initializeWeightChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    
    const labels = progressData.weight.map(d => d.month);
    const weights = progressData.weight.map(d => d.weight);
    
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (lbs)',
                data: weights,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `Weight: ${context.parsed.y} lbs`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.min(...weights) - 5,
                    max: Math.max(...weights) + 5,
                    ticks: {
                        stepSize: 5,
                        callback: function(value) {
                            return value + ' lbs';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initializeCaloriesChart() {
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    
    // Generate sample calories data for the past 30 days
    const labels = [];
    const calories = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        // Random calories between 1500 and 2500
        calories.push(Math.floor(Math.random() * 1000) + 1500);
    }
    
    caloriesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Calories',
                data: calories,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }, {
                label: 'Goal',
                data: Array(30).fill(progressData.goals.calories),
                borderColor: '#10b981',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value + ' cal';
                        }
                    }
                }
            }
        }
    });
}

function initializeMacrosChart() {
    const ctx = document.getElementById('macrosChart').getContext('2d');
    
    // Calculate average macros from logged meals (if available)
    const loggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    let avgProtein = 0, avgCarbs = 0, avgFat = 0;
    
    if (loggedMeals.length > 0) {
        const totals = loggedMeals.reduce((acc, meal) => {
            acc.protein += meal.nutrition.protein;
            acc.carbs += meal.nutrition.carbs;
            acc.fat += meal.nutrition.fat;
            return acc;
        }, { protein: 0, carbs: 0, fat: 0 });
        
        avgProtein = Math.round(totals.protein / loggedMeals.length);
        avgCarbs = Math.round(totals.carbs / loggedMeals.length);
        avgFat = Math.round(totals.fat / loggedMeals.length);
    } else {
        // Sample data
        avgProtein = 58;
        avgCarbs = 45;
        avgFat = 18;
    }
    
    macrosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                label: 'Average Daily Intake (g)',
                data: [avgProtein, avgCarbs, avgFat],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 191, 36, 0.8)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(251, 191, 36)'
                ],
                borderWidth: 2
            }, {
                label: 'Goals (g)',
                data: [progressData.goals.protein, 0, 0], // Only protein goal shown
                backgroundColor: 'rgba(156, 163, 175, 0.3)',
                borderColor: 'rgb(156, 163, 175)',
                borderWidth: 2,
                borderDash: [5, 5]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'g';
                        }
                    }
                }
            }
        }
    });
}

function updateStatistics() {
    const weightLost = progressData.startingWeight - progressData.currentWeight;
    const toGoal = progressData.currentWeight - progressData.goals.weight;
    
    // Calculate days tracking (from logged meals)
    const loggedMeals = JSON.parse(localStorage.getItem('loggedMeals') || '[]');
    const uniqueDates = new Set(loggedMeals.map(meal => meal.date));
    const daysTracking = uniqueDates.size;
    
    // Calculate goal consistency (percentage of days meeting calorie goal)
    let consistency = 0;
    if (loggedMeals.length > 0) {
        const dailyTotals = {};
        loggedMeals.forEach(meal => {
            if (!dailyTotals[meal.date]) {
                dailyTotals[meal.date] = 0;
            }
            dailyTotals[meal.date] += meal.nutrition.calories;
        });
        
        const daysMet = Object.values(dailyTotals).filter(cal => cal <= progressData.goals.calories).length;
        consistency = Math.round((daysMet / Object.keys(dailyTotals).length) * 100);
    } else {
        consistency = 92; // Default
    }
    
    document.getElementById('weightLost').textContent = weightLost;
    document.getElementById('toGoal').textContent = toGoal;
    document.getElementById('daysTracking').textContent = daysTracking;
    document.getElementById('goalConsistency').textContent = consistency + '%';
    
    document.getElementById('startingWeight').textContent = progressData.startingWeight;
    document.getElementById('currentWeight').textContent = progressData.currentWeight;
    document.getElementById('goalWeight').textContent = progressData.goals.weight;
}

function openSetGoalModal() {
    // Pre-fill with current values
    document.getElementById('goalWeightInput').value = progressData.goals.weight;
    document.getElementById('currentWeightInput').value = progressData.currentWeight;
    document.getElementById('calorieGoalInput').value = progressData.goals.calories;
    document.getElementById('proteinGoalInput').value = progressData.goals.protein;
    
    document.getElementById('setGoalModal').classList.remove('hidden');
}

function closeSetGoalModal() {
    document.getElementById('setGoalModal').classList.add('hidden');
}

function setGoal(e) {
    e.preventDefault();
    
    const goalWeight = parseFloat(document.getElementById('goalWeightInput').value);
    const currentWeight = parseFloat(document.getElementById('currentWeightInput').value);
    const calorieGoal = parseInt(document.getElementById('calorieGoalInput').value);
    const proteinGoal = parseFloat(document.getElementById('proteinGoalInput').value);
    
    // Update if current weight changed
    if (currentWeight !== progressData.currentWeight) {
        // Add new weight entry
        const now = new Date();
        const month = now.toLocaleDateString('en-US', { month: 'short' });
        progressData.weight.push({ month: month, weight: currentWeight });
        
        // Keep only last 6 months
        if (progressData.weight.length > 6) {
            progressData.weight = progressData.weight.slice(-6);
        }
        
        progressData.currentWeight = currentWeight;
        
        // Update weight chart
        if (weightChart) {
            weightChart.destroy();
        }
        initializeWeightChart();
    }
    
    progressData.goals.weight = goalWeight;
    progressData.goals.calories = calorieGoal;
    progressData.goals.protein = proteinGoal;
    
    saveProgressData();
    updateStatistics();
    closeSetGoalModal();
}

function displayAchievements() {
    const container = document.getElementById('achievementsContainer');
    
    const achievements = [
        {
            title: 'First Week Complete',
            description: 'Logged meals for 7 consecutive days',
            icon: '📅',
            unlocked: true,
            date: '2024-01-15'
        },
        {
            title: 'Weight Loss Milestone',
            description: 'Lost 5 pounds',
            icon: '🎯',
            unlocked: true,
            date: '2024-03-20'
        },
        {
            title: 'Calorie Master',
            description: 'Met calorie goal for 30 days',
            icon: '🔥',
            unlocked: true,
            date: '2024-05-10'
        },
        {
            title: 'Protein Power',
            description: 'Met protein goal for 14 days',
            icon: '💪',
            unlocked: true,
            date: '2024-04-05'
        },
        {
            title: 'Hundred Days',
            description: 'Tracked for 100 days',
            icon: '💯',
            unlocked: true,
            date: '2024-06-01'
        },
        {
            title: 'Perfect Week',
            description: 'Met all goals for 7 days straight',
            icon: '⭐',
            unlocked: false,
            date: null
        }
    ];
    
    container.innerHTML = achievements.map(achievement => `
        <div class="border border-gray-200 rounded-lg p-4 ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 opacity-60'}">
            <div class="flex items-start space-x-3">
                <div class="text-4xl">${achievement.icon}</div>
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-800 mb-1">${achievement.title}</h3>
                    <p class="text-sm text-gray-600 mb-2">${achievement.description}</p>
                    ${achievement.unlocked ? `
                        <p class="text-xs text-green-600 font-medium">Unlocked ${achievement.date}</p>
                    ` : `
                        <p class="text-xs text-gray-500">Locked</p>
                    `}
                </div>
                ${achievement.unlocked ? `
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                ` : `
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                `}
            </div>
        </div>
    `).join('');
}

function saveProgressData() {
    localStorage.setItem('progressData', JSON.stringify(progressData));
}

