import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateString = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <GlassCard className="clock-widget" style={{ textAlign: 'center', padding: '1.5rem' }}>
      <div style={{ 
        fontFamily: 'var(--font-heading)', 
        fontSize: '2.5rem', 
        fontWeight: 800, 
        letterSpacing: '2px',
        color: 'var(--text-main)',
        textShadow: '0 0 20px var(--accent-primary)',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {timeString}
      </div>
      <div style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.9rem', 
        textTransform: 'uppercase', 
        letterSpacing: '3px',
        marginTop: '0.5rem',
        fontWeight: 600
      }}>
        {dateString}
      </div>
    </GlassCard>
  );
};

export default ClockWidget;
