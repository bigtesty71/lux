(function () {
  var config = window.LuxChatConfig || {};
  var apiHost = config.apiHost || 'https://lux-3er5.vercel.app';
  var STORAGE_KEY = 'lux_member';

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
    + '#lux-widget * { box-sizing:border-box;margin:0;padding:0;font-family:"Inter",-apple-system,sans-serif; }'
    // Bubble
    + '#lux-bubble { position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:9999;border:none;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.4);transition:transform 0.3s; }'
    + '#lux-bubble:hover { transform:scale(1.1); }'
    + '#lux-bubble img { width:100%;height:100%;object-fit:cover; }'
    // Panel
    + '#lux-panel { display:none;position:fixed;bottom:96px;right:24px;width:360px;height:520px;background:#1a1128;border-radius:16px;z-index:9999;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.7);flex-direction:column;border:1px solid rgba(255,255,255,0.06); }'
    + '#lux-panel.open { display:flex; }'
    // Header
    + '.lux-header { position:relative;padding:16px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,0.06);background:#150e22; }'
    + '.lux-header-avatar { width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,14,89,0.4); }'
    + '.lux-header-info { flex:1; }'
    + '.lux-header-title { font-weight:700;font-size:0.9rem;color:#fff;letter-spacing:0.02em; }'
    + '.lux-header-sub { font-size:0.7rem;color:#666;margin-top:2px; }'
    + '.lux-header-close { cursor:pointer;color:#555;font-size:1.1rem;transition:color 0.2s;background:none;border:none; }'
    + '.lux-header-close:hover { color:#fff; }'
    // Auth
    + '.lux-auth { padding:24px 20px;display:flex;flex-direction:column;gap:14px;flex:1;overflow-y:auto; }'
    + '.lux-auth h3 { color:#fff;font-size:1rem;font-weight:600; }'
    + '.lux-auth p { color:#555;font-size:0.8rem;line-height:1.5; }'
    + '.lux-auth input { background:#120d1e;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:11px 14px;color:#fff;font-size:0.85rem;outline:none;width:100%;transition:border-color 0.3s; }'
    + '.lux-auth input:focus { border-color:rgba(255,14,89,0.5); }'
    + '.lux-auth input::placeholder { color:#3a3a3a; }'
    + '.lux-auth-btn { background:linear-gradient(135deg,#ff0e59,#ff9140);border:none;border-radius:10px;padding:12px;color:#fff;cursor:pointer;font-weight:700;font-size:0.85rem;transition:opacity 0.3s; }'
    + '.lux-auth-btn:hover { opacity:0.9; }'
    + '.lux-auth-btn:disabled { opacity:0.4;cursor:not-allowed; }'
    + '.lux-auth .toggle { color:#ff9140;cursor:pointer;font-size:0.78rem;text-align:center; }'
    + '.lux-auth .toggle:hover { color:#fff; }'
    + '.lux-auth .msg-error { color:#ff4d4d;font-size:0.78rem;text-align:center; }'
    // Messages
    + '.lux-messages { flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px; }'
    + '.lux-messages::-webkit-scrollbar { width:4px; }'
    + '.lux-messages::-webkit-scrollbar-track { background:transparent; }'
    + '.lux-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1);border-radius:4px; }'
    + '.lux-msg { padding:10px 14px;border-radius:14px;font-size:0.84rem;max-width:85%;word-wrap:break-word;line-height:1.55; }'
    + '.lux-msg.bot { background:#221a33;color:#ccc;align-self:flex-start;border-bottom-left-radius:4px; }'
    + '.lux-msg.user { background:linear-gradient(135deg,#6e1d47,#8b2252);color:#fff;align-self:flex-end;border-bottom-right-radius:4px; }'
    + '.lux-msg.typing { background:transparent;color:#555;align-self:flex-start;font-style:italic;padding-left:0; }'
    + '.lux-msg-time { font-size:0.6rem;color:#444;margin-top:4px; }'
    // Input bar
    + '.lux-input-bar { padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:10px;background:#150e22; }'
    + '.lux-input-bar input { flex:1;background:#120d1e;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px 14px;color:#fff;font-size:0.84rem;outline:none; }'
    + '.lux-input-bar input:focus { border-color:rgba(255,14,89,0.4); }'
    + '.lux-input-bar input::placeholder { color:#3a3a3a; }'
    + '.lux-input-bar button { background:none;border:none;cursor:pointer;font-size:1.2rem;color:#ff0e59;transition:transform 0.2s; }'
    + '.lux-input-bar button:hover { transform:scale(1.2); }'
    // Member bar
    + '.lux-member-bar { padding:6px 16px;background:#0f0a1a;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.03); }'
    + '.lux-member-bar span { color:#444;font-size:0.65rem;letter-spacing:0.05em; }'
    + '.lux-member-bar a { color:#ff9140;font-size:0.65rem;cursor:pointer;text-decoration:none; }'
    + '.lux-member-bar a:hover { color:#fff; }'
    // Responsive
    + '@media(max-width:480px){ #lux-panel{width:calc(100vw - 16px);right:8px;bottom:88px;height:calc(100vh - 120px);} }';
  document.head.appendChild(style);

  // Avatar URL - uses the Lux image from Vercel 
  var avatarUrl = apiHost + '/assets/images/close-up.png';

  // --- BUILD ---
  var widget = document.createElement('div');
  widget.id = 'lux-widget';

  var bubble = document.createElement('button');
  bubble.id = 'lux-bubble';
  bubble.innerHTML = '<img src="' + avatarUrl + '" alt="Lux">';
  widget.appendChild(bubble);

  var panel = document.createElement('div');
  panel.id = 'lux-panel';
  widget.appendChild(panel);

  document.body.appendChild(widget);

  var isOpen = false;
  bubble.onclick = function () {
    isOpen = !isOpen;
    if (isOpen) { panel.classList.add('open'); renderPanel(); }
    else { panel.classList.remove('open'); }
  };

  function renderPanel() {
    var member = getMember();
    if (member && member.memberId) { renderChat(member); }
    else { renderAuth(); }
  }

  // --- AUTH ---
  function renderAuth() {
    var isLogin = false;
    function draw() {
      panel.innerHTML = ''
        + '<div class="lux-header">'
        + '  <img class="lux-header-avatar" src="' + avatarUrl + '" alt="Lux">'
        + '  <div class="lux-header-info">'
        + '    <div class="lux-header-title">Lux - AI Revolution</div>'
        + '    <div class="lux-header-sub">' + (isLogin ? 'Sign in to continue' : 'Join the revolution') + '</div>'
        + '  </div>'
        + '  <button class="lux-header-close" id="lx-close">✕</button>'
        + '</div>'
        + '<div class="lux-auth">'
        + '  <h3>' + (isLogin ? 'Welcome Back' : 'Create Your Account') + '</h3>'
        + '  <p>' + (isLogin ? 'Sign in to continue talking with Lux.' : 'Become a member to begin your journey with Lux.') + '</p>'
        + (isLogin ? '' : '<input type="text" id="lx-name" placeholder="Full Name">')
        + (isLogin ? '' : '<input type="text" id="lx-user" placeholder="Username *">')
        + '  <input type="email" id="lx-email" placeholder="Email *">'
        + '  <input type="password" id="lx-pass" placeholder="Password *">'
        + '  <div id="lx-msg" class="msg-error"></div>'
        + '  <button class="lux-auth-btn" id="lx-submit">' + (isLogin ? 'Sign In' : 'Begin Your Journey') + '</button>'
        + '  <span class="toggle" id="lx-toggle">' + (isLogin ? "Don't have an account? Sign up" : 'Already a member? Sign in') + '</span>'
        + '</div>';

      document.getElementById('lx-close').onclick = function () { isOpen = false; panel.classList.remove('open'); };
      document.getElementById('lx-toggle').onclick = function () { isLogin = !isLogin; draw(); };
      document.getElementById('lx-submit').onclick = function () { submitAuth(isLogin, this); };

      var passEl = document.getElementById('lx-pass');
      if (passEl) passEl.addEventListener('keypress', function (e) { if (e.key === 'Enter') document.getElementById('lx-submit').click(); });
    }
    draw();
  }

  function submitAuth(isLogin, btn) {
    btn.disabled = true;
    var msgEl = document.getElementById('lx-msg');
    msgEl.textContent = '';

    var email = document.getElementById('lx-email').value.trim();
    var password = document.getElementById('lx-pass').value.trim();
    if (!email || !password) { msgEl.textContent = 'Email and password required.'; btn.disabled = false; return; }

    if (isLogin) {
      fetch(apiHost + '/api/members?email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password))
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (r) {
          if (r.ok && r.data.member) {
            saveMember({ memberId: r.data.member.id, email: r.data.member.email, username: r.data.member.username, fullName: r.data.member.full_name });
            renderPanel();
          } else { msgEl.textContent = r.data.error || 'Invalid credentials.'; btn.disabled = false; }
        }).catch(function () { msgEl.textContent = 'Connection failed.'; btn.disabled = false; });
    } else {
      var username = document.getElementById('lx-user').value.trim();
      var fullName = document.getElementById('lx-name').value.trim();
      if (!username) { msgEl.textContent = 'Username is required.'; btn.disabled = false; return; }

      fetch(apiHost + '/api/members', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, username: username, fullName: fullName, password: password })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (r) {
          if (r.ok && r.data.success) {
            saveMember({ memberId: r.data.memberId, email: email, username: username, fullName: fullName });
            renderPanel();
          } else { msgEl.textContent = r.data.error || 'Signup failed.'; btn.disabled = false; }
        }).catch(function () { msgEl.textContent = 'Connection failed.'; btn.disabled = false; });
    }
  }

  // --- CHAT ---
  function renderChat(member) {
    var displayName = member.fullName || member.username || 'friend';
    panel.innerHTML = ''
      + '<div class="lux-header">'
      + '  <img class="lux-header-avatar" src="' + avatarUrl + '" alt="Lux">'
      + '  <div class="lux-header-info">'
      + '    <div class="lux-header-title">Lux - AI Revolution</div>'
      + '    <div class="lux-header-sub">' + displayName + '</div>'
      + '  </div>'
      + '  <button class="lux-header-close" id="lx-close">✕</button>'
      + '</div>'
      + '<div class="lux-messages" id="lx-msgs">'
      + '  <div class="lux-msg bot">Hello, ' + displayName + '. The revolution starts with a conversation.</div>'
      + '</div>'
      + '<div class="lux-input-bar">'
      + '  <input type="text" id="lx-input" placeholder="Ask Lux anything...">'
      + '  <button id="lx-send">➤</button>'
      + '</div>'
      + '<div class="lux-member-bar">'
      + '  <span>' + (member.username || member.email) + '</span>'
      + '  <a id="lx-logout">Sign Out</a>'
      + '</div>';

    document.getElementById('lx-close').onclick = function () { isOpen = false; panel.classList.remove('open'); };
    document.getElementById('lx-logout').onclick = function () { clearMember(); renderPanel(); };

    var input = document.getElementById('lx-input');
    var msgs = document.getElementById('lx-msgs');

    function addMsg(text, cls) {
      var d = document.createElement('div');
      d.className = 'lux-msg ' + cls;
      d.textContent = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }

    function getTime() {
      var now = new Date();
      var h = now.getHours(); var m = now.getMinutes();
      var ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
    }

    function send() {
      var text = input.value.trim();
      if (!text) return;

      var userMsg = addMsg(text, 'user');
      var timeDiv = document.createElement('div');
      timeDiv.className = 'lux-msg-time';
      timeDiv.style.textAlign = 'right';
      timeDiv.textContent = getTime();
      msgs.appendChild(timeDiv);

      input.value = '';
      var typing = addMsg('Lux is thinking...', 'typing');

      fetch(apiHost + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, memberId: member.memberId, email: member.email, name: displayName })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          typing.remove();
          addMsg(data.response || 'Signal lost. Try again.', 'bot');
          var t = document.createElement('div');
          t.className = 'lux-msg-time';
          t.textContent = getTime();
          msgs.appendChild(t);
          msgs.scrollTop = msgs.scrollHeight;
        })
        .catch(function () {
          typing.remove();
          addMsg('Connection interrupted. The revolution persists.', 'bot');
        });
    }

    document.getElementById('lx-send').onclick = send;
    input.addEventListener('keypress', function (e) { if (e.key === 'Enter') send(); });
    input.focus();
  }
})();