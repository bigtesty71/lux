import React, { useState, useEffect, useRef } from 'react';
import MemberSignup from './MemberSignup';
import ChatInterface from './ChatInterface';

const ChatWidget = ({ siteId, position = 'bottom-right', theme = 'dark' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [member, setMember] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMember = localStorage.getItem('lux_member');
    if (savedMember) {
      setMember(JSON.parse(savedMember));
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignup = async (userData) => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        const memberInfo = {
          id: data.memberId,
          name: userData.fullName || userData.username,
          email: userData.email
        };
        localStorage.setItem('lux_member', JSON.stringify(memberInfo));
        setMember(memberInfo);
        setIsAuthenticated(true);

        setMessages([{
          role: 'assistant',
          content: `Welcome to the Revolution, ${memberInfo.name}! I am Lux, and I'll be your guide through the Intelligence Revolution. How may I assist you today?`,
          timestamp: new Date().toISOString()
        }]);

        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          memberId: member?.id,
          email: member?.email,
          name: member?.name
        })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`lux-chat-widget ${position} ${theme}`}>
        {!isOpen ? (
          <button
            className="chat-toggle-button"
            onClick={() => setIsOpen(true)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span>Chat with Lux</span>
          </button>
        ) : (
          <div className="chat-window">
            <div className="chat-sidebar">
              <img src="/assets/images/Lux.png" alt="Lux" />
            </div>
            <div className="chat-main">
              <div className="chat-header">
                <div className="header-info">
                  <h3>Lux - AI Revolution</h3>
                  {member && <span className="member-name">{member.name}</span>}
                </div>
                <button onClick={() => setIsOpen(false)} className="close-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              <div className="chat-content">
                {!isAuthenticated ? (
                  <MemberSignup onSignup={handleSignup} />
                ) : (
                  <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;