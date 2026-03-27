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
import SearchOverlay from './components/SearchOverlay';
import StoriesBar from './components/StoriesBar';
import StoryViewer from './components/StoryViewer';
import PostsGrid from './components/PostsGrid';
import { api } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [userEmail, setUserEmail] = useState(localStorage.getItem('vibe_email') || null);
  const [globalState, setGlobalState] = useState(vibeConfigData);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPublicView, setIsPublicView] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingStories, setViewingStories] = useState(null);
  const [refreshPosts, setRefreshPosts] = useState(0);

  // Persistence: Fetch profile on mount
  useEffect(() => {
    const checkRoute = async () => {
      const path = window.location.pathname;
      if (path.startsWith('/u/')) {
        const username = path.split('/u/')[1];
        if (username) {
          try {
            setLoading(true);
            const res = await api.getPublicProfile(username);
            setGlobalState(res.profile);
            setIsPublicView(true);
            setCurrentView('dashboard');
          } catch (err) {
            console.error("Public profile not found:", err);
            setCurrentView('login');
          } finally {
            setLoading(false);
          }
          return;
        }
      }

      const savedEmail = localStorage.getItem('vibe_email');
      if (savedEmail) {
        handleAutoLogin(savedEmail);
      }
    };
    checkRoute();
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && userEmail) {
      try {
        setLoading(true);
        await api.uploadStory(userEmail, file);
        alert("Vibe Posted! ✨ (Your story is live)");
        window.location.reload(); 
      } catch (err) {
        alert("Failed to post story: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePostChange = async (e) => {
    const file = e.target.files[0];
    if (file && userEmail) {
      const caption = prompt("Add a caption for your post:");
      try {
        setLoading(true);
        await api.uploadPost(userEmail, file, caption);
        alert("Vibe Shared to Feed! ✨");
        setRefreshPosts(prev => prev + 1);
      } catch (err) {
        alert("Failed to post: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddStory = () => {
    document.getElementById('story-upload-input').click();
  };

  const handleAddPost = () => {
    document.getElementById('post-upload-input').click();
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
            {!isPublicView ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="search-trigger" onClick={() => setIsSearchOpen(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
                <ThemeSwitcher 
                  onLogout={handleLogout} 
                  onOpenSettings={() => setIsSettingsOpen(true)} 
                />
                {!isPublicView && (
                  <button className="glass-btn-accent" onClick={handleAddPost}>
                    Post Vibe
                  </button>
                )}
              </div>
            ) : (
              <div className="viewer-controls">
                <button className="back-btn" onClick={() => window.location.href = '/'}>Create Your Own Vibe</button>
              </div>
            )}
          </header>

          <main className="app-container">
            {!isPublicView && (
              <div className="stories-wrapper reveal-1">
                <StoriesBar 
                  userAvatar={globalState.profile.avatarUrl} 
                  onSelectStory={setViewingStories}
                  onAddStory={handleAddStory}
                />
              </div>
            )}
            
            {globalState.profile.name === "Your Name Here" && (
              <div className="setup-hint reveal-1">
                <p>Welcome! Tap <span>Edit Hub</span> above to add your music and vibe. 🚀</p>
              </div>
            )}
            <div className="main-content-row">
              {/* Left Column - Profile & Core Info */}
              <div className="left-column reveal-2">
                <ProfileHeader profile={globalState.profile} />
                <MoodBadge mood={globalState.mood} />
                <ClockWidget />
                <PostsGrid 
                  username={globalState.profile.username} 
                  refreshTrigger={refreshPosts} 
                />
              </div>

              {/* Right Column - Media & Socials */}
              <div className="right-column reveal-3">
                <NowPlaying data={globalState.nowPlaying} />
                <PhotoWidget text={globalState.photoWidgetText} />
                <SocialDock links={globalState.links} />
              </div>
            </div>
          </main>

          {isSettingsOpen && (
            <ProfileSettings 
              state={globalState} 
              onSave={updateGlobalState} 
              onClose={() => setIsSettingsOpen(false)} 
            />
          )}

          {isSearchOpen && (
            <SearchOverlay onClose={() => setIsSearchOpen(false)} />
          )}

          {viewingStories && (
            <StoryViewer 
              userStories={viewingStories} 
              onClose={() => setViewingStories(null)} 
            />
          )}

          <input 
            type="file" 
            id="story-upload-input" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleFileChange}
          />
          <input 
            type="file" 
            id="post-upload-input" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handlePostChange}
          />
        </div>
      )}
    </>
  )
}

export default App;
