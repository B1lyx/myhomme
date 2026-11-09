// ---- Корзина (через БД) ----
async function showCount() {
    try {
        var res = await fetch('api/cart_get.php');
        var data = await res.json();
        if (data.success) {
            var count = data.count || 0;
            var span = document.getElementById('cart-count');
            if (span) span.textContent = count;
            var info = document.getElementById('cart-info');
            if (info) info.textContent = 'В корзине: ' + count + ' товаров';
            var cartLink = document.querySelector('.cart-link');
            if (cartLink) cartLink.textContent = 'Корзина (' + count + ')';
        }
    } catch (e) {
        // Не авторизован — показываем 0
        var span = document.getElementById('cart-count');
        if (span) span.textContent = '0';
    }
}

var productsCache = [];

async function loadProductsCache() {
    try {
        var res = await fetch('api/products.php');
        var data = await res.json();
        if (data.success) productsCache = data.products || [];
    } catch (e) {}
}

async function addToCart(productId, name, price) {
    // Если productId не передан — ищем по имени в кэше
    if (!productId || productId === 0) {
        var found = productsCache.find(function(p) { return p.name === name; });
        if (found) productId = found.id;
    }
    if (!productId || productId === 0) {
        alert('Товар не найден в базе');
        return;
    }
    try {
        var res = await fetch('api/cart_add.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        var data = await res.json();
        if (data.success) {
            showCount();
            alert('Товар добавлен в корзину');
        } else if (data.need_login) {
            alert('Войдите в аккаунт, чтобы добавить товар в корзину');
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Ошибка');
        }
    } catch (e) {
        alert('Ошибка соединения');
    }
}

async function renderCart() {
    var container = document.getElementById('cart-items');
    if (!container) return;
    try {
        var res = await fetch('api/cart_get.php');
        var data = await res.json();
        if (!data.success) {
            container.innerHTML = '<p>Войдите в аккаунт, чтобы увидеть корзину</p>';
            return;
        }
        if (data.items.length === 0) {
            container.innerHTML = '<p>Корзина пуста</p>';
            var total = document.getElementById('cart-total');
            if (total) total.textContent = '0 ₽';
            return;
        }
        var html = '';
        for (var i = 0; i < data.items.length; i++) {
            var item = data.items[i];
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #2a2a2a;">' +
                '<span>' + item.name + ' × ' + item.quantity + '</span>' +
                '<span>' + (item.price * item.quantity).toLocaleString('ru-RU') + ' ₽ ' +
                '<button onclick="removeFromCart(' + item.id + ')" style="background:#e53935;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;margin-left:8px;">✕</button></span></div>';
        }
        container.innerHTML = html;
        var total = document.getElementById('cart-total');
        if (total) total.textContent = data.total.toLocaleString('ru-RU') + ' ₽';
    } catch (e) {
        container.innerHTML = '<p>Ошибка загрузки корзины</p>';
    }
}

async function removeFromCart(cartId) {
    try {
        var res = await fetch('api/cart_remove.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart_id: cartId })
        });
        var data = await res.json();
        if (data.success) {
            renderCart();
            showCount();
        }
    } catch (e) {
        alert('Ошибка');
    }
}

async function clearCart() {
    try {
        await fetch('api/cart_clear.php', { method: 'POST' });
        renderCart();
        showCount();
    } catch (e) {
        alert('Ошибка');
    }
}

async function checkout() {
    try {
        var res = await fetch('api/order_create.php', { method: 'POST' });
        var data = await res.json();
        if (data.success) {
            alert('Заказ #' + data.order_id + ' оформлен на сумму ' + data.total.toLocaleString('ru-RU') + ' ₽');
            showCount();
            renderCart();
        } else if (data.need_login) {
            alert('Войдите в аккаунт для оформления заказа');
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Ошибка');
        }
    } catch (e) {
        alert('Ошибка соединения');
    }
}

// ---- Авторизация ----
async function registerUser(name, email, password) {
    try {
        var res = await fetch("api/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ name: name, email: email, password: password })
        });
        var data = await res.json();
        if (data.success) {
            alert("Регистрация успешна! Добро пожаловать, " + data.user.name + "!");
            window.location.href = "account.html";
        } else {
            alert(data.error || "Ошибка регистрации");
        }
    } catch (e) {
        alert("Ошибка соединения с сервером");
    }
}

async function loginUser(email, password) {
    try {
        var res = await fetch("api/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ email: email, password: password })
        });
        var data = await res.json();
        if (data.success) {
            alert("Вход выполнен! Добро пожаловать, " + data.user.name + "!");
            window.location.href = "account.html";
        } else {
            alert(data.error || "Ошибка входа");
        }
    } catch (e) {
        alert("Ошибка соединения с сервером");
    }
}

async function logoutUser() {
    try {
        await fetch("api/logout.php", { method: "POST" });
        window.location.href = "index.html";
    } catch (e) {
        alert("Ошибка");
    }
}

async function loadAccount() {
    try {
        var res = await fetch("api/me.php");
        var data = await res.json();
        if (data.success) {
            document.getElementById("user-name").textContent = data.user.name;
            document.getElementById("user-email").textContent = data.user.email;
            // Загрузить заказы
            loadOrders();
        } else {
            window.location.href = "login.html";
        }
    } catch (e) {
        window.location.href = "login.html";
    }
}

async function loadOrders() {
    try {
        var res = await fetch("api/orders_get.php");
        var data = await res.json();
        var container = document.getElementById("orders-list");
        if (!container) return;
        if (!data.success || !data.orders || data.orders.length === 0) {
            container.innerHTML = "<p>У вас пока нет заказов</p>";
            return;
        }
        var html = "";
        for (var i = 0; i < data.orders.length; i++) {
            var o = data.orders[i];
            html += '<div style="background:#1a1a1a; padding:12px; border-radius:6px; margin-bottom:8px; border:1px solid #2a2a2a;">' +
                '<b>Заказ #' + o.id + '</b> — ' + o.total.toLocaleString('ru-RU') + ' ₽ — ' +
                '<span style="color:#43a047;">' + o.status + '</span>' +
                '<br><small style="color:#888;">' + o.created_at + ' · ' + o.items_count + ' товаров</small>' +
                '</div>';
        }
        container.innerHTML = html;
    } catch (e) {
        console.error(e);
    }
}

// ---- Чат поддержки ----
(function() {
    var sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
        sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('chat_session_id', sessionId);
    }
    var lastId = 0;
    var isOpen = false;
    var pollInterval = null;

    var widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = '<button id="chat-btn" title="Чат поддержки">💬</button>' +
        '<div id="chat-window" style="display:none;">' +
        '<div id="chat-header"><span>Поддержка</span><button id="chat-close">✕</button></div>' +
        '<div id="chat-messages"></div>' +
        '<div id="chat-input-area"><input type="text" id="chat-input" placeholder="Напишите сообщение..."><button id="chat-send">➤</button></div>' +
        '</div>';
    document.body.appendChild(widget);

    var style = document.createElement('style');
    style.textContent = '#chat-widget{position:fixed;bottom:20px;right:20px;z-index:9999;font-family:Arial,sans-serif;}' +
        '#chat-btn{width:56px;height:56px;border-radius:50%;background:#e53935;color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 16px rgba(229,57,53,.4);transition:transform .2s,box-shadow .2s;}' +
        '#chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(229,57,53,.6);}' +
        '#chat-window{position:absolute;bottom:70px;right:0;width:320px;max-height:450px;background:#1a1a1a;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;border:1px solid #333;}' +
        '#chat-header{background:#e53935;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:14px;}' +
        '#chat-close{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;}' +
        '#chat-messages{flex:1;overflow-y:auto;padding:12px;max-height:300px;display:flex;flex-direction:column;gap:8px;}' +
        '.chat-msg{padding:8px 12px;border-radius:8px;font-size:13px;max-width:85%;line-height:1.4;word-wrap:break-word;}' +
        '.chat-msg.user{background:#e53935;color:#fff;align-self:flex-end;border-bottom-right-radius:2px;}' +
        '.chat-msg.admin{background:#2a2a2a;color:#f0f0f0;align-self:flex-start;border-bottom-left-radius:2px;}' +
        '.chat-msg .time{font-size:10px;opacity:.6;margin-top:2px;}' +
        '#chat-input-area{display:flex;gap:8px;padding:10px;border-top:1px solid #333;background:#111;}' +
        '#chat-input{flex:1;padding:8px 12px;border:1px solid #333;border-radius:6px;background:#2a2a2a;color:#fff;font-size:13px;outline:none;}' +
        '#chat-input:focus{border-color:#e53935;}' +
        '#chat-send{padding:8px 14px;background:#e53935;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;transition:background .2s;}' +
        '#chat-send:hover{background:#c62828;}' +
        '#chat-empty{color:#666;font-size:13px;text-align:center;padding:20px;}' +
        '@media(max-width:480px){#chat-window{width:280px;right:-10px;}}';
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
        if (isOpen) { chatInput.focus(); loadMessages(); startPolling(); }
        else { stopPolling(); }
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
        addMessage({ sender: 'user', message: text, created_at: new Date().toISOString() });
        lastId++;
        fetch('api/chat_send.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, message: text, sender: 'user' })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.success && data.id) { lastId = Math.max(lastId, data.id); }
        })
        .catch(function() {});
    }

    function startPolling() {
        stopPolling();
        pollInterval = setInterval(loadMessages, 3000);
    }

    function stopPolling() {
        if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
    }

    chatBtn.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });

    setTimeout(function() {
        if (chatMessages.children.length === 0) {
            chatMessages.innerHTML = '<div id="chat-empty">Напишите сообщение — мы ответим!</div>';
        }
    }, 500);
})();

// ---- Запуск при загрузке ----
function initPage() {
    loadProductsCache().then(function() {
        showCount();
        renderCart();

        var buttons = document.querySelectorAll(".product button");
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].onclick = function () {
                var card = this.closest(".product");
                var name = card.querySelector(".product-name").textContent;
                var priceText = card.querySelector(".product-price").textContent.split('₽')[0].replace(/[^\d]/g, "");
                addToCart(0, name, parseInt(priceText));
            };
        }
    });
}

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    setTimeout(initPage, 0);
}

async function loadProducts() {
    try {
        var res = await fetch('api/products.php');
        var data = await res.json();
        if (!data.success || !data.products || data.products.length === 0) return;
        // Товары уже в HTML, можно обновить цены/фото из БД если нужно
    } catch (e) {
        console.error(e);
    }
}