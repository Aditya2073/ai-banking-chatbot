// =============================================
// CUSTOMER.JS - Customer Dashboard Logic
// =============================================

const API_BASE = '';
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');

// Auth check
(function init() {
    if (!token || !user || user.role !== 'customer') {
        window.location.href = '/';
        return;
    }

    // Set user info in sidebar
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = 'Customer';
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

    // Load initial data
    loadOverview();
})();

// API call helper
async function apiCall(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

    if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/';
        return;
    }

    return res;
}

// Section Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section-panel').forEach(el => {
        el.classList.remove('active');
    });

    // Remove active class from nav links
    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`section-${section}`).classList.add('active');

    // Set active nav
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Load section data
    switch (section) {
        case 'overview': loadOverview(); break;
        case 'balance': loadBalance(); break;
        case 'transactions': loadTransactions(); break;
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

// Toggle mobile sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Load Overview
async function loadOverview() {
    try {
        const [balanceRes, txnRes] = await Promise.all([
            apiCall('/api/customer/balance'),
            apiCall('/api/customer/transactions')
        ]);

        const balanceData = await balanceRes.json();
        const txnData = await txnRes.json();

        // Calculate overview stats
        const accounts = balanceData.accounts || [];
        const transactions = txnData.transactions || [];

        const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
        const totalCredits = transactions
            .filter(t => t.transaction_type === 'credit')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalDebits = transactions
            .filter(t => t.transaction_type === 'debit' || t.transaction_type === 'transfer')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        document.getElementById('totalBalance').textContent = `₹${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        document.getElementById('accountCount').textContent = accounts.length;
        document.getElementById('totalCredits').textContent = `₹${totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        document.getElementById('totalDebits').textContent = `₹${totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        // Show recent transactions (top 5)
        const recentTbody = document.getElementById('recentTransactionsBody');
        if (transactions.length === 0) {
            recentTbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📋</div><p>No transactions yet</p></div></td></tr>';
        } else {
            recentTbody.innerHTML = transactions.slice(0, 5).map(t => `
                <tr>
                    <td>${new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>${t.description || 'N/A'}</td>
                    <td><span class="badge badge-${t.transaction_type}">${t.transaction_type}</span></td>
                    <td style="color: ${t.transaction_type === 'credit' ? 'var(--success-light)' : 'var(--error-light)'}; font-weight: 600;">
                        ${t.transaction_type === 'credit' ? '+' : '-'}₹${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Load Balance / Accounts
async function loadBalance() {
    try {
        const res = await apiCall('/api/customer/balance');
        const data = await res.json();
        const accounts = data.accounts || [];

        const container = document.getElementById('accountCards');

        if (accounts.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏦</div><p>No accounts found</p></div>';
            return;
        }

        container.innerHTML = accounts.map(a => `
            <div class="stat-card">
                <div class="stat-icon">🏦</div>
                <div class="stat-value">₹${parseFloat(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div class="stat-label">${a.account_type} Account</div>
                <div style="margin-top: 12px; font-size: 12px; color: var(--text-muted);">
                    <div>Account: ${a.account_number}</div>
                    <div>Since: ${new Date(a.created_at).toLocaleDateString('en-IN')}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}

// Load Transactions
async function loadTransactions() {
    try {
        const res = await apiCall('/api/customer/transactions');
        const data = await res.json();
        const transactions = data.transactions || [];

        const tbody = document.getElementById('allTransactionsBody');

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📋</div><p>No transactions yet</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(t => `
            <tr>
                <td>${new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>${t.description || 'N/A'}</td>
                <td>${t.from_account}</td>
                <td>${t.to_account || '—'}</td>
                <td><span class="badge badge-${t.transaction_type}">${t.transaction_type}</span></td>
                <td style="color: ${t.transaction_type === 'credit' ? 'var(--success-light)' : 'var(--error-light)'}; font-weight: 600;">
                    ${t.transaction_type === 'credit' ? '+' : '-'}₹${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Handle Transfer
async function handleTransfer(e) {
    e.preventDefault();

    const toAccount = document.getElementById('transferTo').value;
    const amount = document.getElementById('transferAmount').value;
    const description = document.getElementById('transferDesc').value;
    const btn = document.getElementById('transferBtn');
    const alertBox = document.getElementById('transferAlert');
    const alertText = document.getElementById('transferAlertText');

    btn.disabled = true;
    btn.textContent = '⏳ Processing...';

    try {
        const res = await apiCall('/api/customer/transfer', {
            method: 'POST',
            body: JSON.stringify({ toAccount, amount: parseFloat(amount), description })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Transfer failed');
        }

        alertBox.className = 'alert alert-success show';
        alertText.textContent = `${data.message} New balance: ₹${parseFloat(data.newBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        // Clear form
        document.getElementById('transferTo').value = '';
        document.getElementById('transferAmount').value = '';
        document.getElementById('transferDesc').value = '';

        // Refresh overview data
        loadOverview();
    } catch (error) {
        alertBox.className = 'alert alert-error show';
        alertText.textContent = error.message;
    } finally {
        btn.disabled = false;
        btn.textContent = '💸 Send Money';
    }
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '/';
}
