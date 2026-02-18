(function() {
  // Memory widget loader
  const config = window.LuxMemoryConfig || {
    siteId: 'default',
    position: 'bottom-right',
    theme: 'dark'
  };

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://your-domain.com/styles/memory-widget.css';
  document.head.appendChild(link);

  // Create floating memory button
  const button = document.createElement('button');
  button.id = 'lux-memory-button';
  button.innerHTML = '🧠';
  button.title = 'Open Lux Memory Bank';
  button.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 24px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 9998;
    transition: transform 0.2s;
  `;
  
  button.onmouseover = () => button.style.transform = 'scale(1.1)';
  button.onmouseout = () => button.style.transform = 'scale(1)';
  
  document.body.appendChild(button);

  // Load the full memory panel when clicked
  button.addEventListener('click', () => {
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/memory-panel.js';
    script.onload = () => {
      if (window.openLuxMemory) {
        window.openLuxMemory(config);
      }
    };
    document.body.appendChild(script);
  });
})();