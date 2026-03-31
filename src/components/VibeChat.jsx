import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './VibeChat.css';

const VibeChat = ({ currentUser, isOpen, onClose, initialTarget }) => {
  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync with initialTarget prop (from App state or Events)
  useEffect(() => {
    if (initialTarget) {
      setSelectedUser(initialTarget);
    }
  }, [initialTarget]);

  useEffect(() => {
    const handleGlobalTrigger = (e) => {
      const { username } = e.detail;
      setSelectedUser(username);
    };
    window.addEventListener('open-vibe-chat', handleGlobalTrigger);
    return () => window.removeEventListener('open-vibe-chat', handleGlobalTrigger);
  }, []);

  useEffect(() => {
    if (isOpen && currentUser?.email) {
      fetchInbox();
      const interval = setInterval(fetchInbox, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentUser?.email]);

  const fetchInbox = async () => {
    try {
      const res = await api.getInbox(currentUser.email);
      setInbox(res.messages || []);
    } catch (err) {
      console.error("Inbox fetch failed:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      setLoading(true);
      await api.sendMessage(currentUser.email, selectedUser, newMessage);
      setNewMessage('');
      fetchInbox();
    } catch (err) {
      alert("Failed to send vibe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Derivative: Contacts (people the user has exchanged vibes with)
  const contactsMap = {};
  inbox.forEach(msg => {
    const isSent = msg.sender_email === currentUser?.email;
    const contactUsername = isSent ? msg.receiver_username : msg.sender_username;
    const contactName = isSent ? msg.receiver_name : msg.sender_name;
    const contactAvatar = isSent ? msg.receiver_avatar : msg.sender_avatar;

    if (!contactsMap[contactUsername]) {
      contactsMap[contactUsername] = {
        username: contactUsername,
        name: contactName,
        avatar: contactAvatar,
        lastMessage: msg.content,
        id: msg.id
      };
    }
  });
  const contacts = Object.values(contactsMap);

  return (
    <div className={`vibe-chat-container drawer ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <div className="header-info">
          <span className="vibe-dot"></span>
          <h3>{selectedUser ? `@${selectedUser}` : 'Vibe Chats'}</h3>
        </div>
        <div className="header-actions">
           {selectedUser && <button className="back-btn" onClick={() => setSelectedUser(null)}>←</button>}
           <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="chat-body">
        {!selectedUser ? (
          <div className="inbox-list">
            <div className="disappear-warning">
              ⚡ Vibes vanish in 24 hours
            </div>
            {contacts.length === 0 ? (
              <div className="empty-inbox">No active vibes yet. ✨</div>
            ) : (
              contacts.map((msg) => (
                <div key={msg.id} className="contact-item" onClick={() => setSelectedUser(msg.sender_username)}>
                  <div className="avatar-wrap">
                    <img src={msg.sender_avatar || 'https://via.placeholder.com/150'} alt={msg.sender_name} />
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{msg.sender_name}</span>
                    <span className="contact-preview">{msg.content.substring(0, 30)}...</span>
                  </div>
                  <div className="msg-time">New</div>
                </div>
              ))
            )}
            <div className="setup-hint" style={{ marginTop: '2rem', textAlign: 'center' }}>
               <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Search for a friend to start a vibe!</p>
            </div>
          </div>
        ) : (
          <div className="conversation-view">
             <div className="message-list">
                {inbox
                  .filter(m => (m.sender_username === selectedUser && m.receiver_email === currentUser?.email) || (m.receiver_username === selectedUser && m.sender_email === currentUser?.email))
                  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                  .map(msg => {
                    const isSent = msg.sender_email === currentUser?.email;
                    return (
                      <div key={msg.id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                        <p>{msg.content}</p>
                        <span className="expiry-tag">{isSent ? 'Sent' : 'Vanishing soon...'}</span>
                      </div>
                    );
                  })}
             </div>
             <form className="message-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Send a disappearing vibe..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading}>
                  {loading ? '...' : '→'}
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibeChat;
