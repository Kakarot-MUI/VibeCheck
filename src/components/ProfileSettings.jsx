import { useState, useRef } from 'react';
import GlassCard from './GlassCard';
import './ProfileSettings.css';

const ProfileSettings = ({ state, onSave, onClose }) => {
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
  // Social Links State
  const [links, setLinks] = useState(state.links || []);

  const fileInputRef = useRef(null);

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

  const triggerFilePicker = () => {
    const hasPermission = window.confirm("Allow VibeCheck to access your photos and media?");
    if (hasPermission) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      profile, 
      mood, 
      nowPlaying: { ...nowPlaying, isPlaying: nowPlaying.title !== "No music playing" }, 
      photoWidgetText,
      links
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
                 <label className="share-label">Your Shareable ID</label>
                 <div className="share-url-container">
                   <span className="share-url">
                     {state.profile.username 
                       ? `${window.location.origin}/u/${state.profile.username}` 
                       : "Generating your unique ID... (Try Logout/Login)"}
                   </span>
                   {state.profile.username && (
                     <button type="button" className="copy-btn" onClick={() => {
                       navigator.clipboard.writeText(`${window.location.origin}/u/${state.profile.username}`);
                       alert("Link copied to clipboard! 🚀");
                     }}>Copy</button>
                   )}
                 </div>
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
                <label>Vibe Color</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input type="color" value={mood.color.startsWith('var') ? '#8b5cf6' : mood.color} onChange={(e) => setMood({...mood, color: e.target.value})} className="color-picker" />
                  <span className="helper-text">This glowing orb reflects your energy.</span>
                </div>
              </div>
              <div className="setting-item" style={{ marginTop: '1.5rem' }}>
                <label>Photo Widget Title</label>
                <input type="text" value={photoWidgetText} onChange={(e) => setPhotoWidgetText(e.target.value)} className="glass-input" placeholder="e.g. My Workspace" />
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
