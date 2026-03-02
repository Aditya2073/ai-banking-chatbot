// =============================================
// AUTH.JS - Login & Register Logic
// =============================================

const API_BASE = '';

// Check if already logged in
(function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        redirectToDashboard(user.role);
    }
})();

// Tab Switching
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const alertBox = document.getElementById('alertBox');

    alertBox.classList.remove('show');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// Show Alert
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');

    alertBox.className = `alert alert-${type} show`;
    alertText.textContent = message;

    if (type === 'success') {
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 3000);
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    btn.disabled = true;
    btn.textContent = '⏳ Signing in...';

    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showAlert('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            redirectToDashboard(data.user.role);
        }, 800);
    } catch (error) {
        showAlert(error.message, 'error');
        btn.disabled = false;
        btn.textContent = '🔐 Sign In';
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const btn = document.getElementById('registerBtn');

    btn.disabled = true;
    btn.textContent = '⏳ Creating account...';

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        showAlert(data.message, 'success');

        // Switch to login tab
        setTimeout(() => {
            switchTab('login');
            document.getElementById('loginEmail').value = email;
        }, 1500);
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '✨ Create Account';
    }
}

// Redirect based on role
function redirectToDashboard(role) {
    if (role === 'staff') {
        window.location.href = '/staff.html';
    } else {
        window.location.href = '/customer.html';
    }
}
