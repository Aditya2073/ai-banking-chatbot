// =============================================
// CHATBOT.JS - Chatbot Widget Logic
// =============================================

const CHAT_API = '';
let chatToken = localStorage.getItem('token');

// Toggle Chatbot Window
function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    chatWindow.classList.toggle('open');

    if (chatWindow.classList.contains('open')) {
        document.getElementById('chatInput').focus();
        loadChatHistory();
    }
}

// Send Chat Message
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to UI
    appendMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        const res = await fetch(`${CHAT_API}/api/chatbot/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatToken}`
            },
            body: JSON.stringify({ message })
        });

        // Remove typing indicator
        removeTypingIndicator();

        if (!res.ok) {
            throw new Error('Failed to get response');
        }

        const data = await res.json();
        appendMessage(data.response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        appendMessage('Sorry, I encountered an error. Please try again later. 😔', 'bot');
        console.error('Chatbot error:', error);
    }
}

// Append message to chat
function appendMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const avatar = sender === 'bot' ? '🤖' : '👤';

    // Convert text formatting for display
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/• /g, '&bull; ');

    const messageHtml = `
        <div class="chat-message ${sender}">
            <div class="message-avatar">${avatar}</div>
            <div>
                <div class="message-bubble">${formattedText}</div>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Typing Indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingHtml = `
        <div class="chat-message bot" id="typingIndicator">
            <div class="message-avatar">🤖</div>
            <div>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', typingHtml);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Disable send button while typing
    document.getElementById('chatSendBtn').disabled = true;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
    document.getElementById('chatSendBtn').disabled = false;
}

// Handle Enter key
function handleChatKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
}

// Load Chat History
async function loadChatHistory() {
    try {
        const res = await fetch(`${CHAT_API}/api/chatbot/history`, {
            headers: {
                'Authorization': `Bearer ${chatToken}`
            }
        });

        if (!res.ok) return;

        const data = await res.json();
        const history = data.history || [];

        if (history.length === 0) return;

        const messagesContainer = document.getElementById('chatMessages');

        // Only load history if the container just has the welcome message
        if (messagesContainer.children.length <= 1) {
            history.forEach(entry => {
                appendMessage(entry.message, 'user');
                appendMessage(entry.response, 'bot');
            });
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}
