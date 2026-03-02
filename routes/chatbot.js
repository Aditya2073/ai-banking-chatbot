const express = require('express');
const fetch = require('node-fetch');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

const SYSTEM_PROMPT = `You are an AI banking assistant for a modern digital bank. Your name is BankBot. You help customers with:

1. **Account Information**: Balance inquiries, account types, account details
2. **Transaction Help**: Understanding transactions, transfer guidance, transaction history
3. **Banking Services**: Loan information, fixed deposits, credit cards, insurance
4. **General Banking**: Branch info, working hours, IFSC codes, banking procedures
5. **Security**: Safe banking tips, fraud prevention, password security
6. **Troubleshooting**: Common banking issues, card blocking, cheque book requests

Guidelines:
- Be polite, professional, and helpful
- Provide accurate banking information
- If asked about specific account details or balances, remind them to use the dashboard features
- Never ask for sensitive information like passwords or PINs
- Keep responses concise but informative
- Use emojis sparingly to make responses friendly
- If you don't know something, be honest and suggest contacting the bank directly
- Format responses with clear structure when providing multiple points`;

// POST /api/chatbot/message
router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message is required.' });
        }

        let botResponse;

        try {
            // Call DeepSeek API
            const apiResponse = await fetch(process.env.DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!apiResponse.ok) {
                throw new Error(`API returned status ${apiResponse.status}`);
            }

            const data = await apiResponse.json();
            botResponse = data.choices[0].message.content;
        } catch (apiError) {
            console.error('DeepSeek API error:', apiError.message);
            // Fallback responses if API fails
            botResponse = getFallbackResponse(message);
        }

        // Save to chat history
        await db.query(
            'INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)',
            [req.user.id, message, botResponse]
        );

        res.json({ response: botResponse });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/chatbot/history
router.get('/history', async (req, res) => {
    try {
        const [history] = await db.query(
            'SELECT message, response, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );

        res.json({ history: history.reverse() });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Fallback responses when API is unavailable
function getFallbackResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('balance') || msg.includes('account')) {
        return "💰 You can check your account balance on the dashboard. Navigate to the 'Balance' section to see your current balance and account details. If you need further assistance, please contact our helpline.";
    }

    if (msg.includes('transfer') || msg.includes('send money') || msg.includes('payment')) {
        return "💸 To transfer money, use the 'Transfer' section on your dashboard. You'll need the recipient's account number and the amount. All transfers are processed securely and instantly.";
    }

    if (msg.includes('transaction') || msg.includes('history') || msg.includes('statement')) {
        return "📋 Your transaction history is available on the dashboard. You can view all your recent credits, debits, and transfers with dates and descriptions.";
    }

    if (msg.includes('loan') || msg.includes('credit')) {
        return "🏦 We offer various loan products including Personal Loans, Home Loans, and Education Loans. Interest rates start from 7.5% per annum. Please visit your nearest branch or call our helpline for detailed information and eligibility.";
    }

    if (msg.includes('card') || msg.includes('atm') || msg.includes('debit')) {
        return "💳 For card-related services including new card requests, card blocking, or PIN changes, please visit the nearest branch or call our 24x7 helpline. You can also manage basic card settings through the dashboard.";
    }

    if (msg.includes('help') || msg.includes('support')) {
        return "🤝 I can help you with:\n• Balance inquiries\n• Transaction history\n• Money transfers\n• Loan information\n• Card services\n• General banking queries\n\nJust ask me anything about banking!";
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "👋 Hello! Welcome to our banking assistant. I'm BankBot, and I'm here to help you with all your banking needs. How can I assist you today?";
    }

    return "🏦 Thank you for your query. I'm here to help with banking-related questions including account details, transactions, transfers, loans, and more. Could you please rephrase your question or ask about a specific banking service?";
}

module.exports = router;
