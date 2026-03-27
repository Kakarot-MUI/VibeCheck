import { useState } from 'react';
import GlassCard from './GlassCard';
import './Login.css';

const Login = ({ onLogin, onSwitchToSignup, onSwitchToForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
    }
  };

  return (
    <div className="auth-container">
      <GlassCard className="auth-card reveal-1" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
        <h1 className="auth-title text-glow">VibeCheck</h1>
        <p className="auth-subtitle">Sign in to your aesthetic hub</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
          <button type="submit" className="auth-submit-btn">Get Started</button>
        </form>

        <div className="auth-footer">
          <p>No account? <span onClick={onSwitchToSignup} className="auth-link">Create Account</span></p>
          <span className="dot">.</span>
          <p onClick={onSwitchToForgot} className="auth-link">Forgot?</p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
