// =============================================
// STAFF.JS - Bank Staff Dashboard Logic
// =============================================

const API_BASE = '';
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');

// Auth check
(function init() {
    if (!token || !user || user.role !== 'staff') {
        window.location.href = '/';
        return;
    }

    // Set user info in sidebar
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = 'Bank Staff';
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

    // Load initial data
    loadDashboard();
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
    document.querySelectorAll('.section-panel').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`section-${section}`).classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    switch (section) {
        case 'overview': loadDashboard(); break;
        case 'customers': loadCustomers(); break;
        case 'transactions': loadAllTransactions(); break;
    }

    document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Load Dashboard
async function loadDashboard() {
    try {
        const [statsRes, txnRes] = await Promise.all([
            apiCall('/api/staff/stats'),
            apiCall('/api/staff/transactions')
        ]);

        const statsData = await statsRes.json();
        const txnData = await txnRes.json();
        const stats = statsData.stats;

        document.getElementById('totalCustomers').textContent = stats.totalCustomers;
        document.getElementById('totalDeposits').textContent = `₹${parseFloat(stats.totalBalance).toLocaleString('en-IN')}`;
        document.getElementById('totalTxns').textContent = stats.totalTransactions;
        document.getElementById('recentTxns').textContent = stats.recentTransactions;

        // Recent activity
        const transactions = txnData.transactions || [];
        const tbody = document.getElementById('recentActivityBody');

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📋</div><p>No transactions found</p></div></td></tr>';
        } else {
            tbody.innerHTML = transactions.slice(0, 10).map(t => `
                <tr>
                    <td>${new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>${t.sender_name || 'N/A'}</td>
                    <td>${t.from_account}</td>
                    <td>${t.to_account || '—'}</td>
                    <td><span class="badge badge-${t.transaction_type}">${t.transaction_type}</span></td>
                    <td style="font-weight: 600;">₹${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Customers
async function loadCustomers() {
    try {
        const res = await apiCall('/api/staff/customers');
        const data = await res.json();
        const customers = data.customers || [];

        const tbody = document.getElementById('customersBody');

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">👥</div><p>No customers found</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(c => `
            <tr>
                <td style="font-weight: 600; color: var(--text-primary);">${c.name}</td>
                <td>${c.email}</td>
                <td style="font-family: monospace; font-size: 12px;">${c.account_number || 'N/A'}</td>
                <td style="font-weight: 600; color: var(--success-light);">₹${c.balance ? parseFloat(c.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}</td>
                <td><span class="badge badge-transfer">${c.account_type || 'N/A'}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="viewCustomerDetails(${c.id})">
                        👁 View
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load All Transactions
async function loadAllTransactions() {
    try {
        const res = await apiCall('/api/staff/transactions');
        const data = await res.json();
        const transactions = data.transactions || [];

        const tbody = document.getElementById('allTransactionsBody');

        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><p>No transactions found</p></div></td></tr>';
            return;
        }

        tbody.innerHTML = transactions.map(t => `
            <tr>
                <td>${new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>${t.sender_name || 'N/A'}</td>
                <td style="font-family: monospace; font-size: 12px;">${t.from_account}</td>
                <td style="font-family: monospace; font-size: 12px;">${t.to_account || '—'}</td>
                <td>${t.description || 'N/A'}</td>
                <td><span class="badge badge-${t.transaction_type}">${t.transaction_type}</span></td>
                <td style="font-weight: 600;">₹${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// View Customer Details
async function viewCustomerDetails(customerId) {
    const modal = document.getElementById('customerModal');
    const modalBody = document.getElementById('customerModalBody');

    modal.classList.add('open');
    modalBody.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

    try {
        const res = await apiCall(`/api/staff/customer/${customerId}`);
        const data = await res.json();

        const customer = data.customer;
        const accounts = data.accounts || [];
        const transactions = data.transactions || [];

        modalBody.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                    <div class="user-avatar" style="width: 50px; height: 50px; font-size: 20px;">
                        ${customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 style="font-size: 18px; margin-bottom: 2px;">${customer.name}</h3>
                        <p style="color: var(--text-muted); font-size: 13px;">${customer.email}</p>
                        <p style="color: var(--text-muted); font-size: 12px;">Customer since ${new Date(customer.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 24px;">
                <h4 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Accounts</h4>
                ${accounts.map(a => `
                    <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-family: monospace; font-size: 13px; color: var(--text-muted);">${a.account_number}</div>
                                <div style="font-size: 12px; color: var(--text-muted); text-transform: capitalize;">${a.account_type} Account</div>
                            </div>
                            <div style="font-size: 20px; font-weight: 700; color: var(--success-light);">
                                ₹${parseFloat(a.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div>
                <h4 style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Recent Transactions</h4>
                ${transactions.length === 0
                ? '<p style="color: var(--text-muted); font-size: 13px;">No transactions found</p>'
                : `<table class="data-table" style="font-size: 12px;">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(t => `
                                <tr>
                                    <td>${new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                                    <td>${t.description || 'N/A'}</td>
                                    <td><span class="badge badge-${t.transaction_type}">${t.transaction_type}</span></td>
                                    <td style="font-weight: 600;">₹${parseFloat(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`
            }
            </div>
        `;
    } catch (error) {
        modalBody.innerHTML = '<div class="empty-state"><p>Error loading customer details</p></div>';
        console.error('Error:', error);
    }
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('customerModal').addEventListener('click', function (e) {
    if (e.target === this) closeCustomerModal();
});

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '/';
}
