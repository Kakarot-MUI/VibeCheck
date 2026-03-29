import { useEffect, useState } from 'react';
import { api } from '../services/api';
import './FollowListModal.css';

const FollowListModal = ({ username, type, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  <div className="go-arrow">→</div>
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
