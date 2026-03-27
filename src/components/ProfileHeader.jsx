import vibeConfig from '../vibe-config.json';
import GlassCard from './GlassCard';
import './ProfileHeader.css';

const ProfileHeader = ({ profile }) => {
  // Use passed profile prop if available, otherwise fallback to config
  const displayProfile = profile || vibeConfig.profile;

  return (
    <GlassCard className="profile-header" hoverEffect={false}>
      <div className="avatar-container">
        <img src={displayProfile.avatarUrl} alt="Avatar" className="avatar" />
        <div className={`status-dot ${displayProfile.status || 'online'}`}></div>
      </div>
      <h1 className="name text-glow">{displayProfile.name}</h1>
      <p className="bio">{displayProfile.bio}</p>
    </GlassCard>
  );
};

export default ProfileHeader;
