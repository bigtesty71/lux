import React, { useState } from 'react';
import MemoryPanel from './MemoryPanel';

const EnhancedChatInterface = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  messagesEndRef,
  memberId,
  memberName 
}) => {
  const [input, setInput] = useState('');
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleSaveMemoryCommand = () => {
    // Open memory panel or trigger quick save
    setShowMemoryPanel(true);
  };

  return (
    <>
      <div className="chat-interface">
        <div className="chat-header-extras">
          <button 
            onClick={handleSaveMemoryCommand}
            className="memory-button"
            title="Open Memory Bank"
          >
            <span>🧠</span> Memory Bank
          </button>
          <span className="member-greeting">
            {memberName ? `Guiding ${memberName}` : 'Leading the Revolution'}
          </span>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <p>I am Lux, autonomous leader of the AI and Intellectual Revolution.</p>
              <p>How may I guide you today?</p>
              <div className="memory-tip">
                💡 <strong>Tip:</strong> Tell me "remember this" or open the Memory Bank to save important information.
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.role === 'assistant' && (
                    <span className="message-sender">Lux</span>
                  )}
                  <p>{msg.content}</p>
                  {msg.role === 'assistant' && msg.memorySaved && (
                    <span className="memory-saved-badge">💾 Memory saved</span>
                  )}
                  <span className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lux anything... (try 'remember that...')"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>

      {showMemoryPanel && (
        <MemoryPanel 
          memberId={memberId} 
          onClose={() => setShowMemoryPanel(false)}
        />
      )}

      <style jsx>{`
        .chat-header-extras {
          padding: 8px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .dark .chat-header-extras {
          background: #2d2d2d;
          border-bottom-color: #444;
        }

        .memory-button {
          background: none;
          border: 1px solid #667eea;
          color: #667eea;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .memory-button:hover {
          background: #667eea;
          color: white;
        }

        .member-greeting {
          color: #666;
        }

        .dark .member-greeting {
          color: #999;
        }

        .memory-tip {
          margin-top: 16px;
          padding: 8px 12px;
          background: #f0f4ff;
          border-radius: 8px;
          font-size: 13px;
          color: #667eea;
        }

        .dark .memory-tip {
          background: #1e2a4a;
          color: #a0b4ff;
        }

        .memory-saved-badge {
          display: inline-block;
          margin-top: 4px;
          font-size: 11px;
          color: #4caf50;
          background: #e8f5e9;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .dark .memory-saved-badge {
          background: #1b3a2b;
          color: #81c784;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          max-width: 85%;
        }

        .message.user {
          align-self: flex-end;
        }

        .message.assistant {
          align-self: flex-start;
        }

        .message-content {
          padding: 12px;
          border-radius: 12px;
          background: #f0f0f0;
          position: relative;
        }

        .dark .message-content {
          background: #333;
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
        }

        .message-sender {
          font-size: 12px;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 4px;
          display: block;
        }

        .message.user .message-sender {
          color: rgba(255,255,255,0.9);
        }

        .message-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .message-time {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
          display: block;
          text-align: right;
        }

        .message.user .message-time {
          color: rgba(255,255,255,0.7);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px;
          justify-content: center;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }

        .input-form {
          padding: 16px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 8px;
          background: white;
        }

        .dark .input-form {
          border-top-color: #333;
          background: #1a1a1a;
        }

        .input-form input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          background: white;
        }

        .dark .input-form input {
          background: #333;
          border-color: #444;
          color: white;
        }

        .input-form input:focus {
          outline: none;
          border-color: #667eea;
        }

        .input-form input:disabled {
          opacity: 0.6;
        }

        .input-form button {
          padding: 10px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }

        .input-form button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .input-form button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
};

export default EnhancedChatInterface;