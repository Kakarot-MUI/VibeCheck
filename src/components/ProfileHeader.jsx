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
          {showFollowButton && (
            <button 
              className={`follow-btn ${isFollowing ? 'following' : ''}`} 
              onClick={onToggleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        <p className="username-tag">@{displayProfile.username}</p>
        <p className="bio">{displayProfile.bio}</p>
      </div>
    </GlassCard>
  );
};

export default ProfileHeader;
