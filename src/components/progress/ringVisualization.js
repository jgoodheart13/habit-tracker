import React, { useState, useEffect } from 'react';
import RingProgressGraph from '../RingProgressGraph';

/**
 * Ring visualization for progress tracking
 * Wrapper around the existing RingProgressGraph component
 */
export default function RingVisualization({
  dailyP1Percent,
  weeklyP1Percent,
  P1_done,
  P1_total,
  P1_done_today,
  idealP1ForToday,
  P2_done,
  P2_scale,
  P1_points,
  P2_points,
  totalPoints,
  weeklyPaceMarker,
}) {
  const basePoints = 5;
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: isMobile ? 16 : 0,
      }}
    >
      {/* Left Column: Stats */}
      <div style={{ 
        flex: isMobile ? 'none' : 1, 
        textAlign: isMobile ? 'center' : 'left', 
        fontSize: 14,
        width: isMobile ? '100%' : 'auto',
      }}>
        <strong>Core W</strong> {P1_done}/{P1_total} <br />
        <strong>Core T:</strong> {P1_done_today}/{idealP1ForToday} <br />
        <strong>Core P:</strong> +{P1_points.toFixed(1)}
        <br />
        <strong>Reach W:</strong> {P2_done} <br />
        <strong>Reach BP:</strong> x{(P2_scale * basePoints).toFixed(1)} <br />
        <strong>Reach P:</strong> +{P2_points.toFixed(1)} <br />
        <strong>Total:</strong> {totalPoints.toFixed(1)} pts <br />
      </div>

      {/* Center Column: Ring */}
      <div style={{ 
        flex: isMobile ? 'none' : 1, 
        display: 'flex', 
        justifyContent: 'center',
        width: isMobile ? '100%' : 'auto',
      }}>
        <RingProgressGraph
          dailyP1={dailyP1Percent}
          weeklyP1={weeklyP1Percent}
          p2Count={P2_done}
          weeklyPaceMarker={weeklyPaceMarker}
        />
      </div>

      {!isMobile && <div style={{ flex: 1 }}></div>}
    </div>
  );
}
