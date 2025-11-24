// Profile page functionality
let profileData = {};
let goalsData = {};
let securityData = {};

document.addEventListener('DOMContentLoaded', function() {
    // Load data from localStorage
    loadProfileData();
    loadGoalsData();
    loadSecurityData();
    
    // Initialize
    setupTabs();
    setupEventListeners();
    displayProfileData();
    displayGoalsData();
    displaySecurityData();
    displaySessions();
});

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
            
            if (tabName === 'profile') {
                document.getElementById('profileTab').classList.remove('hidden');
            } else if (tabName === 'goals') {
                document.getElementById('goalsTab').classList.remove('hidden');
            } else if (tabName === 'security') {
                document.getElementById('securityTab').classList.remove('hidden');
            }
        });
    });
}

function setupEventListeners() {
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
    
    // Goals form
    document.getElementById('goalsForm').addEventListener('submit', saveGoals);
    
    // Password form
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
    
    // Two-factor authentication toggle
    document.getElementById('twoFactorToggle').addEventListener('change', function() {
        const setupDiv = document.getElementById('twoFactorSetup');
        if (this.checked) {
            setupDiv.classList.remove('hidden');
            securityData.twoFactorEnabled = true;
        } else {
            setupDiv.classList.add('hidden');
            securityData.twoFactorEnabled = false;
        }
        saveSecurityData();
    });
    
    // Security settings toggles
    document.getElementById('loginNotifications').addEventListener('change', function() {
        securityData.loginNotifications = this.checked;
        saveSecurityData();
    });
    
    document.getElementById('emailVerification').addEventListener('change', function() {
        securityData.emailVerification = this.checked;
        saveSecurityData();
    });
}

function loadProfileData() {
    const saved = localStorage.getItem('profileData');
    if (saved) {
        profileData = JSON.parse(saved);
    } else {
        // Default values
        profileData = {
            name: '',
            email: '',
            age: '',
            gender: '',
            weight: '',
            heightFeet: '',
            heightInches: '',
            bio: ''
        };
    }
}

function loadGoalsData() {
    const saved = localStorage.getItem('goalsData');
    if (saved) {
        goalsData = JSON.parse(saved);
    } else {
        // Try to load from progressData
        const progressData = JSON.parse(localStorage.getItem('progressData') || '{}');
        goalsData = {
            currentWeight: progressData.currentWeight || '',
            goalWeight: progressData.goals?.weight || '',
            bodyType: '',
            calories: progressData.goals?.calories || '',
            protein: progressData.goals?.protein || '',
            carbs: '',
            fat: '',
            activityLevel: ''
        };
    }
}

function loadSecurityData() {
    const saved = localStorage.getItem('securityData');
    if (saved) {
        securityData = JSON.parse(saved);
    } else {
        securityData = {
            twoFactorEnabled: false,
            loginNotifications: true,
            emailVerification: true,
            sessions: []
        };
    }
}

function displayProfileData() {
    document.getElementById('profileName').value = profileData.name || '';
    document.getElementById('profileEmail').value = profileData.email || sessionStorage.getItem('userEmail') || '';
    document.getElementById('profileAge').value = profileData.age || '';
    document.getElementById('profileGender').value = profileData.gender || '';
    document.getElementById('profileWeight').value = profileData.weight || '';
    document.getElementById('profileHeightFeet').value = profileData.heightFeet || '';
    document.getElementById('profileHeightInches').value = profileData.heightInches || '';
    document.getElementById('profileBio').value = profileData.bio || '';
}

function displayGoalsData() {
    document.getElementById('goalCurrentWeight').value = goalsData.currentWeight || '';
    document.getElementById('goalWeight').value = goalsData.goalWeight || '';
    
    // Set body type radio
    if (goalsData.bodyType) {
        document.querySelector(`input[name="bodyType"][value="${goalsData.bodyType}"]`).checked = true;
    }
    
    document.getElementById('goalCalories').value = goalsData.calories || '';
    document.getElementById('goalProtein').value = goalsData.protein || '';
    document.getElementById('goalCarbs').value = goalsData.carbs || '';
    document.getElementById('goalFat').value = goalsData.fat || '';
    document.getElementById('goalActivityLevel').value = goalsData.activityLevel || '';
}

function displaySecurityData() {
    document.getElementById('twoFactorToggle').checked = securityData.twoFactorEnabled || false;
    if (securityData.twoFactorEnabled) {
        document.getElementById('twoFactorSetup').classList.remove('hidden');
    }
    
    document.getElementById('loginNotifications').checked = securityData.loginNotifications !== false;
    document.getElementById('emailVerification').checked = securityData.emailVerification !== false;
}

function displaySessions() {
    const container = document.getElementById('sessionsList');
    
    // Get current session
    const currentSession = {
        id: 'current',
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
        browser: getBrowserName(),
        location: 'Current Location',
        lastActive: 'Now',
        current: true
    };
    
    // Get other sessions from storage
    const sessions = securityData.sessions || [];
    const allSessions = [currentSession, ...sessions.filter(s => !s.current)];
    
    if (allSessions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No active sessions</p>';
        return;
    }
    
    container.innerHTML = allSessions.map(session => `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg ${session.current ? 'bg-green-50 border-green-200' : ''}">
            <div class="flex-1">
                <div class="flex items-center space-x-2">
                    <h3 class="font-medium text-gray-800">${session.device}</h3>
                    ${session.current ? '<span class="px-2 py-1 text-xs bg-green-600 text-white rounded">Current</span>' : ''}
                </div>
                <p class="text-sm text-gray-600 mt-1">${session.browser} • ${session.location}</p>
                <p class="text-xs text-gray-500 mt-1">Last active: ${session.lastActive}</p>
            </div>
            ${!session.current ? `
                <button 
                    onclick="revokeSession('${session.id}')"
                    class="ml-4 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition text-sm"
                >
                    Revoke
                </button>
            ` : ''}
        </div>
    `).join('');
}

function getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
}

function saveProfile(e) {
    e.preventDefault();
    
    profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        age: document.getElementById('profileAge').value,
        gender: document.getElementById('profileGender').value,
        weight: document.getElementById('profileWeight').value,
        heightFeet: document.getElementById('profileHeightFeet').value,
        heightInches: document.getElementById('profileHeightInches').value,
        bio: document.getElementById('profileBio').value
    };
    
    localStorage.setItem('profileData', JSON.stringify(profileData));
    
    // Update session storage email if changed
    if (profileData.email) {
        sessionStorage.setItem('userEmail', profileData.email);
    }
    
    alert('Profile updated successfully!');
}

function saveGoals(e) {
    e.preventDefault();
    
    const bodyType = document.querySelector('input[name="bodyType"]:checked');
    
    goalsData = {
        currentWeight: document.getElementById('goalCurrentWeight').value,
        goalWeight: document.getElementById('goalWeight').value,
        bodyType: bodyType ? bodyType.value : '',
        calories: document.getElementById('goalCalories').value,
        protein: document.getElementById('goalProtein').value,
        carbs: document.getElementById('goalCarbs').value,
        fat: document.getElementById('goalFat').value,
        activityLevel: document.getElementById('goalActivityLevel').value
    };
    
    localStorage.setItem('goalsData', JSON.stringify(goalsData));
    
    // Also update progressData
    const progressData = JSON.parse(localStorage.getItem('progressData') || '{}');
    if (!progressData.goals) progressData.goals = {};
    
    if (goalsData.currentWeight) {
        progressData.currentWeight = parseFloat(goalsData.currentWeight);
    }
    if (goalsData.goalWeight) {
        progressData.goals.weight = parseFloat(goalsData.goalWeight);
    }
    if (goalsData.calories) {
        progressData.goals.calories = parseInt(goalsData.calories);
    }
    if (goalsData.protein) {
        progressData.goals.protein = parseFloat(goalsData.protein);
    }
    
    localStorage.setItem('progressData', JSON.stringify(progressData));
    
    alert('Goals saved successfully!');
}

function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Please fill in all password fields');
        return;
    }
    
    if (newPassword.length < 8) {
        alert('New password must be at least 8 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    // In a real app, this would make an API call to change the password
    // For now, we'll just show a success message
    alert('Password changed successfully!');
    
    // Clear form
    document.getElementById('passwordForm').reset();
}

function revokeSession(sessionId) {
    if (confirm('Are you sure you want to revoke this session?')) {
        securityData.sessions = securityData.sessions.filter(s => s.id !== sessionId);
        saveSecurityData();
        displaySessions();
    }
}

function saveSecurityData() {
    localStorage.setItem('securityData', JSON.stringify(securityData));
}

// Make function available globally for onclick handlers
window.revokeSession = revokeSession;

