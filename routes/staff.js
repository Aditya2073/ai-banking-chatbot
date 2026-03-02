const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All staff routes require authentication and staff role
router.use(authenticate);
router.use(authorize('staff'));

// GET /api/staff/customers
router.get('/customers', async (req, res) => {
    try {
        const [customers] = await db.query(
            `SELECT u.id, u.name, u.email, u.created_at, 
                    a.account_number, a.balance, a.account_type
             FROM users u
             LEFT JOIN accounts a ON u.id = a.user_id
             WHERE u.role = 'customer'
             ORDER BY u.created_at DESC`
        );

        res.json({ customers });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/staff/customer/:id
router.get('/customer/:id', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, created_at FROM users WHERE id = ? AND role = ?',
            [req.params.id, 'customer']
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        const [accounts] = await db.query(
            'SELECT * FROM accounts WHERE user_id = ?',
            [req.params.id]
        );

        const accountNumbers = accounts.map(a => a.account_number);
        let transactions = [];

        if (accountNumbers.length > 0) {
            const [txns] = await db.query(
                `SELECT * FROM transactions 
                 WHERE from_account IN (?) OR to_account IN (?)
                 ORDER BY date DESC LIMIT 20`,
                [accountNumbers, accountNumbers]
            );
            transactions = txns;
        }

        res.json({
            customer: users[0],
            accounts,
            transactions
        });
    } catch (error) {
        console.error('Get customer details error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/staff/transactions
router.get('/transactions', async (req, res) => {
    try {
        const [transactions] = await db.query(
            `SELECT t.*, 
                    u1.name as sender_name
             FROM transactions t
             LEFT JOIN accounts a ON t.from_account = a.account_number
             LEFT JOIN users u1 ON a.user_id = u1.id
             ORDER BY t.date DESC
             LIMIT 100`
        );

        res.json({ transactions });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/staff/stats
router.get('/stats', async (req, res) => {
    try {
        const [customerCount] = await db.query(
            "SELECT COUNT(*) as count FROM users WHERE role = 'customer'"
        );

        const [totalBalance] = await db.query(
            'SELECT SUM(balance) as total FROM accounts'
        );

        const [transactionCount] = await db.query(
            'SELECT COUNT(*) as count FROM transactions'
        );

        const [recentTransactions] = await db.query(
            'SELECT COUNT(*) as count FROM transactions WHERE date >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
        );

        res.json({
            stats: {
                totalCustomers: customerCount[0].count,
                totalBalance: totalBalance[0].total || 0,
                totalTransactions: transactionCount[0].count,
                recentTransactions: recentTransactions[0].count
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
