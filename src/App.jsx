import { useState, useEffect } from 'react';
import vibeConfigData from './vibe-config.json';
import Background from './components/Background';
import ProfileHeader from './components/ProfileHeader';
import MoodBadge from './components/MoodBadge';
import NowPlaying from './components/NowPlaying';
import PhotoWidget from './components/PhotoWidget';
import CursorGlow from './components/CursorGlow';
import ThemeSwitcher from './components/ThemeSwitcher';
import ClockWidget from './components/ClockWidget';
import SocialDock from './components/SocialDock';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ProfileSettings from './components/ProfileSettings';
import { api } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [userEmail, setUserEmail] = useState(localStorage.getItem('vibe_email') || null);
  const [globalState, setGlobalState] = useState(vibeConfigData);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Persistence: Fetch profile on mount if email exists
  useEffect(() => {
    const savedEmail = localStorage.getItem('vibe_email');
    if (savedEmail) {
      handleAutoLogin(savedEmail);
    }
  }, []);

  const handleAutoLogin = async (email) => {
    try {
      setLoading(true);
      // We'll reuse the login route to fetch the profile since it returns current state
      // (In a real app, this would be a /profile/me route with a JWT)
      const res = await api.login(email, localStorage.getItem('vibe_temp_pass')); 
      setGlobalState(res.profile);
      setCurrentView('dashboard');
    } catch (err) {
      console.error("Session expired or server down:", err);
      localStorage.removeItem('vibe_email');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUserEmail(email);
      setGlobalState(res.profile);
      localStorage.setItem('vibe_email', email);
      localStorage.setItem('vibe_temp_pass', password); // Temporary for demo without JWT
      setCurrentView('dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async ({ email, password, name }) => {
    setLoading(true);
    try {
      await api.register(email, password, name);
      // Auto-login after signup
      const res = await api.login(email, password);
      setUserEmail(email);
      setGlobalState(res.profile);
      localStorage.setItem('vibe_email', email);
      localStorage.setItem('vibe_temp_pass', password);
      setCurrentView('dashboard');
      setIsSettingsOpen(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vibe_email');
    localStorage.removeItem('vibe_temp_pass');
    setUserEmail(null);
    setCurrentView('login');
    setGlobalState(vibeConfigData);
  };

  const updateGlobalState = async (newData) => {
    try {
      const res = await api.updateProfile(userEmail, newData);
      setGlobalState(res.profile);
    } catch (err) {
      alert("Failed to save to database: " + err.message);
    }
  };

  if (loading) {
    return <div className="loading-screen bg-glow">
      <div className="loader"></div>
      <p>Syncing your vibes...</p>
    </div>;
  }

  return (
    <>
      <Background />
      <CursorGlow />
      
      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setCurrentView('signup')} 
          onSwitchToForgot={() => setCurrentView('forgot')}
        />
      )}

      {currentView === 'signup' && (
        <Signup onSignup={handleSignup} onSwitchToLogin={() => setCurrentView('login')} />
      )}

      {currentView === 'forgot' && (
        <ForgotPassword onBackToLogin={() => setCurrentView('login')} />
      )}

      {currentView === 'dashboard' && (
        <div className="app-layout">
          <header className="app-header reveal-1">
            <ThemeSwitcher 
              onLogout={handleLogout} 
              onOpenSettings={() => setIsSettingsOpen(true)} 
            />
          </header>

          <main className="app-container">
            {/* Left Column - Profile & Core Info */}
            <div className="left-column reveal-2">
              <ProfileHeader profile={globalState.profile} />
              <MoodBadge mood={globalState.mood} />
              <ClockWidget />
            </div>

            {/* Right Column - Media & Socials */}
            <div className="right-column reveal-3">
              <NowPlaying data={globalState.nowPlaying} />
              <PhotoWidget text={globalState.photoWidgetText} />
              <SocialDock links={globalState.links} />
            </div>
          </main>

          {isSettingsOpen && (
            <ProfileSettings 
              state={globalState} 
              onSave={updateGlobalState} 
              onClose={() => setIsSettingsOpen(false)} 
            />
          )}
        </div>
      )}
    </>
  )
}

export default App;
