import { useState } from 'react';
import { api } from '../services/api';
import './PostCard.css';

const PostCard = ({ post, userEmail, onDelete, onShowComments }) => {
  const [likes, setLikes] = useState(parseInt(post.likes_count) || 0);
  const [hasLiked, setHasLiked] = useState(post.has_liked);
  const [vibes, setVibes] = useState(parseInt(post.vibes_count) || 0);
  const [hasVibed, setHasVibed] = useState(post.has_vibed);
  const [isVibing, setIsVibing] = useState(false);
  
  // We use post.email directly from the DB response
  const isOwner = post.email === userEmail;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!userEmail) return alert("Login to like vibes! 🚀");
    try {
      if (hasLiked) {
        await api.unlikePost(post.id, userEmail);
        setLikes(prev => prev - 1);
        setHasLiked(false);
      } else {
        await api.likePost(post.id, userEmail);
        setLikes(prev => prev + 1);
        setHasLiked(true);
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleVibe = async (e) => {
    e.stopPropagation();
    if (!userEmail) return alert("Login to vibe! ✨");
    
    try {
      if (hasVibed) {
        // UNVIBE
        await api.unvibePost(post.id, userEmail);
        setVibes(prev => Math.max(0, prev - 1));
        setHasVibed(false);
      } else {
        // VIBE
        setIsVibing(true);
        await api.vibePost(post.id, userEmail);
        setVibes(prev => prev + 1);
        setHasVibed(true);
        // Particle effect duration
        setTimeout(() => setIsVibing(false), 1500);
      }
    } catch (err) {
      console.error("Vibe error:", err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this vibe from your gallery?")) {
      try {
        await api.deletePost(post.id, userEmail);
        onDelete(post.id);
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    onShowComments(post);
  };

  return (
    <div className={`post-card ${isVibing ? 'vibe-animating' : ''}`}>
      <div className="post-media">
        <img src={post.image_url} alt="Vibe" loading="lazy" />
        {isVibing && (
          <div className="vibe-check-overlay">
            <span className="vibe-text">VIBE CHECK</span>
            <div className="particles">
              {Array.from({ length: 24 }).map((_, i) => {
                const emojis = ['✨', '⭐', '💫', '💜', '🔥'];
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                return (
                  <div 
                    key={i} 
                    className="particle" 
                    style={{ 
                      '--delay': `${i * 0.05}s`, 
                      '--angle': `${i * 15}deg`,
                      '--scale': 0.5 + Math.random() 
                    }}
                  >
                    {emoji}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="post-details">
        {post.caption && <p className="caption">{post.caption}</p>}
        
        <div className="interaction-bar">
          <div className="main-actions">
            <button 
              className={`it-btn like ${hasLiked ? 'active' : ''}`} 
              onClick={handleLike}
              title="Like"
            >
              <span className="it-icon">{hasLiked ? '❤️' : '🤍'}</span>
              <span className="it-count">{likes}</span>
            </button>

            <button 
              className="it-btn comment" 
              onClick={handleCommentClick}
              title="Comments"
            >
              <span className="it-icon">💬</span>
              <span className="it-count">{post.comments_count}</span>
            </button>

            <button 
              className={`it-btn vibe-trigger ${hasVibed ? 'active' : ''}`} 
              onClick={handleVibe}
              title="Vibe Check"
            >
              <span className="it-icon">✨</span>
              <span className="it-count">{vibes}</span>
            </button>
          </div>

          {isOwner && (
            <button className="delete-btn" onClick={handleDelete} title="Delete Post">
              <span className="it-icon">🗑️</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
