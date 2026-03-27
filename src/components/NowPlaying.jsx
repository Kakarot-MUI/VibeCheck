import GlassCard from './GlassCard';
import './NowPlaying.css';

const NowPlaying = ({ data }) => {
  if (!data) return null;

  return (
    <GlassCard className="now-playing">
      <div className="music-header">
        <span className="music-label">NOW PLAYING</span>
        <div className="sound-wave">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>
      
      <div className="music-content">
        <div className="album-art-container">
          <img 
            src={data.albumArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"} 
            alt="Album Art" 
            className={`album-art ${data.isPlaying ? 'spinning' : ''}`}
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"; e.target.onError = null; }}
          />
        </div>
        <div className="track-info">
          <h3 className="track-title">{data.title}</h3>
          <p className="track-artist">{data.artist}</p>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: data.isPlaying ? '65%' : '0%' }}></div>
        </div>
      </div>
    </GlassCard>
  );
};

export default NowPlaying;
