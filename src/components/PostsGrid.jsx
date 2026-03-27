import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './PostsGrid.css';

const PostsGrid = ({ username, refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.getUserPosts(username);
        setPosts(res.posts);
      } catch (err) {
        console.error("Posts fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchPosts();
  }, [username, refreshTrigger]);

  if (loading) return <div className="posts-skeleton">Loading Vibes...</div>;

  return (
    <div className="posts-container reveal-3">
      <div className="posts-header">
        <h3>My Gallery</h3>
        <span className="post-count">{posts.length} Posts</span>
      </div>
      
      {posts.length === 0 ? (
        <div className="no-posts-hint">
          No posts yet. Share your first vibe! ✨
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-item">
              <img src={post.image_url} alt={post.caption} loading="lazy" />
              {post.caption && (
                <div className="post-caption-overlay">
                  <span>{post.caption}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsGrid;
