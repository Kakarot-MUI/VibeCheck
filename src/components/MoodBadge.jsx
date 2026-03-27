import GlassCard from './GlassCard';
import './MoodBadge.css';

const MoodBadge = ({ mood }) => {
  if (!mood) return null;

  return (
    <GlassCard className="mood-badge" style={{ borderRadius: '50px' }}>
      <div className="mood-content">
        <div className="status-indicator" style={{ backgroundColor: mood.color }}></div>
        <span className="mood-text">Current Vibe: {mood.vibe}</span>
      </div>
    </GlassCard>
  );
};

export default MoodBadge;
