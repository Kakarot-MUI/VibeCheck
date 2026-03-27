import { useState } from 'react';
import GlassCard from './GlassCard';
import './Login.css';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSent(true);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-glow"></div>
      
      <GlassCard className="login-card reveal-1" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}>
        <div className="login-header">
          <h1 className="heading text-glow">Reset Password</h1>
          <p className="login-subtitle">
            {isSent ? "Check your email for reset instructions" : "Enter your email to receive a recovery link"}
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Recovery Email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
              />
            </div>
            
            <button 
              type="submit" 
              className="login-submit-btn"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span>Send Reset Link</span>
              <div className={`btn-glow ${isHovered ? 'active' : ''}`}></div>
            </button>
          </form>
        ) : (
          <div style={{ marginTop: '1rem' }}>
             <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
             </svg>
          </div>
        )}

        <div className="login-footer">
          <a href="#" className="signup-link" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
            Back to Sign In
          </a>
        </div>
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;
