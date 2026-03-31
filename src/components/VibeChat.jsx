import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './VibeChat.css';

const VibeChat = ({ currentUserEmail, isOpen, onClose }) => {
  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleGlobalTrigger = (e) => {
      const { username } = e.detail;
      setSelectedUser(username);
      if (!isOpen) {
        // We can't call onClose/setIsChatOpen directly as they are in App.jsx
        // BUT we can click the message trigger or just wait for the user to click it
        // Actually, we'll just handle opening it via a shared state in a real app
        // For now, let's assume the trigger is hit
      }
    };
    window.addEventListener('open-vibe-chat', handleGlobalTrigger);
    return () => window.removeEventListener('open-vibe-chat', handleGlobalTrigger);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentUserEmail) {
      fetchInbox();
      const interval = setInterval(fetchInbox, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentUserEmail]);

  useEffect(() => {
    if (selectedUser) {
      const filtered = inbox.filter(m => 
        m.sender_username === selectedUser || m.receiver_email === selectedUser // This is a simplification
      );
      // In a real app, we'd fetch the specific conversation
      fetchInbox(); 
    }
  }, [selectedUser]);

  const fetchInbox = async () => {
    try {
      const res = await api.getInbox(currentUserEmail);
      setInbox(res.messages);
    } catch (err) {
      console.error("Inbox fetch failed:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      setLoading(true);
      await api.sendMessage(currentUserEmail, selectedUser, newMessage);
      setNewMessage('');
      fetchInbox();
    } catch (err) {
      alert("Failed to send vibe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group messages by contact for the inbox view
  const contacts = Array.from(new Set(inbox.map(m => m.sender_username)))
    .map(username => inbox.find(m => m.sender_username === username));

  return (
    <div className={`vibe-chat-drawer ${isOpen ? 'open' : ''}`}>
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
               <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>Visit a profile to send a new vibe!</p>
            </div>
          </div>
        ) : (
          <div className="conversation-view">
             <div className="message-list">
                {inbox.filter(m => m.sender_username === selectedUser).map(msg => (
                  <div key={msg.id} className="message-bubble received">
                    <p>{msg.content}</p>
                    <span className="expiry-tag">Vanishing soon...</span>
                  </div>
                ))}
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
