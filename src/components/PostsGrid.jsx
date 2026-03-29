import { useState, useEffect } from 'react';
import { api } from '../services/api';
import PostCard from './PostCard';
import './PostsGrid.css';

const PostsGrid = ({ username, refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null); // for comment modal
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  
  const currentUserEmail = localStorage.getItem('vibe_email');

  const fetchPosts = async () => {
    try {
      const res = await api.getUserPosts(username, currentUserEmail);
      setPosts(res.posts);
    } catch (err) {
      console.error("Posts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchPosts();
  }, [username, refreshTrigger]);

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleShowComments = async (post) => {
    setActivePost(post);
    try {
      const res = await api.getComments(post.id);
      setComments(res.comments);
    } catch (err) {
      console.error("Fetch comments error:", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUserEmail) return alert("Login to comment! 🚀");
    if (!newComment.trim()) return;

    try {
      setPostingComment(true);
      await api.addComment(activePost.id, currentUserEmail, newComment);
      const res = await api.getComments(activePost.id);
      setComments(res.comments);
      setNewComment("");
      // Update local state for comment count
      setPosts(prev => prev.map(p => 
        p.id === activePost.id ? { ...p, comments_count: parseInt(p.comments_count) + 1 } : p
      ));
    } catch (err) {
      alert(err.message);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <div className="posts-skeleton">Syncing Gallery...</div>;

  return (
    <div className="posts-container reveal-3">
      <div className="posts-header">
        <h3>Vibe Gallery</h3>
        <span className="post-count">{posts.length} Vibes</span>
      </div>
      
      {posts.length === 0 ? (
        <div className="no-posts-hint">
          Nothing here yet. Drop a vibe! ✨
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              userEmail={currentUserEmail} 
              onDelete={handleDeletePost}
              onShowComments={handleShowComments}
            />
          ))}
        </div>
      )}

      {/* COMMENT MODAL */}
      {activePost && (
        <div className="modal-overlay" onClick={() => setActivePost(null)}>
          <div className="comment-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Vibe Comments</h4>
              <button className="close-btn" onClick={() => setActivePost(null)}>✕</button>
            </div>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Start the conversation! 💬</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="comment-item">
                    <img src={c.avatar_url} alt={c.username} className="comm-avatar" />
                    <div className="comm-body">
                      <span className="comm-user">@{c.username}</span>
                      <p className="comm-text">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form className="comment-form" onSubmit={handleAddComment}>
              <input 
                type="text" 
                placeholder="Say something nice..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                disabled={postingComment}
              />
              <button type="submit" disabled={postingComment || !newComment.trim()}>
                {postingComment ? "..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsGrid;
