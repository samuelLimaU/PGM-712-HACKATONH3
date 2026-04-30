import React from 'react';
import './HUD.css';

const HUD = ({ currentLevel, collisions, elapsedTime, isFinished, maxLevels }) => {
  const isCompleted = isFinished && parseFloat(elapsedTime) >= 200;

  return (
    <div className="hud-container">
      <div className="hud-top-left">
        <div className="hud-level">
          {isCompleted ? (
            <span className="hud-completed-badge">SYSTEM STABLE - COMPLETED</span>
          ) : (
            `PHASE: ${currentLevel} / ${maxLevels}`
          )}
        </div>
        
        <div className="hud-stat">
          <span>DATA CORRUPTION:</span>
          <span className="hud-stat-value" style={{ color: collisions > 5 ? '#ff4444' : '#ffffff' }}>
            {collisions} ERRORS
          </span>
        </div>
        
        <div className="hud-stat">
          <span>UPLINK TIME:</span>
          <span className="hud-stat-value">{elapsedTime}s</span>
        </div>

        {!isFinished && (
          <div className="hud-stat" style={{ fontSize: '12px', opacity: 0.7, marginTop: '10px' }}>
            STATUS: BROADCASTING_NEON_DATA...
          </div>
        )}
      </div>
    </div>
  );
};

export default HUD;
