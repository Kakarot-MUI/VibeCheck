import GlassCard from './GlassCard';
import './PhotoWidget.css';

const PhotoWidget = ({ text }) => {
  return (
    <GlassCard className="photo-widget" hoverEffect={false}>
      <div className="polaroid">
        <img 
          src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
          alt="Aesthetic Setup" 
          className="photo-img" 
        />
        <div className="shine-overlay"></div>
      </div>
      <div className="photo-caption">
        <span className="pin">📌</span>
        <span style={{ fontFamily: 'var(--font-heading)' }}>{text || "Current Setup Vibe"}</span>
      </div>
    </GlassCard>
  );
};

export default PhotoWidget;
