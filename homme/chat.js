// chat.js — виджет чата поддержки
(function() {
    // Генерируем или получаем session_id
    var sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
        sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chat_session_id', sessionId);
    }

    var lastId = 0;
    var isOpen = false;
    var pollInterval = null;

    // Создаём виджет
    var widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
        <button id="chat-btn" title="Чат поддержки">💬</button>
        <div id="chat-window" style="display:none;">
            <div id="chat-header">
                <span>Поддержка</span>
                <button id="chat-close">✕</button>
            </div>
            <div id="chat-messages"></div>
            <div id="chat-input-area">
                <input type="text" id="chat-input" placeholder="Напишите сообщение...">
                <button id="chat-send">➤</button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // Стили
    var style = document.createElement('style');
    style.textContent = `
        #chat-widget { position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: Arial, sans-serif; }
        #chat-btn {
            width: 56px; height: 56px; border-radius: 50%; background: #e53935; color: #fff;
            border: none; font-size: 24px; cursor: pointer; box-shadow: 0 4px 16px rgba(229,57,53,.4);
            transition: transform .2s, box-shadow .2s;
        }
        #chat-btn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(229,57,53,.6); }
        #chat-window {
            position: absolute; bottom: 70px; right: 0; width: 320px; max-height: 450px;
            background: #1a1a1a; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.5);
            display: flex; flex-direction: column; overflow: hidden; border: 1px solid #333;
        }
        #chat-header {
            background: #e53935; color: #fff; padding: 12px 16px;
            display: flex; justify-content: space-between; align-items: center;
            font-weight: 600; font-size: 14px;
        }
        #chat-close { background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; }
        #chat-messages {
            flex: 1; overflow-y: auto; padding: 12px; max-height: 300px;
            display: flex; flex-direction: column; gap: 8px;
        }
        .chat-msg {
            padding: 8px 12px; border-radius: 8px; font-size: 13px; max-width: 85%;
            line-height: 1.4; word-wrap: break-word;
        }
        .chat-msg.user { background: #e53935; color: #fff; align-self: flex-end; border-bottom-right-radius: 2px; }
        .chat-msg.admin { background: #2a2a2a; color: #f0f0f0; align-self: flex-start; border-bottom-left-radius: 2px; }
        .chat-msg .time { font-size: 10px; opacity: .6; margin-top: 2px; }
        #chat-input-area {
            display: flex; gap: 8px; padding: 10px; border-top: 1px solid #333; background: #111;
        }
        #chat-input {
            flex: 1; padding: 8px 12px; border: 1px solid #333; border-radius: 6px;
            background: #2a2a2a; color: #fff; font-size: 13px; outline: none;
        }
        #chat-input:focus { border-color: #e53935; }
        #chat-send {
            padding: 8px 14px; background: #e53935; color: #fff; border: none;
            border-radius: 6px; cursor: pointer; font-size: 14px; transition: background .2s;
        }
        #chat-send:hover { background: #c62828; }
        #chat-empty { color: #666; font-size: 13px; text-align: center; padding: 20px; }
        @media (max-width: 480px) {
            #chat-window { width: 280px; right: -10px; }
        }
    `;
    document.head.appendChild(style);

    var chatBtn = document.getElementById('chat-btn');
    var chatWindow = document.getElementById('chat-window');
    var chatMessages = document.getElementById('chat-messages');
    var chatInput = document.getElementById('chat-input');
    var chatSend = document.getElementById('chat-send');
    var chatClose = document.getElementById('chat-close');

    function toggleChat() {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        if (isOpen) {
            chatInput.focus();
            loadMessages();
            startPolling();
        } else {
            stopPolling();
        }
    }

    function addMessage(msg) {
        var div = document.createElement('div');
        div.className = 'chat-msg ' + msg.sender;
        var time = new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = msg.message + '<div class="time">' + time + '</div>';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function loadMessages() {
        fetch('api/chat_get.php?session_id=' + encodeURIComponent(sessionId) + '&last_id=' + lastId)
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (data.success && data.messages.length > 0) {
                    // Remove empty state
                    var empty = chatMessages.querySelector('#chat-empty');
                    if (empty) empty.remove();
                    data.messages.forEach(function(msg) {
                        addMessage(msg);
                        if (msg.id > lastId) lastId = msg.id;
                    });
                } else if (chatMessages.children.length === 0) {
                    chatMessages.innerHTML = '<div id="chat-empty">Напишите сообщение — мы ответим!</div>';
                }
            })
            .catch(function() {});
    }

    function sendMessage() {
        var text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';
        var empty = chatMessages.querySelector('#chat-empty');
        if (empty) empty.remove();

        // Optimistic UI
        addMessage({ sender: 'user', message: text, created_at: new Date().toISOString() });
        lastId++; // temporary

        fetch('api/chat_send.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({ session_id: sessionId, message: text, sender: 'user' })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success && data.id) {
                lastId = Math.max(lastId, data.id);
            }
        })
        .catch(function() {});
    }

    function startPolling() {
        stopPolling();
        pollInterval = setInterval(loadMessages, 3000);
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    chatBtn.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Show welcome message
    setTimeout(function() {
        if (chatMessages.children.length === 0) {
            chatMessages.innerHTML = '<div id="chat-empty">Напишите сообщение — мы ответим!</div>';
        }
    }, 500);
})();
