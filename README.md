# 🏦 AI Based Banking Chatbot System

An intelligent banking chatbot system powered by **DeepSeek AI** that provides 24/7 banking assistance. Built with Node.js, Express, MySQL, and a premium dark-themed UI with glassmorphism effects.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?logo=mysql&logoColor=white)
![DeepSeek](https://img.shields.io/badge/AI-DeepSeek-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- 🤖 **AI Chatbot** — Powered by DeepSeek API with smart fallback responses
- 🔐 **Secure Authentication** — JWT-based login with role-based access (Customer / Bank Staff)
- 💰 **Balance Enquiry** — View account balances and account details
- 📋 **Transaction History** — Full history of credits, debits, and transfers
- 💸 **Money Transfer** — Secure fund transfers between accounts (atomic DB transactions)
- 👥 **Staff Dashboard** — Monitor customers, transactions, and banking stats
- 🎨 **Premium UI** — Dark theme, glassmorphism, animated particles, fully responsive

---

## 📋 Prerequisites

| Requirement | Mac | Windows |
|-------------|-----|---------|
| **Node.js** (v18+) | `brew install node` | Download from [nodejs.org](https://nodejs.org/) |
| **MySQL** (v8.0+) | `brew install mysql` | Download from [dev.mysql.com](https://dev.mysql.com/downloads/installer/) |
| **Git** | `brew install git` | Download from [git-scm.com](https://git-scm.com/downloads) |

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Aditya2073/ai-banking-chatbot.git
cd ai-banking-chatbot
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up MySQL Database

#### On Mac:
```bash
# Start MySQL service
brew services start mysql

# Login to MySQL
mysql -u root

# Run the schema file
source database/schema.sql
```

#### On Windows:
```bash
# Open MySQL Command Line Client (from Start Menu)
# Or use the terminal:
mysql -u root -p

# Then run the schema:
source database/schema.sql
```

> **Note:** If your MySQL root user has a password, you'll be prompted to enter it.

### Step 4: Configure Environment Variables

Open the `.env` file and update these values:

```env
# If your MySQL root user has a password, add it here
DB_PASSWORD=your_mysql_password

# Add your DeepSeek API key
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

💡 **Get a DeepSeek API key** from [platform.deepseek.com](https://platform.deepseek.com/)

> The chatbot will still work without an API key using built-in fallback responses.

### Step 5: Start the Server

```bash
npm start
```

You should see:
```
🏦 Banking Chatbot Server running on http://localhost:3000
✅ Database connected successfully
```

### Step 6: Open in Browser

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Default Login Credentials

The database comes with pre-seeded users for testing:

| Email | Password | Role |
|-------|----------|------|
| `sambodhi@bank.com` | `password123` | Customer |
| `rahul@bank.com` | `password123` | Customer |
| `priya@bank.com` | `password123` | Customer |
| `admin@bank.com` | `password123` | Staff |
| `manager@bank.com` | `password123` | Staff |

---

## 📁 Project Structure

```
ai-banking-chatbot/
├── server.js                  # Express server entry point
├── package.json               # Project dependencies
├── .env                       # Environment configuration
├── .gitignore                 # Git ignore rules
├── config/
│   └── db.js                  # MySQL database connection pool
├── middleware/
│   └── auth.js                # JWT authentication & authorization
├── routes/
│   ├── auth.js                # Login & registration endpoints
│   ├── customer.js            # Customer banking operations
│   ├── staff.js               # Staff management endpoints
│   └── chatbot.js             # DeepSeek AI chatbot integration
├── database/
│   └── schema.sql             # Database schema & seed data
└── public/
    ├── index.html             # Login / Register page
    ├── customer.html          # Customer dashboard
    ├── staff.html             # Staff dashboard
    ├── css/
    │   └── style.css          # Complete design system
    └── js/
        ├── auth.js            # Authentication logic
        ├── customer.js        # Customer dashboard logic
        ├── staff.js           # Staff dashboard logic
        └── chatbot.js         # Chatbot widget logic
```

---

## 🛠️ API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Customer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customer/balance` | View account balance |
| GET | `/api/customer/transactions` | View transaction history |
| POST | `/api/customer/transfer` | Transfer money |

### Bank Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff/customers` | View all customers |
| GET | `/api/staff/customer/:id` | View customer details |
| GET | `/api/staff/transactions` | View all transactions |
| GET | `/api/staff/stats` | Get dashboard statistics |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message` | Send message to AI |
| GET | `/api/chatbot/history` | Get chat history |

---

## 🔧 Troubleshooting

### MySQL Connection Error
- **Mac:** Run `brew services start mysql` to ensure MySQL is running
- **Windows:** Open Services (`services.msc`) and start "MySQL80"
- Verify credentials in `.env` match your MySQL setup

### Port Already in Use
Change the `PORT` value in `.env`:
```env
PORT=3001
```

### DeepSeek API Not Working
- Verify your API key is correct in `.env`
- The chatbot will automatically use fallback responses if the API is unavailable

---

## 📄 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | MySQL |
| AI | DeepSeek API |
| Auth | JSON Web Tokens (JWT), bcryptjs |

---

## 👨‍🎓 Project Details

| | |
|---|---|
| **Project** | AI Based Banking Chatbot System |
| **Student** | Sambodhi Waghmare |
| **Roll No** | 6478 |
| **Class** | TY BCA |
| **Academic Year** | 2025–2026 |

---

## 📜 License

This project is for academic purposes under **Bachelor of Computer Applications (BCA)**.
