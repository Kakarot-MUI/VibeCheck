import './GlassCard.css';

const GlassCard = ({ children, className = '', hoverEffect = false, style = {} }) => {
  return (
    <div className={`glass-card ${hoverEffect ? 'glass-card-hover' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
