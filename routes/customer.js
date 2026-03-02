const express = require('express');
const db = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All customer routes require authentication and customer role
router.use(authenticate);
router.use(authorize('customer'));

// GET /api/customer/balance
router.get('/balance', async (req, res) => {
    try {
        const [accounts] = await db.query(
            'SELECT account_number, balance, account_type, created_at FROM accounts WHERE user_id = ?',
            [req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ message: 'No accounts found.' });
        }

        res.json({ accounts });
    } catch (error) {
        console.error('Balance error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/customer/transactions
router.get('/transactions', async (req, res) => {
    try {
        // Get user's account numbers
        const [accounts] = await db.query(
            'SELECT account_number FROM accounts WHERE user_id = ?',
            [req.user.id]
        );

        if (accounts.length === 0) {
            return res.json({ transactions: [] });
        }

        const accountNumbers = accounts.map(a => a.account_number);

        // Get transactions for all user accounts
        const [transactions] = await db.query(
            `SELECT * FROM transactions 
             WHERE from_account IN (?) OR to_account IN (?)
             ORDER BY date DESC LIMIT 50`,
            [accountNumbers, accountNumbers]
        );

        res.json({ transactions });
    } catch (error) {
        console.error('Transactions error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/customer/transfer
router.post('/transfer', async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { toAccount, amount, description } = req.body;

        if (!toAccount || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid recipient account and amount are required.' });
        }

        await connection.beginTransaction();

        // Get sender's account
        const [senderAccounts] = await connection.query(
            'SELECT * FROM accounts WHERE user_id = ? LIMIT 1',
            [req.user.id]
        );

        if (senderAccounts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Sender account not found.' });
        }

        const senderAccount = senderAccounts[0];

        // Check sufficient balance
        if (parseFloat(senderAccount.balance) < parseFloat(amount)) {
            await connection.rollback();
            return res.status(400).json({ message: 'Insufficient balance.' });
        }

        // Verify recipient account exists
        const [recipientAccounts] = await connection.query(
            'SELECT * FROM accounts WHERE account_number = ?',
            [toAccount]
        );

        if (recipientAccounts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Recipient account not found.' });
        }

        // Debit sender
        await connection.query(
            'UPDATE accounts SET balance = balance - ? WHERE account_number = ?',
            [amount, senderAccount.account_number]
        );

        // Credit recipient
        await connection.query(
            'UPDATE accounts SET balance = balance + ? WHERE account_number = ?',
            [amount, toAccount]
        );

        // Record transaction
        await connection.query(
            'INSERT INTO transactions (from_account, to_account, amount, transaction_type, description) VALUES (?, ?, ?, ?, ?)',
            [senderAccount.account_number, toAccount, amount, 'transfer', description || 'Fund transfer']
        );

        await connection.commit();

        // Get updated balance
        const [updatedAccount] = await db.query(
            'SELECT balance FROM accounts WHERE account_number = ?',
            [senderAccount.account_number]
        );

        res.json({
            message: 'Transfer successful!',
            newBalance: updatedAccount[0].balance
        });
    } catch (error) {
        await connection.rollback();
        console.error('Transfer error:', error);
        res.status(500).json({ message: 'Server error during transfer.' });
    } finally {
        connection.release();
    }
});

module.exports = router;
