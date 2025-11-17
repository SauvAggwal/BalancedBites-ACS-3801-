// Navigation and logout functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        });
    }
    
    // Profile button functionality
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', function() {
            const userEmail = sessionStorage.getItem('userEmail');
            alert('Profile page coming soon!\nLogged in as: ' + (userEmail || 'User'));
        });
    }
    
    // Highlight active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navLinks = document.querySelectorAll('nav a[href]');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'dashboard.html')) {
            link.classList.add('text-purple-600', 'font-semibold');
            link.classList.remove('text-gray-700');
        }
    });
});

