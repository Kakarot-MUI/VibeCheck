import vibeConfig from '../vibe-config.json';
import GlassCard from './GlassCard';
import './ProfileHeader.css';

const ProfileHeader = ({ profile, isPublicView, isFollowing, followStats, onToggleFollow, onShowFollowers, onShowFollowing, currentUserId, isOwnProfile }) => {
  const displayProfile = profile || vibeConfig.profile;
  const showFollowButton = isPublicView && !isOwnProfile;

  return (
    <GlassCard className="profile-header" hoverEffect={false}>
      <div className="header-top">
        <div className="avatar-container">
          <img src={displayProfile.avatarUrl} alt="Avatar" className="avatar" />
          <div className={`status-dot ${displayProfile.status || 'online'}`}></div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item clickable" onClick={() => onShowFollowers && onShowFollowers()}>
            <span className="stat-value">{followStats?.followers || 0}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat-item clickable" onClick={() => onShowFollowing && onShowFollowing()}>
            <span className="stat-value">{followStats?.following || 0}</span>
            <span className="stat-label">Following</span>
          </div>
        </div>
      </div>

      <div className="header-info">
        <div className="name-row">
          <h1 className="name text-glow">{displayProfile.name}</h1>
          <div className="header-actions-row" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            {showFollowButton && (
              <button 
                className={`follow-btn ${isFollowing ? 'following' : ''}`} 
                onClick={onToggleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            {isPublicView && !isOwnProfile && (
              <button 
                className="message-btn-header"
                onClick={() => {
                  // We'll use a global event or a prop to open chat with this user
                  window.dispatchEvent(new CustomEvent('open-vibe-chat', { detail: { username: displayProfile.username } }));
                }}
                title="Send a disappearing Vibe"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </button>
            )}
          </div>
        </div>
        <p className="username-tag">@{displayProfile.username}</p>
        <p className="bio">{displayProfile.bio}</p>
      </div>
    </GlassCard>
  );
};

export default ProfileHeader;
