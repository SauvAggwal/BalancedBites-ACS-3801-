// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            // Check if user exists (in a real app, this would check a database)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            
            if (user) {
                // In a real app, password would be hashed and verified
                if (user.password === password) {
                    // Store login state in sessionStorage
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userEmail', email);
                    sessionStorage.setItem('userName', user.name);
                    
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Invalid email or password');
                }
            } else {
                // Allow login even if user doesn't exist (for backward compatibility)
                // In a real app, this would show an error
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                window.location.href = 'dashboard.html';
            }
        });
    }
    
    // Check if user is logged in when accessing protected pages
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.includes('index.html') || currentPage === '/';
    const isSignupPage = currentPage.includes('signup.html');
    
    // If not on login/signup page and not logged in, redirect to login
    if (!isLoggedIn && !isLoginPage && !isSignupPage) {
        window.location.href = 'index.html';
    }
    
    // If logged in and on login/signup page, redirect to dashboard
    if (isLoggedIn && (isLoginPage || isSignupPage)) {
        window.location.href = 'dashboard.html';
    }
});

