import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import './PhotoWidget.css';

const normalizeUnsplashUrl = (url) => {
  if (!url) return '';
  // Convert unsplash.com/photos/xyz to images.unsplash.com/photo-xyz
  if (url.includes('unsplash.com/photos/')) {
    const photoId = url.split('photos/')[1]?.split('?')[0];
    if (photoId) {
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&q=80`;
    }
  }
  return url;
};

const PhotoWidget = ({ text, imageUrl }) => {
  const defaultImage = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
  const [imgSrc, setImgSrc] = useState(normalizeUnsplashUrl(imageUrl) || defaultImage);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setImgSrc(normalizeUnsplashUrl(imageUrl) || defaultImage);
    setIsError(false);
  }, [imageUrl]);

  const handleImageError = () => {
    setIsError(true);
  };

  return (
    <GlassCard className="photo-widget" hoverEffect={false}>
      <div className={`polaroid ${isError ? 'error-state' : ''}`}>
        {isError ? (
          <div className="error-placeholder">
            <span className="error-icon">⚠️</span>
            <span className="error-text">Link Broken or Restricted</span>
            <span className="error-hint">Try a direct image link (.jpg)</span>
          </div>
        ) : (
          <>
            <img 
              src={imgSrc} 
              alt="Aesthetic Setup" 
              className="photo-img" 
              onError={handleImageError}
            />
            <div className="shine-overlay"></div>
          </>
        )}
      </div>
      <div className="photo-caption">
        <span className="pin">📌</span>
        <span style={{ fontFamily: 'var(--font-heading)' }}>{text || "Current Setup Vibe"}</span>
      </div>
    </GlassCard>
  );
};

export default PhotoWidget;
