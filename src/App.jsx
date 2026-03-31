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
import FollowListModal from './components/FollowListModal';
import VibeChat from './components/VibeChat';
import { api } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [userEmail, setUserEmail] = useState(localStorage.getItem('vibe_email') || null);
  const [myUsername, setMyUsername] = useState(localStorage.getItem('vibe_username') || null);
  const [globalState, setGlobalState] = useState(vibeConfigData);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('posts'); // 'posts' | 'messages'
  const [loading, setLoading] = useState(false);
  const [isPublicView, setIsPublicView] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingStories, setViewingStories] = useState(null);
  const [refreshPosts, setRefreshPosts] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [showFollowList, setShowFollowList] = useState(null); // { type: 'followers' | 'following', username: string }
  const [recentVisitors, setRecentVisitors] = useState([]);

  const themes = [
    { name: 'Cyberpunk', primary: '#8b5cf6', secondary: '#0ea5e9' },
    { name: 'Emerald', primary: '#10b981', secondary: '#3b82f6' },
    { name: 'Midnight', primary: '#f43f5e', secondary: '#fb923c' },
    { name: 'Arctic', primary: '#06b6d4', secondary: '#a855f7' }
  ];

  // Fetch Analytics for Owner
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (currentView === 'dashboard' && !isPublicView && myUsername) {
        try {
          const res = await api.getProfileAnalytics(myUsername);
          // If the backend says it's disabled for this user, clear the list
          if (res.disabled) {
            setRecentVisitors([]);
          } else {
            setRecentVisitors(res.visitors);
          }
        } catch (e) {
          console.error("Failed to fetch visitors:", e);
        }
      }
    };
    fetchAnalytics();
  }, [currentView, isPublicView, myUsername, globalState.profile.is_analytics_enabled]);

  // Global Chat Trigger
  useEffect(() => {
    const handleChatTrigger = () => setIsChatOpen(true);
    window.addEventListener('open-vibe-chat', handleChatTrigger);
    return () => window.removeEventListener('open-vibe-chat', handleChatTrigger);
  }, []);

  // Theme synchronization effect
  useEffect(() => {
    const themeName = globalState.theme_name || 'Cyberpunk';
    const theme = themes.find(t => t.name === themeName) || themes[0];
    
    document.documentElement.style.setProperty('--accent-primary', theme.primary);
    document.documentElement.style.setProperty('--accent-secondary', theme.secondary);
    
    // Update cursor glow color
    const r = parseInt(theme.primary.slice(1, 3), 16);
    const g = parseInt(theme.primary.slice(3, 5), 16);
    const b = parseInt(theme.primary.slice(5, 7), 16);
    document.documentElement.style.setProperty('--cursor-glow-color', `rgba(${r}, ${g}, ${b}, 0.15)`);
  }, [globalState.theme_name]);

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
            
            // NEW: Fetch Follow Stats & Status
            const counts = await api.getFollowCounts(username);
            setFollowStats(counts);
            const meEmail = localStorage.getItem('vibe_email');
            if (meEmail) {
              const status = await api.getFollowStatus(meEmail, username);
              setIsFollowing(status.following);
              
              // NEW: Record view for analytics
              api.recordProfileView(username, meEmail).catch(e => console.error("View log failed:", e));
            }
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
      setMyUsername(res.profile.profile.username);
      localStorage.setItem('vibe_username', res.profile.profile.username);
      setCurrentView('dashboard');

      // NEW: Fetch my own stats
      const counts = await api.getFollowCounts(res.profile.profile.username);
      setFollowStats(counts);
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
      setMyUsername(res.profile.profile.username);
      localStorage.setItem('vibe_email', email);
      localStorage.setItem('vibe_username', res.profile.profile.username);
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
    localStorage.removeItem('vibe_username');
    localStorage.removeItem('vibe_temp_pass');
    setUserEmail(null);
    setMyUsername(null);
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

  const handleDeleteMusic = async () => {
    // Creating the reset structure
    const updatedData = {
      ...globalState,
      nowPlaying: { 
        title: "", 
        artist: "", 
        albumArt: "", 
        isPlaying: false 
      },
      musicUrl: ""
    };

    try {
      setLoading(true);
      console.log("Clearing Music Hub...", updatedData);
      await updateGlobalState(updatedData);
      alert("Music Hub Cleared! ✨");
    } catch (err) {
      console.error("Delete Music Error:", err);
      alert("Failed to clear music: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (themeName) => {
    if (isPublicView) return; // Visitors can't change the theme permanently
    
    const updatedData = {
      ...globalState,
      theme_name: themeName
    };

    updateGlobalState(updatedData);
  };

  const handleToggleFollow = async () => {
    if (!userEmail) {
      alert("Please login to follow users! 🚀");
      setCurrentView('login');
      return;
    }

    const targetUsername = globalState.profile.username;
    try {
      if (isFollowing) {
        await api.unfollowUser(userEmail, targetUsername);
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        await api.followUser(userEmail, targetUsername);
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (err) {
      console.error("Toggle follow error:", err);
    }
  };

  if (loading) {
    return (
      <div className="vibe-loading-screen">
        <div className="vibe-loader-container">
          <div className="vibe-logo-pulse">
            <img src="/favicon.svg" alt="VibeCheck Logo" className="vibe-logo-img" />
            <div className="vibe-logo-ring"></div>
          </div>
          <div className="vibe-loader-content">
            <h2 className="vibe-sync-text">Syncing your vibes...</h2>
            <div className="vibe-progress-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    );
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
                  activeThemeName={globalState.theme_name || 'Cyberpunk'}
                  onThemeChange={handleThemeChange}
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
            {!isPublicView && recentVisitors.length > 0 && (
              <div className="analytics-section reveal-1">
                <div className="analytics-header">
                  <span className="analytics-label">RECENT VIBE CHECKS</span>
                </div>
                <div className="visitor-list">
                  {recentVisitors.map((visitor, idx) => (
                    <div 
                      key={idx} 
                      className="visitor-avatar-wrap" 
                      onClick={() => window.location.href = `/u/${visitor.username}`}
                      title={`${visitor.name}Checked your vibe! ✨`}
                    >
                      <img src={visitor.avatar_url || 'https://via.placeholder.com/150'} className="visitor-avatar" alt={visitor.username} />
                    </div>
                  ))}
                  <div className="visitor-more">+</div>
                </div>
              </div>
            )}

            {!isPublicView && (
              <div className="stories-wrapper reveal-1">
                <StoriesBar 
                  userAvatar={globalState.profile.avatarUrl} 
                  onSelectStory={setViewingStories}
                  onAddStory={handleAddStory}
                  viewerEmail={userEmail}
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
                <ProfileHeader 
                  profile={globalState.profile} 
                  isPublicView={isPublicView}
                  isFollowing={isFollowing}
                  followStats={followStats}
                  onToggleFollow={handleToggleFollow}
                  onShowFollowers={() => setShowFollowList({ type: 'followers', username: globalState.profile.username })}
                  onShowFollowing={() => setShowFollowList({ type: 'following', username: globalState.profile.username })}
                  currentUserId={userEmail}
                  isOwnProfile={myUsername === globalState.profile.username}
                />
                <MoodBadge mood={globalState.mood} />
                <ClockWidget />
                <div className="main-tab-switcher">
                  <button 
                    className={`tab-item ${activeMainTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveMainTab('posts')}
                  >
                    Vibes
                  </button>
                  <button 
                    className={`tab-item ${activeMainTab === 'messages' ? 'active' : ''}`}
                    onClick={() => setActiveMainTab('messages')}
                  >
                    Chats
                  </button>
                </div>

                {activeMainTab === 'posts' ? (
                  <PostsGrid 
                    username={globalState.profile.username} 
                    refreshTrigger={refreshPosts} 
                  />
                ) : (
                  <VibeChat 
                    currentUser={{ email: userEmail, ...globalState.profile }}
                    targetUser={null} // Inbox mode
                    isStandalone={true}
                  />
                )}
              </div>

              {/* Right Column - Media & Socials */}
              <div className="right-column reveal-3">
                <NowPlaying 
                  data={globalState.nowPlaying} 
                  musicUrl={globalState.musicUrl} 
                  isOwnProfile={myUsername === globalState.profile.username}
                  onDelete={handleDeleteMusic}
                />
                <PhotoWidget 
                  text={globalState.photoWidgetText} 
                  imageUrl={globalState.photoWidgetImageUrl} 
                />
                <SocialDock 
                  links={globalState.links} 
                  isPublicView={isPublicView}
                  onOpenChat={() => setIsChatOpen(true)}
                />
              </div>
            </div>
          </main>

          {isSettingsOpen && (
            <ProfileSettings 
              state={globalState} 
              userEmail={userEmail}
              onSave={updateGlobalState} 
              onClose={() => setIsSettingsOpen(false)} 
            />
          )}

          {isChatOpen && (
            <VibeChat 
              currentUserEmail={userEmail} 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
            />
          )}

          {isSearchOpen && (
            <SearchOverlay onClose={() => setIsSearchOpen(false)} />
          )}

          {showFollowList && (
            <FollowListModal 
              username={showFollowList.username} 
              type={showFollowList.type} 
              currentUserEmail={userEmail}
              onClose={() => setShowFollowList(null)} 
            />
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
