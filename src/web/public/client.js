document.addEventListener("DOMContentLoaded", () => {
    const setupScreen = document.getElementById("setup-screen");
    const chatScreen = document.getElementById("chat-screen");
    const nicknameForm = document.getElementById("nickname-form");
    const nicknameInput = document.getElementById("nickname-input");
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");
    const messagesContainer = document.getElementById("messages-container");

    let ws = null;
    let myNickname = "";
    let isRegistering = false;

    // Connect to Web Socket Bridge
    function connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}`);

        ws.onopen = () => {
            console.log("Connected to Bridge");
        };

        ws.onmessage = (event) => {
            const raw = event.data.toString();
            parseIncomingMessage(raw);
        };

        ws.onclose = () => {
            appendSystemMessage("Connection lost to server.");
        };
    }

    function parseIncomingMessage(data) {
        // Since TCP pushes things mixed (Welcome message, prompts > , chat messages)
        // We will sanitize the generic TCP prompts
        let cleaned = data.replace(/> /g, "").trim();
        if (!cleaned) return;

        // Check if it's the welcome message asking for nickname
        if (cleaned.includes("Please enter your nickname:")) {
            // We just send our nickname right away if we are registering
            if (isRegistering) {
                ws.send(myNickname);
                isRegistering = false;
                setupScreen.classList.add("hidden");
                chatScreen.classList.remove("hidden");
                messageInput.focus();
            }
            return;
        }

        if (cleaned.includes("Welcome to the TCP Chat Room!")) {
             return; // Skip raw welcome as we have our own UI
        }

        // It's a standard message
        if (cleaned.startsWith("***")) {
            appendSystemMessage(cleaned.replace(/\*/g, "").trim());
        } else if (cleaned.startsWith("[")) {
            // Format: [Nickname]: message content
            const splitMatch = cleaned.match(/\[(.*?)\]: (.*)/);
            if (splitMatch) {
                const [, author, text] = splitMatch;
                appendChatMessage(author, text, author === myNickname);
            } else {
                appendChatMessage("Unknown", cleaned, false);
            }
        } else {
            // Direct system notes that don't match exactly
            appendSystemMessage(cleaned);
        }
    }

    function appendSystemMessage(text) {
        const div = document.createElement("div");
        div.className = "message-node system-message";
        div.textContent = text;
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    function appendChatMessage(author, text, isOwn) {
        const wrapper = document.createElement("div");
        wrapper.className = `message-node normal-message ${isOwn ? 'own-message' : ''}`;
        
        const authorEl = document.createElement("div");
        authorEl.className = "message-author";
        authorEl.textContent = isOwn ? "You" : author;
        
        const textEl = document.createElement("div");
        textEl.className = "message-content";
        textEl.textContent = text;

        wrapper.appendChild(authorEl);
        wrapper.appendChild(textEl);
        messagesContainer.appendChild(wrapper);
        scrollToBottom();
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    nicknameForm.addEventListener("submit", (e) => {
        e.preventDefault();
        myNickname = nicknameInput.value.trim();
        if (!myNickname) return;
        
        isRegistering = true;
        connect();
    });

    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text || !ws) return;

        // Send to bridge
        ws.send(text);
        appendChatMessage(myNickname, text, true);
        messageInput.value = "";
    });
});
