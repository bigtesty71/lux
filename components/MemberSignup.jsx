import React, { useState } from 'react';

const MemberSignup = ({ onSignup, onLogin }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!formData.email || !formData.username || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      const result = await onSignup(formData);
      if (result && !result.success) {
        setError(result.error);
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Please fill in email and password');
        return;
      }
      const result = await onLogin(formData);
      if (result && !result.success) {
        setError(result.error);
      }
    }
  };

  return (
    <div className="member-signup">
      <div className="signup-header">
        <h4>{mode === 'register' ? 'Join the Revolution' : 'Welcome Back'}</h4>
        <p>{mode === 'register' ? 'Become a member to begin your journey with Lux' : 'Sign in to continue your journey'}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); }}
          style={{ padding: '8px 16px', background: mode === 'login' ? '#333' : 'transparent', color: mode === 'login' ? '#fff' : '#666', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setError(''); }}
          style={{ padding: '8px 16px', background: mode === 'register' ? '#333' : 'transparent', color: mode === 'register' ? '#fff' : '#666', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your@email.com"
            required
          />
        </div>

        {mode === 'register' && (
          <>
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="How should Lux address you?"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={mode === 'register' ? "Create a password" : "Enter your password"}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="signup-button">
          {mode === 'register' ? 'Begin Your Journey' : 'Log In'}
        </button>
      </form>

      <div className="signup-footer">
        <p>By joining, you agree to be part of the Intelligence Revolution.</p>
      </div>
    </div>
  );
};

export default MemberSignup;