import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import './ThemeSwitcher.css';

const themes = [
  { name: 'Cyberpunk', primary: '#8b5cf6', secondary: '#0ea5e9' },
  { name: 'Emerald', primary: '#10b981', secondary: '#3b82f6' },
  { name: 'Midnight', primary: '#f43f5e', secondary: '#fb923c' },
  { name: 'Arctic', primary: '#06b6d4', secondary: '#a855f7' }
];

const ThemeSwitcher = ({ activeThemeName, onThemeChange, onLogout, onOpenSettings }) => {
  return (
    <div className="header-controls">
      <GlassCard className="theme-switcher" style={{ borderRadius: '50px', padding: '0.5rem 1rem' }}>
        <div className="theme-options">
          {themes.map((theme) => (
            <button
              key={theme.name}
              className={`theme-btn ${activeThemeName === theme.name ? 'active' : ''}`}
              onClick={() => onThemeChange && onThemeChange(theme.name)}
              title={theme.name}
            >
              <div className="color-dots">
                <div className="dot" style={{ backgroundColor: theme.primary }}></div>
                <div className="dot" style={{ backgroundColor: theme.secondary }}></div>
              </div>
              <span className="theme-name">{theme.name}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      <button className="icon-btn settings-trigger" onClick={onOpenSettings} title="Profile Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span className="btn-label">Edit Hub</span>
      </button>

      <button className="icon-btn logout" onClick={onLogout} title="Sign Out">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  );
};

export default ThemeSwitcher;
