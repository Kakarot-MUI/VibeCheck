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
            src={data.albumArt} 
            alt="Album Art" 
            className={`album-art ${data.isPlaying ? 'spinning' : ''}`} 
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
