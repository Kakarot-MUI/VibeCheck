import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './StoriesBar.css';

const StoriesBar = ({ onSelectStory, onAddStory, userAvatar }) => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.getStoriesFeed();
        setFeed(res.feed);
      } catch (err) {
        console.error("Stories feed error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="stories-bar-container reveal-1">
      <div className="stories-label">Global Vibes ✨</div>
      <div className="stories-scroll">
        <div className="story-circle-wrapper add-story" onClick={onAddStory}>
          <div className="story-circle">
            <img src={userAvatar} alt="Add" />
            <div className="add-icon">+</div>
          </div>
          <span className="story-username">You</span>
        </div>

        {loading ? (
          <div className="stories-skeleton"></div>
        ) : (
          feed.map((item) => (
            <div 
              key={item.username} 
              className="story-circle-wrapper" 
              onClick={() => onSelectStory(item)}
            >
              <div className="story-circle ring-active">
                <img src={item.avatar} alt={item.username} />
              </div>
              <span className="story-username">{item.name.split(' ')[0]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoriesBar;
