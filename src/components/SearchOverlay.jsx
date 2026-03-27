import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { api } from '../services/api';
import './SearchOverlay.css';

const SearchOverlay = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length > 1) {
        setSearching(true);
        try {
          const res = await api.searchUsers(query);
          setResults(res.results);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="search-overlay modal-overlay">
      <GlassCard className="search-modal reveal-1" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
        <div className="search-header">
          <input 
            autoFocus
            type="text" 
            placeholder="Search by name or ID..." 
            className="glass-input search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="search-results scrollable">
          {searching && <div className="search-status">Vibe checking...</div>}
          {!searching && results.length === 0 && query.length > 1 && (
            <div className="search-status">No vibes found for "{query}"</div>
          )}
          
          {results.map((user) => (
            <div 
              key={user.username} 
              className="search-result-item"
              onClick={() => window.location.href = `/u/${user.username}`}
            >
              <img src={user.avatar_url} alt={user.name} className="result-avatar" />
              <div className="result-info">
                <span className="result-name">{user.name}</span>
                <span className="result-id">@{user.username}</span>
              </div>
              <div className="visit-badge">Visit</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default SearchOverlay;
