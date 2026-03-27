import { useState } from 'react';
import GlassCard from './GlassCard';
import './Login.css'; // Reusing common styles

const Signup = ({ onSignup, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password) {
      onSignup({ name, email, password });
    }
  };

  return (
    <div className="auth-container">
      <GlassCard className="auth-card reveal-1" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
        <h1 className="auth-title text-glow">Join VibeCheck</h1>
        <p className="auth-subtitle">Create your personal aesthetic space</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Display Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
              required
            />
          </div>
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              required
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
              required
            />
          </div>
          <button type="submit" className="auth-submit-btn">Create Account</button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <span onClick={onSwitchToLogin} className="auth-link">Login</span></p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Signup;
