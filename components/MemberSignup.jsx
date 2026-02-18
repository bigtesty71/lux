import React, { useState } from 'react';

const MemberSignup = ({ onSignup }) => {
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

    if (!formData.email || !formData.username || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    const result = await onSignup(formData);

    if (result && !result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="member-signup">
      <div className="signup-header">
        <h4>Join the Revolution</h4>
        <p>Become a member to begin your journey with Lux</p>
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

        <div className="form-group">
          <label>Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a password"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="signup-button">
          Begin Your Journey
        </button>
      </form>

      <div className="signup-footer">
        <p>By joining, you agree to be part of the Intelligence Revolution.</p>
      </div>
    </div>
  );
};

export default MemberSignup;