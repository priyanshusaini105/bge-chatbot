// Chat Application
class ChatApp {
    constructor() {
        this.currentChatId = null;
        this.messages = [];
        this.messageIdCounter = 0;
        
        this.initElements();
        this.initEventListeners();
        this.initFromURL();
    }

    initElements() {
        this.elements = {
            chatForm: document.getElementById('chatForm'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            messages: document.getElementById('messages'),
            messagesArea: document.getElementById('messagesArea'),
            welcomeMessage: document.getElementById('welcomeMessage'),
            newChatBtn: document.getElementById('newChatBtn')
        };
    }

    initEventListeners() {
        // Form submission
        this.elements.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        // New chat button
        this.elements.newChatBtn.addEventListener('click', () => {
            this.createNewChat();
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.initFromURL();
        });
    }

    initFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('chat');
        
        if (chatId) {
            this.currentChatId = chatId;
            this.loadChat();
        } else {
            this.createNewChat();
        }
    }

    handleSendMessage() {
        const message = this.elements.messageInput.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        
        // Clear input
        this.elements.messageInput.value = '';
        
        // Disable send button while processing
        this.elements.sendBtn.disabled = true;
        
        // Show loading indicator
        const loaderId = this.showLoadingIndicator();
        
        // Generate bot response
        this.generateBotResponse(message).finally(() => {
            this.removeLoadingIndicator(loaderId);
            this.elements.sendBtn.disabled = false;
            this.elements.messageInput.focus();
        });
    }

    createNewChat() {
        // Generate unique chat ID
        this.currentChatId = this.generateUniqueId();
        this.messages = [];
        
        // Update URL with new chat ID
        this.updateURL();
        
        // Clear UI
        this.elements.messages.innerHTML = '';
        this.elements.welcomeMessage.style.display = 'flex';
        this.elements.messages.style.display = 'none';
        
        // Focus input
        this.elements.messageInput.focus();
    }

    generateUniqueId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('chat', this.currentChatId);
        window.history.pushState({}, '', url);
    }

    addMessage(sender, text) {
        // Hide welcome message on first message
        if (this.messages.length === 0) {
            this.elements.welcomeMessage.style.display = 'none';
            this.elements.messages.style.display = 'flex';
        }

        const messageId = this.messageIdCounter++;
        const timestamp = new Date().toISOString();
        
        const message = {
            id: messageId,
            sender,
            text,
            timestamp
        };

        // Add to messages
        this.messages.push(message);
        
        // Render message
        this.renderMessage(message);
        
        // Save to storage
        this.saveChat();
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.setAttribute('data-message-id', message.id);
        messageDiv.setAttribute('data-sender', message.sender);
        
        const isUser = message.sender === 'user';
        
        // Apply styles inline
        Object.assign(messageDiv.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: isUser ? 'fadeIn 0.4s ease-out' : 'slideIn 0.4s ease-out'
        });
        
        const label = document.createElement('div');
        Object.assign(label.style, {
            fontSize: '11px',
            fontWeight: '700',
            color: '#999999',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            textAlign: isUser ? 'right' : 'left',
            paddingLeft: isUser ? '0' : '4px',
            paddingRight: isUser ? '4px' : '0'
        });
        label.textContent = isUser ? 'You' : 'BGE Electrique';
        
        const messageBubble = document.createElement('div');
        Object.assign(messageBubble.style, {
            background: isUser ? '#000000' : '#ffffff',
            color: isUser ? '#ffffff' : '#000000',
            padding: '18px 22px',
            borderRadius: isUser ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
            border: '2px solid ' + (isUser ? '#000000' : '#e5e5e5'),
            maxWidth: isUser ? '85%' : '90%',
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            transition: 'transform 0.2s ease'
        });
        
        // Add hover effect
        messageBubble.addEventListener('mouseenter', () => {
            messageBubble.style.transform = 'translateY(-2px)';
        });
        
        messageBubble.addEventListener('mouseleave', () => {
            messageBubble.style.transform = 'translateY(0)';
        });
        
        const messageText = document.createElement('p');
        Object.assign(messageText.style, {
            fontSize: '15px',
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: '0'
        });
        
        // Render markdown for bot messages, plain text for user messages
        if (isUser) {
            messageText.textContent = message.text;
        } else {
            messageText.className = 'markdown-content';
            try {
                // Use marked.js to render markdown
                messageText.innerHTML = marked.parse(message.text);
            } catch (error) {
                console.error('Markdown parsing error:', error);
                messageText.textContent = message.text;
            }
        }
        
        messageBubble.appendChild(messageText);
        
        const timestamp = document.createElement('span');
        Object.assign(timestamp.style, {
            fontSize: '11px',
            color: '#bbbbbb',
            textAlign: isUser ? 'right' : 'left',
            display: 'block',
            paddingLeft: isUser ? '0' : '4px',
            paddingRight: isUser ? '4px' : '0',
            fontWeight: '500'
        });
        timestamp.textContent = this.formatTime(message.timestamp);
        
        messageDiv.appendChild(label);
        messageDiv.appendChild(messageBubble);
        messageDiv.appendChild(timestamp);
        
        this.elements.messages.appendChild(messageDiv);
    }

    async generateBotResponse(userMessage) {
        try {
            // Call the backend API
            const response = await fetch('http://localhost:3000/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    chatId: this.currentChatId
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            this.addMessage('bot', data.response);

        } catch (error) {
            console.error('Error fetching bot response:', error);
            
            // Fallback message if API fails
            const errorMessage = `I apologize, but I'm having trouble connecting to the server. Please make sure the backend is running at http://localhost:3000\n\nError: ${error.message}`;
            this.addMessage('bot', errorMessage);
        }
    }

    showLoadingIndicator() {
        // Hide welcome message on first message
        if (this.messages.length === 1) {
            this.elements.welcomeMessage.style.display = 'none';
            this.elements.messages.style.display = 'flex';
        }

        const loaderId = 'loader_' + Date.now();
        
        const loaderDiv = document.createElement('div');
        loaderDiv.setAttribute('data-loader-id', loaderId);
        loaderDiv.setAttribute('data-sender', 'bot');
        
        Object.assign(loaderDiv.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'slideIn 0.4s ease-out'
        });
        
        const label = document.createElement('div');
        Object.assign(label.style, {
            fontSize: '11px',
            fontWeight: '700',
            color: '#999999',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            textAlign: 'left',
            paddingLeft: '4px'
        });
        label.textContent = 'BGE Electrique';
        
        const loaderBubble = document.createElement('div');
        Object.assign(loaderBubble.style, {
            background: '#ffffff',
            color: '#000000',
            padding: '15px 20px',
            borderRadius: '24px 24px 24px 4px',
            border: '2px solid #e5e5e5',
            maxWidth: '90%',
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50px'
        });
        
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.textContent = 'Loading...';
        
        loaderBubble.appendChild(loader);
        loaderDiv.appendChild(label);
        loaderDiv.appendChild(loaderBubble);
        
        this.elements.messages.appendChild(loaderDiv);
        this.scrollToBottom();
        
        return loaderId;
    }

    removeLoadingIndicator(loaderId) {
        const loaderElement = this.elements.messages.querySelector(`[data-loader-id="${loaderId}"]`);
        if (loaderElement) {
            loaderElement.remove();
        }
    }

    loadChat() {
        const storageKey = 'bge_chat_' + this.currentChatId;
        const savedChat = localStorage.getItem(storageKey);
        
        if (savedChat) {
            try {
                const chatData = JSON.parse(savedChat);
                this.messages = chatData.messages || [];
                this.messageIdCounter = chatData.messageIdCounter || 0;
                
                // Render messages
                if (this.messages.length > 0) {
                    this.elements.welcomeMessage.style.display = 'none';
                    this.elements.messages.style.display = 'flex';
                    this.messages.forEach(message => {
                        this.renderMessage(message);
                    });
                }
            } catch (error) {
                console.error('Error loading chat:', error);
                this.messages = [];
            }
        } else {
            this.messages = [];
        }
    }

    saveChat() {
        const storageKey = 'bge_chat_' + this.currentChatId;
        const chatData = {
            messages: this.messages,
            messageIdCounter: this.messageIdCounter,
            updatedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem(storageKey, JSON.stringify(chatData));
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    }

    scrollToBottom() {
        this.elements.messagesArea.scrollTop = this.elements.messagesArea.scrollHeight;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
