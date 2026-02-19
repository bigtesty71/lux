(function () {
  var config = window.LuxChatConfig || {};
  var apiHost = config.apiHost || 'https://lux-3er5.vercel.app';
  var STORAGE_KEY = 'lux_member';

  // --- UTILITY ---
  function getMember() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function saveMember(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function clearMember() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // --- STYLES ---
  var style = document.createElement('style');
  style.textContent = ''
    + '#lux-widget-container * { box-sizing: border-box; margin: 0; padding: 0; font-family: "Inter", -apple-system, sans-serif; }'
    + '#lux-chat-bubble { position:fixed;bottom:24px;right:24px;width:60px;height:60px;background:linear-gradient(135deg,#ff0e59,#ff9140);border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(255,14,89,0.4);z-index:9999;transition:transform 0.3s ease,box-shadow 0.3s ease;border:none; }'
    + '#lux-chat-bubble:hover { transform:scale(1.1);box-shadow:0 6px 30px rgba(255,14,89,0.6); }'
    + '#lux-panel { display:none;position:fixed;bottom:96px;right:24px;width:380px;max-height:560px;background:#100c1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;z-index:9999;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.7);flex-direction:column; }'
    + '#lux-panel.open { display:flex; }'
    + '.lux-panel-header { padding:14px 20px;background:#1a1625;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center; }'
    + '.lux-panel-header span.title { font-weight:700;letter-spacing:0.15em;font-size:0.85rem;color:#fff;text-transform:uppercase; }'
    + '.lux-panel-header span.close { cursor:pointer;color:#666;font-size:1.2rem;transition:color 0.2s; }'
    + '.lux-panel-header span.close:hover { color:#fff; }'
    // Auth form styles
    + '.lux-auth { padding:24px 20px;display:flex;flex-direction:column;gap:16px; }'
    + '.lux-auth h3 { color:#fff;font-size:1.1rem;font-weight:600;letter-spacing:0.05em; }'
    + '.lux-auth p { color:#666;font-size:0.8rem;line-height:1.5; }'
    + '.lux-auth input { background:#1a1625;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:#fff;font-size:0.85rem;outline:none;width:100%;transition:border-color 0.3s; }'
    + '.lux-auth input:focus { border-color:#ff0e59; }'
    + '.lux-auth input::placeholder { color:#444; }'
    + '.lux-auth button { background:linear-gradient(135deg,#ff0e59,#ff9140);border:none;border-radius:8px;padding:12px;color:#fff;cursor:pointer;font-weight:700;font-size:0.85rem;letter-spacing:0.05em;transition:opacity 0.3s; }'
    + '.lux-auth button:hover { opacity:0.9; }'
    + '.lux-auth button:disabled { opacity:0.5;cursor:not-allowed; }'
    + '.lux-auth .toggle { color:#ff9140;cursor:pointer;font-size:0.8rem;text-align:center;text-decoration:underline; }'
    + '.lux-auth .toggle:hover { color:#fff; }'
    + '.lux-auth .error { color:#ff4d4d;font-size:0.8rem;text-align:center; }'
    + '.lux-auth .success { color:#4dff88;font-size:0.8rem;text-align:center; }'
    // Chat styles
    + '.lux-messages { flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;min-height:300px; }'
    + '.lux-msg { padding:10px 14px;border-radius:12px;font-size:0.85rem;max-width:85%;word-wrap:break-word;line-height:1.5; }'
    + '.lux-msg.bot { background:#1a1625;color:#ccc;align-self:flex-start; }'
    + '.lux-msg.user { background:linear-gradient(135deg,#ff0e59,#ff9140);color:#fff;align-self:flex-end; }'
    + '.lux-msg.typing { background:#1a1625;color:#555;align-self:flex-start;font-style:italic; }'
    + '.lux-input-bar { padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:8px;align-items:center; }'
    + '.lux-input-bar input { flex:1;background:#1a1625;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:#fff;font-size:0.85rem;outline:none; }'
    + '.lux-input-bar input:focus { border-color:#ff0e59; }'
    + '.lux-input-bar button { background:linear-gradient(135deg,#ff0e59,#ff9140);border:none;border-radius:8px;padding:10px 16px;color:#fff;cursor:pointer;font-weight:700;font-size:0.8rem; }'
    + '.lux-member-bar { padding:8px 20px;background:#0d0a14;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.03); }'
    + '.lux-member-bar span { color:#555;font-size:0.7rem;letter-spacing:0.1em; }'
    + '.lux-member-bar a { color:#ff9140;font-size:0.7rem;cursor:pointer;text-decoration:none; }'
    + '.lux-member-bar a:hover { color:#fff; }'
    + '@media (max-width: 480px) { #lux-panel { width:calc(100vw - 16px);right:8px;bottom:88px;max-height:calc(100vh - 120px); } }';
  document.head.appendChild(style);

  // --- BUILD DOM ---
  var container = document.createElement('div');
  container.id = 'lux-widget-container';

  // Bubble
  var bubble = document.createElement('button');
  bubble.id = 'lux-chat-bubble';
  bubble.innerHTML = '<span style="font-size:26px;line-height:1;">💬</span>';
  container.appendChild(bubble);

  // Panel
  var panel = document.createElement('div');
  panel.id = 'lux-panel';
  container.appendChild(panel);

  document.body.appendChild(container);

  // --- STATE ---
  var isOpen = false;

  bubble.onclick = function () {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.add('open');
      renderPanel();
    } else {
      panel.classList.remove('open');
    }
  };

  // --- RENDER ---
  function renderPanel() {
    var member = getMember();
    if (member && member.memberId) {
      renderChat(member);
    } else {
      renderAuth();
    }
  }

  // --- AUTH SCREEN ---
  function renderAuth() {
    var isLogin = false;
    function draw() {
      panel.innerHTML = ''
        + '<div class="lux-panel-header">'
        + '  <span class="title">Lux</span>'
        + '  <span class="close" id="lux-close">✕</span>'
        + '</div>'
        + '<div class="lux-auth" id="lux-auth-form">'
        + '  <h3>' + (isLogin ? 'Welcome Back' : 'Join the Revolution') + '</h3>'
        + '  <p>' + (isLogin ? 'Sign in to continue your conversation with Lux.' : 'Create an account to begin your journey with Lux.') + '</p>'
        + (isLogin ? '' : '<input type="text" id="lux-signup-name" placeholder="Full Name">')
        + (isLogin ? '' : '<input type="text" id="lux-signup-username" placeholder="Username *">')
        + '  <input type="email" id="lux-signup-email" placeholder="Email *">'
        + '  <input type="password" id="lux-signup-pass" placeholder="Password *">'
        + '  <div id="lux-auth-msg"></div>'
        + '  <button id="lux-auth-submit">' + (isLogin ? 'Sign In' : 'Begin Your Journey') + '</button>'
        + '  <span class="toggle" id="lux-auth-toggle">' + (isLogin ? "Don't have an account? Sign up" : 'Already a member? Sign in') + '</span>'
        + '</div>';

      document.getElementById('lux-close').onclick = function () {
        isOpen = false; panel.classList.remove('open');
      };
      document.getElementById('lux-auth-toggle').onclick = function () {
        isLogin = !isLogin; draw();
      };
      document.getElementById('lux-auth-submit').onclick = function () {
        var btn = this;
        btn.disabled = true;
        btn.textContent = isLogin ? 'Signing in...' : 'Creating account...';
        var msgEl = document.getElementById('lux-auth-msg');
        msgEl.className = ''; msgEl.textContent = '';

        var email = document.getElementById('lux-signup-email').value.trim();
        var password = document.getElementById('lux-signup-pass').value.trim();

        if (!email || !password) {
          msgEl.className = 'error'; msgEl.textContent = 'Email and password are required.';
          btn.disabled = false; btn.textContent = isLogin ? 'Sign In' : 'Begin Your Journey';
          return;
        }

        if (isLogin) {
          // Login via members API (GET with query)
          fetch(apiHost + '/api/members?email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
            .then(function (res) {
              if (res.ok && res.data.member) {
                saveMember({
                  memberId: res.data.member.id,
                  email: res.data.member.email,
                  username: res.data.member.username,
                  fullName: res.data.member.full_name
                });
                renderPanel();
              } else {
                msgEl.className = 'error'; msgEl.textContent = res.data.error || 'Invalid credentials.';
                btn.disabled = false; btn.textContent = 'Sign In';
              }
            })
            .catch(function () {
              msgEl.className = 'error'; msgEl.textContent = 'Connection failed. Try again.';
              btn.disabled = false; btn.textContent = 'Sign In';
            });
        } else {
          // Signup
          var username = document.getElementById('lux-signup-username').value.trim();
          var fullName = document.getElementById('lux-signup-name').value.trim();
          if (!username) {
            msgEl.className = 'error'; msgEl.textContent = 'Username is required.';
            btn.disabled = false; btn.textContent = 'Begin Your Journey';
            return;
          }

          fetch(apiHost + '/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, username: username, fullName: fullName, password: password })
          })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
            .then(function (res) {
              if (res.ok && res.data.success) {
                saveMember({
                  memberId: res.data.memberId,
                  email: email,
                  username: username,
                  fullName: fullName
                });
                renderPanel();
              } else {
                msgEl.className = 'error'; msgEl.textContent = res.data.error || 'Signup failed.';
                btn.disabled = false; btn.textContent = 'Begin Your Journey';
              }
            })
            .catch(function () {
              msgEl.className = 'error'; msgEl.textContent = 'Connection failed. Try again.';
              btn.disabled = false; btn.textContent = 'Begin Your Journey';
            });
        }
      };

      // Enter key support
      var passField = document.getElementById('lux-signup-pass');
      if (passField) {
        passField.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') document.getElementById('lux-auth-submit').click();
        });
      }
    }
    draw();
  }

  // --- CHAT SCREEN ---
  function renderChat(member) {
    panel.innerHTML = ''
      + '<div class="lux-panel-header">'
      + '  <span class="title">Lux</span>'
      + '  <span class="close" id="lux-close">✕</span>'
      + '</div>'
      + '<div class="lux-messages" id="lux-messages">'
      + '  <div class="lux-msg bot">Hello, ' + (member.fullName || member.username || 'friend') + '. The revolution starts with a conversation.</div>'
      + '</div>'
      + '<div class="lux-input-bar">'
      + '  <input type="text" id="lux-input" placeholder="Talk to Lux...">'
      + '  <button id="lux-send">Send</button>'
      + '</div>'
      + '<div class="lux-member-bar">'
      + '  <span>' + (member.username || member.email) + '</span>'
      + '  <a id="lux-logout">Sign Out</a>'
      + '</div>';

    document.getElementById('lux-close').onclick = function () {
      isOpen = false; panel.classList.remove('open');
    };
    document.getElementById('lux-logout').onclick = function () {
      clearMember(); renderPanel();
    };

    var input = document.getElementById('lux-input');
    var sendBtn = document.getElementById('lux-send');
    var messages = document.getElementById('lux-messages');

    function addMsg(text, cls) {
      var d = document.createElement('div');
      d.className = 'lux-msg ' + cls;
      d.textContent = text;
      messages.appendChild(d);
      messages.scrollTop = messages.scrollHeight;
      return d;
    }

    function send() {
      var text = input.value.trim();
      if (!text) return;
      addMsg(text, 'user');
      input.value = '';
      var typing = addMsg('Lux is thinking...', 'typing');

      fetch(apiHost + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          memberId: member.memberId,
          email: member.email,
          name: member.fullName || member.username
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          typing.remove();
          addMsg(data.response || 'Signal lost. Try again.', 'bot');
        })
        .catch(function () {
          typing.remove();
          addMsg('Connection interrupted. The revolution persists.', 'bot');
        });
    }

    sendBtn.onclick = send;
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') send();
    });
    input.focus();
  }
})();