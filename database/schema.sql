-- AI Based Banking Chatbot System
-- Database Schema

CREATE DATABASE IF NOT EXISTS banking_chatbot;
USE banking_chatbot;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'staff') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    account_type ENUM('savings', 'current') DEFAULT 'savings',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account VARCHAR(20) NOT NULL,
    to_account VARCHAR(20),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
    description VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account) REFERENCES accounts(account_number) ON DELETE CASCADE
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- SEED DATA
-- ============================================

-- Password for all seeded users is: password123
-- (bcrypt hash of 'password123')
INSERT INTO users (name, email, password, role) VALUES
('Sambodhi Waghmare', 'sambodhi@bank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('Rahul Sharma', 'rahul@bank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('Priya Patel', 'priya@bank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer'),
('Admin Staff', 'admin@bank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff'),
('Manager Staff', 'manager@bank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff');

-- Accounts
INSERT INTO accounts (user_id, account_number, balance, account_type) VALUES
(1, 'ACC1001000001', 75000.00, 'savings'),
(2, 'ACC1001000002', 120000.50, 'savings'),
(3, 'ACC1001000003', 45000.75, 'current');

-- Sample Transactions
INSERT INTO transactions (from_account, to_account, amount, transaction_type, description) VALUES
('ACC1001000001', NULL, 5000.00, 'credit', 'Salary deposit'),
('ACC1001000001', NULL, 1500.00, 'debit', 'ATM Withdrawal'),
('ACC1001000001', 'ACC1001000002', 3000.00, 'transfer', 'Transfer to Rahul'),
('ACC1001000002', NULL, 10000.00, 'credit', 'Freelance payment'),
('ACC1001000002', NULL, 2000.00, 'debit', 'Online shopping'),
('ACC1001000003', NULL, 25000.00, 'credit', 'Business income'),
('ACC1001000003', NULL, 5000.00, 'debit', 'Utility bill payment');
