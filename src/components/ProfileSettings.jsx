import { useState, useRef } from 'react';
import GlassCard from './GlassCard';
import { api } from '../services/api';
import './ProfileSettings.css';

const ProfileSettings = ({ state, userEmail, onSave, onClose }) => {
  // Tabs for better organization
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [profile, setProfile] = useState(state.profile);
  // Mood State
  const [mood, setMood] = useState(state.mood);
  // Music State
  const [nowPlaying, setNowPlaying] = useState(state.nowPlaying);
  // Widget State
  const [photoWidgetText, setPhotoWidgetText] = useState(state.photoWidgetText || "");
  const [photoWidgetImageUrl, setPhotoWidgetImageUrl] = useState(state.photoWidgetImageUrl || "");
  // Theme State
  const [themeName, setThemeName] = useState(state.theme_name || 'Cyberpunk');
  // Social Links State
  const [links, setLinks] = useState(state.links || []);
  const [musicUrl, setMusicUrl] = useState(state.musicUrl || "");
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(state.profile.is_analytics_enabled ?? true);

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const widgetFileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWidgetFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && userEmail) {
      try {
        setLoading(true);
        const res = await api.uploadWidgetPhoto(userEmail, file);
        setPhotoWidgetImageUrl(res.imageUrl);
        alert("Photo Uploaded! 🚀");
      } catch (err) {
        alert("Upload failed: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const triggerFilePicker = () => {
    const hasPermission = window.confirm("Allow VibeCheck to access your photos and media?");
    if (hasPermission) {
      fileInputRef.current.click();
    }
  };

  const triggerWidgetFilePicker = () => {
    widgetFileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      profile: { ...profile, is_analytics_enabled: isAnalyticsEnabled }, 
      mood, 
      nowPlaying: { ...nowPlaying, isPlaying: nowPlaying.title !== "No music playing" }, 
      photoWidgetText,
      photoWidgetImageUrl,
      theme_name: themeName,
      links,
      musicUrl
    });
    onClose();
  };

  const addLink = () => {
    setLinks([...links, { id: Date.now(), title: "New Link", url: "https://", platform: "default" }]);
  };

  const updateLink = (id, field, value) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeLink = (id) => {
    setLinks(links.filter(l => l.id !== id));
  };

  return (
    <div className="modal-overlay">
      <GlassCard className="settings-modal reveal-1" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        {loading && <div className="modal-loader"><div className="loader"></div></div>}
        <div className="settings-header">
          <h2 className="heading text-glow">Customize Hub</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="settings-tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`tab-btn ${activeTab === 'vibe' ? 'active' : ''}`} onClick={() => setActiveTab('vibe')}>Vibe</button>
          <button className={`tab-btn ${activeTab === 'music' ? 'active' : ''}`} onClick={() => setActiveTab('music')}>Music</button>
          <button className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`} onClick={() => setActiveTab('links')}>Links</button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form scrollable">
          {activeTab === 'profile' && (
            <div className="tab-content reveal-1">
              <div className="share-section glass-card-mini">
                 <div className="share-group">
                   <label className="share-label">Your Unique ID (Code)</label>
                   <div className="share-row">
                     <span className="share-id-text">{state.profile.username || "Generating..."}</span>
                     <button type="button" className="copy-btn-minimal" onClick={() => {
                       if (state.profile.username) {
                         navigator.clipboard.writeText(state.profile.username);
                         alert("ID Code copied! 🆔");
                       }
                     }}>Copy ID</button>
                   </div>
                 </div>
                 
                 <div className="share-group" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                   <label className="share-label">Shareable Link</label>
                   <div className="share-row">
                     <span className="share-link-text">{state.profile.username ? `${window.location.origin}/u/${state.profile.username}` : "..."}</span>
                     <button type="button" className="copy-btn-minimal" onClick={() => {
                       if (state.profile.username) {
                         navigator.clipboard.writeText(`${window.location.origin}/u/${state.profile.username}`);
                         alert("Link copied! 🚀");
                       }
                     }}>Copy Link</button>
                   </div>
                 </div>
              </div>

              <div className="share-section" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                 <label className="share-label">Dashboard Actions</label>
                 <button type="button" className="glass-btn-accent" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => {
                   onClose();
                   document.getElementById('post-upload-input').click();
                 }}>
                   📸 Post a New Vibe
                 </button>
              </div>

              <div className="avatar-preview-section">
                <div className="preview-container" onClick={triggerFilePicker}>
                  <div className="preview-circle">
                     <img src={profile.avatarUrl} alt="Preview" className="avatar-preview-img" />
                  </div>
                  <div className="avatar-overlay">
                    <span>Change</span>
                  </div>
                </div>
                <div className="avatar-input-group">
                   <button type="button" className="upload-trigger-btn" onClick={triggerFilePicker}>Upload Photo</button>
                   <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                </div>
              </div>

              <div className="setting-item">
                <label>Display Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="glass-input" />
              </div>
              <div className="setting-item">
                <label>Bio</label>
                <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="glass-input" rows="2" />
              </div>
            </div>
          )}

          {activeTab === 'vibe' && (
            <div className="tab-content reveal-1">
              <div className="setting-item">
                <label>Current Vibe (Text)</label>
                <input type="text" value={mood.vibe} onChange={(e) => setMood({...mood, vibe: e.target.value})} className="glass-input" placeholder="e.g. Chilling 🧊" />
              </div>
              <div className="setting-item">
                <label>Dashboard Theme</label>
                <select 
                  value={themeName} 
                  onChange={(e) => setThemeName(e.target.value)}
                  className="glass-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Cyberpunk">Cyberpunk (Default)</option>
                  <option value="Emerald">Emerald (Green)</option>
                  <option value="Sunset">Sunset (Orange/Pink)</option>
                  <option value="Midnight">Midnight (Dark Blue)</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Vibe Color</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input type="color" value={mood.color.startsWith('var') ? '#8b5cf6' : mood.color} onChange={(e) => setMood({...mood, color: e.target.value})} className="color-picker" />
                  <span className="helper-text">This glowing orb reflects your energy.</span>
                </div>
              </div>
              <div className="setting-item" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem' }}>Enable Vibe Analytics</label>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Track profile visitors (Anonymizes your visits if OFF)</span>
                  </div>
                  <div 
                    className={`glass-toggle ${isAnalyticsEnabled ? 'active' : ''}`} 
                    onClick={() => setIsAnalyticsEnabled(!isAnalyticsEnabled)}
                  >
                    <div className="toggle-handle"></div>
                  </div>
                </div>
              </div>

              <div className="setting-item" style={{ marginTop: '1.5rem' }}>
                <label>Photo Widget Title</label>
                <input type="text" value={photoWidgetText} onChange={(e) => setPhotoWidgetText(e.target.value)} className="glass-input" placeholder="e.g. My Workspace" />
              </div>
              <div className="setting-item">
                <label>Photo Widget Image URL</label>
                <div className="upload-row-integrated">
                  <input 
                    type="text" 
                    value={photoWidgetImageUrl} 
                    onChange={(e) => {
                      const val = e.target.value;
                      // Unsplash Normalizer
                      if (val.includes('unsplash.com/photos/')) {
                        const photoId = val.split('photos/')[1]?.split('?')[0];
                        if (photoId) {
                          setPhotoWidgetImageUrl(`https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&q=80`);
                          return;
                        }
                      }
                      setPhotoWidgetImageUrl(val);
                    }} 
                    className="glass-input" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                  <button type="button" className="upload-mini-btn" title="Upload from Device" onClick={triggerWidgetFilePicker}>
                    📁
                  </button>
                  <input type="file" ref={widgetFileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleWidgetFileChange} />
                </div>
                <p className="input-hint">Paste an image link or upload from your device! 📸</p>
                
                {/* Live Preview Section */}
                {photoWidgetImageUrl && (
                  <div className="url-preview-container">
                    <p className="preview-label">Live Preview:</p>
                    <div className="mini-polaroid-preview">
                      <img 
                        src={photoWidgetImageUrl} 
                        alt="Preview" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={(e) => {
                          e.target.style.display = 'block';
                          e.target.nextSibling.style.display = 'none';
                        }}
                      />
                      <div className="preview-error-msg" style={{ display: 'none' }}>
                        <span>⚠️ Invalid Image Link</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'music' && (
            <div className="tab-content reveal-1">
              <div className="setting-item">
                <label>Song Title</label>
                <input type="text" value={nowPlaying.title} onChange={(e) => setNowPlaying({...nowPlaying, title: e.target.value})} className="glass-input" />
              </div>
              <div className="setting-item">
                <label>Artist Name</label>
                <input type="text" value={nowPlaying.artist} onChange={(e) => setNowPlaying({...nowPlaying, artist: e.target.value})} className="glass-input" />
              </div>
              <div className="setting-item">
                <label>Album Art URL</label>
                <input type="text" value={nowPlaying.albumArt} onChange={(e) => setNowPlaying({...nowPlaying, albumArt: e.target.value})} className="glass-input" placeholder="https://..." />
              </div>
              <div className="setting-item" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <label>Interactive Player Link (Spotify/YouTube)</label>
                <input 
                  type="text" 
                  value={musicUrl} 
                  onChange={(e) => setMusicUrl(e.target.value)} 
                  className="glass-input" 
                  placeholder="https://open.spotify.com/track/..."
                />
                <p className="input-hint">Paste a link to enable the playable player in your hub!</p>
              </div>
            </div>
          )}
          
          {activeTab === 'links' && (
            <div className="tab-content reveal-1">
              <div className="links-list">
                {links.map((link) => (
                  <div key={link.id} className="link-edit-item glass-card-mini">
                    <div className="link-row">
                      <select 
                        value={link.platform} 
                        onChange={(e) => updateLink(link.id, 'platform', e.target.value)}
                        className="glass-input platform-select"
                      >
                        <option value="default">Platform</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="github">GitHub</option>
                        <option value="spotify">Spotify</option>
                        <option value="youtube">YouTube</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="discord">Discord</option>
                        <option value="steam">Steam</option>
                      </select>
                      <input 
                        type="text" 
                        value={link.url} 
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        className="glass-input"
                        placeholder="URL (https://...)"
                      />
                      <button type="button" onClick={() => removeLink(link.id)} className="remove-link-btn">&times;</button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addLink} className="add-link-btn">+ Add Social Link</button>
            </div>
          )}

          <div className="settings-actions">
            <button type="submit" className="save-btn">Apply Vibes</button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default ProfileSettings;
