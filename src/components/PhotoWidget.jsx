import GlassCard from './GlassCard';
import './PhotoWidget.css';

const PhotoWidget = ({ text, imageUrl }) => {
  const defaultImage = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  const displayImage = (imageUrl && imageUrl.trim() !== '') ? imageUrl : defaultImage;

  return (
    <GlassCard className="photo-widget" hoverEffect={false}>
      <div className="polaroid">
        <img 
          src={displayImage} 
          alt="Aesthetic Setup" 
          className="photo-img" 
          onError={handleImageError}
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
