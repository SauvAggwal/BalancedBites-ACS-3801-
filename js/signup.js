// Sign up functionality
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const twoStepToggle = document.getElementById('twoStepVerification');
    const twoStepInfo = document.getElementById('twoStepInfo');
    
    // Two-step verification toggle
    if (twoStepToggle) {
        twoStepToggle.addEventListener('change', function() {
            if (this.checked) {
                twoStepInfo.classList.remove('hidden');
            } else {
                twoStepInfo.classList.add('hidden');
            }
        });
    }
    
    // Form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const weight = parseFloat(document.getElementById('signupWeight').value);
            const dietGoal = document.getElementById('dietGoal').value;
            const twoStepEnabled = document.getElementById('twoStepVerification').checked;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Validation
            if (!fullName || !email || !password || !confirmPassword || !weight || !dietGoal) {
                alert('Please fill in all required fields');
                return;
            }
            
            if (password.length < 8) {
                alert('Password must be at least 8 characters long');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (!agreeTerms) {
                alert('Please agree to the Terms of Service and Privacy Policy');
                return;
            }
            
            // Check if email already exists (in a real app, this would check a database)
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            if (existingUsers.find(user => user.email === email)) {
                alert('An account with this email already exists. Please login instead.');
                return;
            }
            
            // Create user account
            const newUser = {
                id: Date.now(),
                name: fullName,
                email: email,
                password: password, // In a real app, this would be hashed
                weight: weight,
                dietGoal: dietGoal,
                twoStepVerification: twoStepEnabled,
                createdAt: new Date().toISOString()
            };
            
            // Save user to localStorage
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));
            
            // Save profile data
            const profileData = {
                name: fullName,
                email: email,
                weight: weight.toString(),
                heightFeet: '',
                heightInches: '',
                age: '',
                gender: '',
                bio: ''
            };
            localStorage.setItem('profileData', JSON.stringify(profileData));
            
            // Save goals data based on diet goal
            const goalsData = {
                currentWeight: weight.toString(),
                goalWeight: '',
                bodyType: '',
                calories: getDefaultCalories(dietGoal, weight),
                protein: getDefaultProtein(dietGoal),
                carbs: '',
                fat: '',
                activityLevel: ''
            };
            localStorage.setItem('goalsData', JSON.stringify(goalsData));
            
            // Save progress data
            const progressData = {
                weight: [],
                calories: [],
                macros: [],
                goals: {
                    weight: '',
                    calories: goalsData.calories,
                    protein: goalsData.protein
                },
                startingWeight: weight,
                currentWeight: weight
            };
            localStorage.setItem('progressData', JSON.stringify(progressData));
            
            // Save security data
            const securityData = {
                twoFactorEnabled: twoStepEnabled,
                loginNotifications: true,
                emailVerification: true,
                sessions: []
            };
            localStorage.setItem('securityData', JSON.stringify(securityData));
            
            // Set login state
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('userName', fullName);
            
            // Show success message
            alert('Account created successfully! Welcome to BalancedBites!');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        });
    }
    
    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
        window.location.href = 'dashboard.html';
    }
});

// Helper function to get default calories based on diet goal and weight
function getDefaultCalories(dietGoal, weight) {
    const baseCalories = weight * 15; // Base calculation
    
    switch(dietGoal) {
        case 'weight-loss':
            return Math.round(baseCalories * 0.85); // 15% deficit
        case 'weight-gain':
            return Math.round(baseCalories * 1.15); // 15% surplus
        case 'muscle-gain':
            return Math.round(baseCalories * 1.2); // 20% surplus
        case 'maintain-weight':
            return Math.round(baseCalories);
        case 'improve-health':
            return Math.round(baseCalories);
        case 'athletic-performance':
            return Math.round(baseCalories * 1.25); // 25% surplus
        default:
            return Math.round(baseCalories);
    }
}

// Helper function to get default protein based on diet goal
function getDefaultProtein(dietGoal) {
    switch(dietGoal) {
        case 'weight-loss':
            return 120; // Higher protein for weight loss
        case 'muscle-gain':
            return 150; // Higher protein for muscle gain
        case 'athletic-performance':
            return 140; // Higher protein for athletes
        default:
            return 100; // Standard protein
    }
}

