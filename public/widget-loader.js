(function() {
  // Configuration
  const config = window.LuxChatConfig || {
    siteId: 'default',
    position: 'bottom-right',
    theme: 'dark'
  };

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://your-domain.com/styles/chat-widget.css';
  document.head.appendChild(link);

  // Create container
  const container = document.createElement('div');
  container.id = 'lux-chat-container';
  document.body.appendChild(container);

  // Load React and widget
  const script = document.createElement('script');
  script.src = 'https://your-domain.com/widget.js';
  script.onload = function() {
    // Widget will be rendered here
    if (window.renderLuxChat) {
      window.renderLuxChat('lux-chat-container', config);
    }
  };
  document.body.appendChild(script);
})();