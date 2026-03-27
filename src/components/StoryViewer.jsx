import { useState, useEffect } from 'react';
import './StoryViewer.css';

const StoryViewer = ({ userStories, onClose }) => {
  const [index, setIndex] = useState(0);
  const current = userStories.stories[index];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < userStories.stories.length - 1) {
        setIndex(index + 1);
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [index, userStories.stories.length, onClose]);

  return (
    <div className="story-viewer-overlay">
      <div className="story-viewer-container">
        {/* Progress Bars */}
        <div className="story-progress-container">
          {userStories.stories.map((_, i) => (
            <div key={i} className="story-progress-bar">
               <div 
                className={`story-progress-fill ${i < index ? 'completed' : (i === index ? 'active' : '')}`}
               ></div>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="story-viewer-header">
          <div className="user-info">
            <img src={userStories.avatar} alt={userStories.username} className="viewer-avatar" />
            <span className="viewer-name">{userStories.name}</span>
          </div>
          <button className="close-viewer" onClick={onClose}>&times;</button>
        </div>

        {/* Image Content */}
        <div className="story-content">
          <img src={current.image_url} alt="Story" className="story-image" />
        </div>

        {/* Navigation Areas */}
        <div className="story-nav left" onClick={() => index > 0 && setIndex(index - 1)}></div>
        <div className="story-nav right" onClick={() => index < userStories.stories.length - 1 && setIndex(index + 1)}></div>
      </div>
    </div>
  );
};

export default StoryViewer;
