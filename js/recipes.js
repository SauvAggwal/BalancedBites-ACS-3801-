// Recipes page functionality
let allRecipes = [];
let allIngredients = [];
let filteredRecipes = [];

// Helper function to load JSON file with fallback
function loadJSONFile(url) {
    return new Promise((resolve, reject) => {
        // Try fetch first
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => resolve(data))
            .catch(fetchError => {
                // Fallback to XMLHttpRequest if fetch fails (for file:// protocol)
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 0 || xhr.status === 200) {
                            try {
                                const data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (parseError) {
                                reject(new Error(`Failed to parse JSON: ${parseError.message}`));
                            }
                        } else {
                            reject(new Error(`Failed to load ${url}: HTTP ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = function() {
                    reject(new Error(`Network error loading ${url}. Make sure you're running through a web server (not file:// protocol).`));
                };
                xhr.send();
            });
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load both JSON files
        [allRecipes, allIngredients] = await Promise.all([
            loadJSONFile('js/Balanced_Bites.Meals.json'),
            loadJSONFile('js/Balanced_Bites.Ingredients.json')
        ]);
        
        filteredRecipes = [...allRecipes];
        
        // Hide loading state
        document.getElementById('loadingState').style.display = 'none';
        
        // Display recipes
        displayRecipes(filteredRecipes);
        
        // Setup search and filter
        setupSearchAndFilter();
        
    } catch (error) {
        console.error('Error loading recipes:', error);
        const loadingState = document.getElementById('loadingState');
        let errorMessage = '<div class="text-red-600 space-y-2">';
        errorMessage += '<p class="font-semibold">Error loading recipes</p>';
        errorMessage += `<p class="text-sm">${error.message}</p>`;
        
        // Check if it's a CORS/local file issue
        if (window.location.protocol === 'file:' || error.message.includes('Network error')) {
            errorMessage += '<div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">';
            errorMessage += '<p class="font-semibold text-yellow-800 mb-2">Solution:</p>';
            errorMessage += '<p class="text-sm text-yellow-700">This page needs to run through a web server.</p>';
            errorMessage += '<ul class="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">';
            errorMessage += '<li>Use Live Server extension in VS Code</li>';
            errorMessage += '<li>Or run: <code class="bg-yellow-100 px-1 rounded">python -m http.server 8000</code></li>';
            errorMessage += '<li>Or use: <code class="bg-yellow-100 px-1 rounded">npx http-server</code></li>';
            errorMessage += '</ul>';
            errorMessage += '</div>';
        }
        
        errorMessage += '</div>';
        loadingState.innerHTML = errorMessage;
        loadingState.style.display = 'block';
    }
});

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const dietFilter = document.getElementById('dietFilter');
    
    searchInput.addEventListener('input', filterRecipes);
    dietFilter.addEventListener('change', filterRecipes);
}

function filterRecipes() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const dietFilter = document.getElementById('dietFilter').value;
    
    filteredRecipes = allRecipes.filter(recipe => {
        // Search filter
        const matchesSearch = recipe.Name.toLowerCase().includes(searchTerm) ||
                             recipe.Description.toLowerCase().includes(searchTerm) ||
                             recipe.Ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm));
        
        // Diet filter
        const matchesDiet = !dietFilter || recipe.Diet.includes(dietFilter);
        
        return matchesSearch && matchesDiet;
    });
    
    displayRecipes(filteredRecipes);
}

function getIngredientDetails(ingredientName) {
    return allIngredients.find(ing => ing.Name === ingredientName);
}

function calculateIngredientNutrition(ingredient, amount, unit) {
    const ingredientDetails = getIngredientDetails(ingredient.name);
    if (!ingredientDetails) return null;
    
    const nutrition = ingredientDetails.NutritionPer100;
    const ingredientUnit = ingredientDetails.Unit;
    
    // Convert amount to match ingredient unit
    let multiplier = 1;
    
    // Handle unit conversions (simplified - in real app, you'd need more sophisticated conversion)
    if (unit === 'cup' && ingredientUnit === 'g') {
        // Approximate conversions (would need actual conversion factors)
        multiplier = amount * 100; // Rough estimate
    } else if (unit === 'cup' && ingredientUnit === 'cup') {
        multiplier = amount;
    } else if (unit === 'piece' && ingredientUnit === 'piece') {
        multiplier = amount;
    } else if (unit === 'tbsp' && ingredientUnit === 'tbsp') {
        multiplier = amount;
    } else if (unit === 'tsp' && ingredientUnit === 'tsp') {
        multiplier = amount;
    } else if (unit === 'g' && ingredientUnit === 'g') {
        multiplier = amount / 100;
    } else if (unit === 'cloves' && ingredientUnit === 'clove') {
        multiplier = amount;
    } else if (unit === 'pieces' && ingredientUnit === 'pieces') {
        multiplier = amount;
    } else if (unit === 'g' && ingredientUnit !== 'g') {
        // If recipe uses grams but ingredient uses different unit, skip detailed calc
        return null;
    } else {
        // Default: assume grams if both are numeric units
        multiplier = amount / 100;
    }
    
    return {
        calories: Math.round(nutrition.Calories * multiplier),
        protein: Math.round(nutrition.Protein * multiplier * 10) / 10,
        carbs: Math.round(nutrition.Carbs * multiplier * 10) / 10,
        fat: Math.round(nutrition.Fat * multiplier * 10) / 10
    };
}

function displayRecipes(recipes) {
    const container = document.getElementById('recipesContainer');
    const noResults = document.getElementById('noResults');
    
    if (recipes.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
}

function createRecipeCard(recipe) {
    const dietTags = recipe.Diet.map(diet => 
        `<span class="px-2 py-1 text-xs font-semibold rounded-full ${
            diet === 'vegan' ? 'bg-green-100 text-green-800' :
            diet === 'vegetarian' ? 'bg-blue-100 text-blue-800' :
            diet === 'high-protein' ? 'bg-purple-100 text-purple-800' :
            diet === 'gluten-free' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
        }">${diet}</span>`
    ).join('');
    
    const ingredientsList = recipe.Ingredients.map(ing => {
        const ingredientDetails = getIngredientDetails(ing.name);
        const nutrition = calculateIngredientNutrition(ing, ing.amount, ing.unit);
        const hasDetails = ingredientDetails !== undefined;
        
        return `
            <div class="border-b border-gray-200 py-2 last:border-b-0">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="font-medium text-gray-800">${ing.name}</p>
                        <p class="text-sm text-gray-600">${ing.amount} ${ing.unit}</p>
                        ${hasDetails && nutrition ? `
                            <div class="mt-1 text-xs text-gray-500">
                                <span class="inline-block mr-3">Cal: ${nutrition.calories}</span>
                                <span class="inline-block mr-3">P: ${nutrition.protein}g</span>
                                <span class="inline-block mr-3">C: ${nutrition.carbs}g</span>
                                <span class="inline-block">F: ${nutrition.fat}g</span>
                            </div>
                        ` : hasDetails ? `
                            <div class="mt-1 text-xs text-gray-400 italic">
                                Nutrition info available (unit conversion needed)
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const stepsList = recipe.Steps.map((step, index) => 
        `<li class="mb-2 text-gray-700">${index + 1}. ${step}</li>`
    ).join('');
    
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-xl font-bold text-gray-800 flex-1">${recipe.Name}</h2>
                    <span class="ml-2 text-sm text-gray-500 flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        ${recipe.TimeMinutes} min
                    </span>
                </div>
                
                <p class="text-gray-600 mb-4">${recipe.Description}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                    ${dietTags}
                </div>
                
                <!-- Nutrition Summary -->
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 class="font-semibold text-gray-800 mb-2">Nutrition (per serving)</h3>
                    <div class="grid grid-cols-4 gap-2 text-sm">
                        <div>
                            <p class="text-gray-600">Calories</p>
                            <p class="font-bold text-gray-800">${recipe.Nutrition.calories}</p>
                        </div>
                        <div>
                            <p class="text-gray-600">Protein</p>
                            <p class="font-bold text-gray-800">${recipe.Nutrition.protein}g</p>
                        </div>
                        <div>
                            <p class="text-gray-600">Carbs</p>
                            <p class="font-bold text-gray-800">${recipe.Nutrition.carbs}g</p>
                        </div>
                        <div>
                            <p class="text-gray-600">Fat</p>
                            <p class="font-bold text-gray-800">${recipe.Nutrition.fat}g</p>
                        </div>
                    </div>
                </div>
                
                <!-- Ingredients Section -->
                <div class="mb-4">
                    <button 
                        class="w-full flex justify-between items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition"
                        onclick="toggleSection(this, 'ingredients-${recipe._id.$oid}')"
                    >
                        <h3 class="font-semibold text-gray-800">Ingredients (${recipe.Ingredients.length})</h3>
                        <svg class="w-5 h-5 text-gray-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div id="ingredients-${recipe._id.$oid}" class="hidden mt-2 max-h-96 overflow-y-auto">
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            ${ingredientsList}
                        </div>
                    </div>
                </div>
                
                <!-- Steps Section -->
                <div>
                    <button 
                        class="w-full flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        onclick="toggleSection(this, 'steps-${recipe._id.$oid}')"
                    >
                        <h3 class="font-semibold text-gray-800">Instructions</h3>
                        <svg class="w-5 h-5 text-gray-600 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div id="steps-${recipe._id.$oid}" class="hidden mt-2">
                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <ol class="list-decimal list-inside space-y-2">
                                ${stepsList}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleSection(button, sectionId) {
    const section = document.getElementById(sectionId);
    const icon = button.querySelector('svg');
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        icon.style.transform = 'rotate(180deg)';
    } else {
        section.classList.add('hidden');
        icon.style.transform = 'rotate(0deg)';
    }
}

