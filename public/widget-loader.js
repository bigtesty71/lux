(function () {
  var config = window.LuxChatConfig || {
    siteId: 'default',
    position: 'bottom-right',
    theme: 'dark',
    apiHost: 'https://lux-3er5.vercel.app'
  };

  var apiHost = config.apiHost || 'https://lux-3er5.vercel.app';

  // Load Chat Widget CSS
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = apiHost + '/chat-widget.css';
  document.head.appendChild(link);

  // Create the chat widget container
  var container = document.createElement('div');
  container.id = 'lux-chat-widget';
  container.innerHTML = ''
    + '<div id="lux-chat-bubble" style="'
    + 'position:fixed;bottom:24px;right:24px;width:60px;height:60px;'
    + 'background:linear-gradient(135deg,#ff0e59,#ff9140);border-radius:50%;'
    + 'cursor:pointer;display:flex;align-items:center;justify-content:center;'
    + 'box-shadow:0 4px 20px rgba(255,14,89,0.4);z-index:9999;'
    + 'transition:transform 0.3s ease;'
    + '">'
    + '<span style="font-size:28px;">💬</span>'
    + '</div>'
    + '<div id="lux-chat-panel" style="'
    + 'display:none;position:fixed;bottom:96px;right:24px;width:380px;height:520px;'
    + 'background:#100c1a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;'
    + 'z-index:9999;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.6);'
    + 'flex-direction:column;'
    + '">'
    + '<div style="padding:16px 20px;background:#1a1625;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;">'
    + '<span style="font-weight:700;letter-spacing:0.1em;font-size:0.9rem;color:#fff;">LUX</span>'
    + '<span id="lux-chat-close" style="cursor:pointer;color:#666;font-size:1.2rem;">✕</span>'
    + '</div>'
    + '<div id="lux-chat-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">'
    + '<div style="background:#1a1625;padding:12px 16px;border-radius:12px;color:#ccc;font-size:0.85rem;max-width:85%;">Hello. I am Lux. The revolution starts with a conversation.</div>'
    + '</div>'
    + '<div style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:8px;">'
    + '<input id="lux-chat-input" type="text" placeholder="Talk to Lux..." style="'
    + 'flex:1;background:#1a1625;border:1px solid rgba(255,255,255,0.1);border-radius:8px;'
    + 'padding:10px 14px;color:#fff;font-size:0.85rem;outline:none;'
    + '">'
    + '<button id="lux-chat-send" style="'
    + 'background:linear-gradient(135deg,#ff0e59,#ff9140);border:none;border-radius:8px;'
    + 'padding:10px 16px;color:#fff;cursor:pointer;font-weight:700;font-size:0.8rem;'
    + '">Send</button>'
    + '</div>'
    + '</div>';
  document.body.appendChild(container);

  // Toggle panel
  var bubble = document.getElementById('lux-chat-bubble');
  var panel = document.getElementById('lux-chat-panel');
  var closeBtn = document.getElementById('lux-chat-close');
  var input = document.getElementById('lux-chat-input');
  var sendBtn = document.getElementById('lux-chat-send');
  var messages = document.getElementById('lux-chat-messages');

  bubble.onclick = function () {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  };
  closeBtn.onclick = function () {
    panel.style.display = 'none';
  };

  function addMessage(text, isUser) {
    var msg = document.createElement('div');
    msg.style.cssText = 'padding:12px 16px;border-radius:12px;font-size:0.85rem;max-width:85%;word-wrap:break-word;'
      + (isUser
        ? 'background:linear-gradient(135deg,#ff0e59,#ff9140);color:#fff;align-self:flex-end;'
        : 'background:#1a1625;color:#ccc;align-self:flex-start;');
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage() {
    var text = input.value.trim();
    if (!text) return;
    addMessage(text, true);
    input.value = '';

    // Show typing indicator
    var typing = document.createElement('div');
    typing.style.cssText = 'padding:12px 16px;border-radius:12px;background:#1a1625;color:#666;font-size:0.85rem;max-width:85%;';
    typing.textContent = 'Lux is thinking...';
    typing.id = 'lux-typing';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    fetch(apiHost + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, memberId: 1 })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var t = document.getElementById('lux-typing');
        if (t) t.remove();
        addMessage(data.response || 'Signal lost. Try again.', false);
      })
      .catch(function (err) {
        var t = document.getElementById('lux-typing');
        if (t) t.remove();
        addMessage('Connection interrupted. The revolution persists.', false);
      });
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
  });
})();