// src/ui/HUD.js
import React from 'react';
import './HUD.css';

const HUD = ({ collisions, elapsedTime, playerPos, currentLevel }) => {
  // Calcular distancia basada en tiempo y velocidad
  const forwardSpeed = 20 + currentLevel * 8;
  const estimatedDistance = Math.floor(elapsedTime * forwardSpeed);
  
  return (
    <div className="hud-container">
      
      {/* Panel Superior Izquierdo */}
      <div className="hud-panel-left">
        <div className="game-title">
          MIDNIGHT RIDER
          <span className="game-subtitle">(CHILL)</span>
        </div>

        <div className="stats-card">
          {/* Nivel */}
          <div className="stat-item">
            <div className="stat-icon">⚡</div>
            <div>
              <div className="stat-label">LEVEL</div>
              <div className="stat-value level">{currentLevel}</div>
            </div>
          </div>

          {/* Colisiones */}
          <div className="stat-item">
            <div className="stat-icon">💥</div>
            <div>
              <div className="stat-label">ERRORS</div>
              <div className="stat-value collisions">{collisions}</div>
            </div>
          </div>

          {/* Tiempo */}
          <div className="stat-item">
            <div className="stat-icon">⏱️</div>
            <div>
              <div className="stat-label">TIME</div>
              <div className="stat-value time">{elapsedTime}s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Superior Derecho */}
      <div className="hud-panel-right">
        {/* Distancia recorrida (estimada) */}
        <div className="distance-card">
          <div className="distance-label">🏁 DISTANCE</div>
          <div className="distance-value">{estimatedDistance}m</div>
        </div>

        {/* Velocidad actual */}
        <div className="speed-card">
          <div className="speed-label">⚡ SPEED</div>
          <div className="speed-value">{Math.floor(forwardSpeed)}</div>
        </div>
      </div>

      {/* Efecto de colisión (opcional - se activa con la prop collisionActive si la agregas después) */}
      <div className="hud-scanlines" />
    </div>
  );
};

export default HUD;