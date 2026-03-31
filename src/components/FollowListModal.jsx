import { useEffect, useState } from 'react';
import { api } from '../services/api';
import './FollowListModal.css';

const FollowListModal = ({ username, type, currentUserEmail, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const myUsername = localStorage.getItem('vibe_username');
  const isMyProfile = username === myUsername;

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.getFollowList(username, type);
        setUsers(res.users);
      } catch (err) {
        console.error("Failed to fetch follow list:", err);
      } finally {
        setLoading(false);
      }
    };
    if (username && type) fetchList();
  }, [username, type]);

  const handleAction = async (e, targetUsername) => {
    e.stopPropagation();
    if (!currentUserEmail) return;

    try {
      if (type === 'followers') {
        await api.removeFollower(currentUserEmail, targetUsername);
      } else {
        await api.unfollowUser(currentUserEmail, targetUsername);
      }
      // Optimistic update: remove from local state immediately
      setUsers(prev => prev.filter(u => u.username !== targetUsername));
    } catch (err) {
      alert("Failed to update connections: " + err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="follow-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{type === 'followers' ? 'Followers' : 'Following'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="list-loader">Syncing connections...</div>
          ) : users.length === 0 ? (
            <div className="empty-list">No {type} found yet. ✨</div>
          ) : (
            <div className="user-list">
              {users.map((user) => (
                <div 
                  key={user.username} 
                  className="user-card"
                  onClick={() => window.location.href = `/u/${user.username}`}
                >
                  <img src={user.avatar_url || 'https://via.placeholder.com/150'} alt={user.username} className="user-avatar" />
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-handle">@{user.username}</span>
                  </div>
                  
                  {isMyProfile && (
                    <button 
                      className={`action-btn ${type === 'followers' ? 'remove-btn' : 'unfollow-btn'}`}
                      onClick={(e) => handleAction(e, user.username)}
                    >
                      {type === 'followers' ? 'Remove' : 'Unfollow'}
                    </button>
                  )}
                  {!isMyProfile && <div className="go-arrow">→</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
