// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (email && password) {
                // Store login state in sessionStorage
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert('Please fill in all fields');
            }
        });
    }
    
    // Check if user is logged in when accessing protected pages
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    // If not on login page and not logged in, redirect to login
    if (!isLoggedIn && !currentPage.includes('index.html') && currentPage !== '/') {
        window.location.href = 'index.html';
    }
    
    // If logged in and on login page, redirect to dashboard
    if (isLoggedIn && (currentPage.includes('index.html') || currentPage === '/')) {
        window.location.href = 'dashboard.html';
    }
});

