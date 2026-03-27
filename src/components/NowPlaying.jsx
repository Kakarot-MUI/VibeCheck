import { useState } from 'react';
import GlassCard from './GlassCard';
import './NowPlaying.css';

const NowPlaying = ({ data, musicUrl }) => {
  const [isPlayerView, setIsPlayerView] = useState(false);
  if (!data) return null;

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('spotify.com')) {
      return url.replace('spotify.com', 'spotify.com/embed');
    }
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
       const id = url.split('/').pop().split('?')[0];
       return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(musicUrl);

  return (
    <GlassCard className="now-playing">
      <div className="music-header">
        <span className="music-label">NOW PLAYING</span>
        <div className="header-right" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {embedUrl && (
            <button 
              type="button"
              className="player-toggle-mini" 
              onClick={() => setIsPlayerView(!isPlayerView)}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              {isPlayerView ? 'Status' : 'Play 🎵'}
            </button>
          )}
          <div className="sound-wave">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </div>
      
      {isPlayerView && embedUrl ? (
        <div className="player-embed-container" style={{ marginTop: '1rem' }}>
          <iframe 
            src={embedUrl} 
            width="100%" 
            height="152" 
            frameBorder="0" 
            allowtransparency="true" 
            allow="encrypted-media"
            style={{ borderRadius: '12px' }}
          ></iframe>
        </div>
      ) : (
        <div className="music-content reveal-1">
          <div className="album-art-container">
            <img 
              src={data.albumArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"} 
              alt="Album Art" 
              className={`album-art ${data.isPlaying ? 'spinning' : ''}`}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"; e.target.onError = null; }}
            />
          </div>
          <div className="track-info">
            <h3 className="track-title">{data.title || "No music playing"}</h3>
            <p className="track-artist">{data.artist || "---"}</p>
          </div>
        </div>
      )}

      {!isPlayerView && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: data.isPlaying ? '65%' : '0%' }}></div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default NowPlaying;
