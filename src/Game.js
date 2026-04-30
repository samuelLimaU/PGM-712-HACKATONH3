
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import Player from './Player';
import RetroEffects from './RetroEffects';

// Componente para manejar múltiples obstáculos de forma eficiente
const ObstacleManager = ({ currentLevel, forwardSpeed, setCollisions, isFinished, updatePlayerPos }) => {
  const roadWidth = 24;
  const poolSize = 300; // Ajustado para balancear rendimiento y densidad
  const obstaclesRef = useRef([]);
  
  // Datos iniciales estáticos (no cambian en cada frame)
  const obstacleData = useMemo(() => 
    Array.from({ length: poolSize }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * (roadWidth - 4),
      z: -i * 25 - 50,
      size: [2, 1, 2],
      color: i % 2 === 0 ? '#00ffff' : '#ff00ff'
    })), [poolSize, roadWidth]
  );

  useFrame((state, delta) => {
    if (isFinished) return;

    const count = Math.floor(60 * Math.pow(1.5, currentLevel - 1));

    obstaclesRef.current.forEach((mesh, i) => {
      if (!mesh) return;

      // Movimiento manual de la posición Z (directo al objeto, sin re-render de React)
      mesh.position.z += forwardSpeed * delta;
      
      // Activar/Desactivar según nivel
      mesh.visible = i < count;

      // Reciclaje
      if (mesh.position.z > 15) {
        mesh.position.z = -poolSize * 15 + (Math.random() * 50);
        mesh.position.x = (Math.random() - 0.5) * (roadWidth - 4);
      }
    });
  });

  // Pasamos los datos a Player para colisiones (Player usará las posiciones de los meshes)
  return (
    <>
      <Player 
        setCollisions={setCollisions} 
        obstacles={obstaclesRef} // Pasamos la REF, no el estado
        isFinished={isFinished} 
        updatePlayerPos={updatePlayerPos}
        forwardSpeed={forwardSpeed}
      />
      {obstacleData.map((data, i) => (
        <mesh 
          key={data.id} 
          position={[data.x, 0.5, data.z]} 
          ref={el => obstaclesRef.current[i] = el}
        >
          <boxGeometry args={data.size} />
          <meshStandardMaterial 
            color={data.color} 
            emissive={data.color} 
            emissiveIntensity={4} 
          />
        </mesh>
      ))}
    </>
  );
};

const ScrollingRoad = ({ forwardSpeed, isFinished }) => {
  const textureRef = useRef();
  const roadWidth = 24;
  const roadLength = 200;

  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Fondo transparente (no dibujamos fillRect)
    ctx.clearRect(0, 0, 128, 128);
    
    // Bordes blancos muy definidos
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2; // Línea más fina para que sea elegante
    ctx.strokeRect(0, 0, 128, 128);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 40); // Más divisiones laterales (6 en lugar de 4)
    return tex;
  }, []);

  useFrame((state, delta) => {
    if (!isFinished && textureRef.current && textureRef.current.offset) {
      // Movimiento suave de la textura
      textureRef.current.offset.y -= (forwardSpeed / roadLength) * delta * 10;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -roadLength / 2 + 10]}>
      <planeGeometry args={[roadWidth, roadLength]} />
      <meshStandardMaterial 
        map={gridTexture} 
        ref={textureRef} 
        transparent={true} // Permitir transparencia
        opacity={0.8}     // Un poco de opacidad para que se vea el fondo negro
        emissive="#ffffff"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
};

const Game = () => {
  const [collisions, setCollisions] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
  
  // Lógica de niveles y fin de juego
  const levelDuration = 20;
  const maxLevels = 10;
  const currentLevel = Math.min(Math.floor(elapsedTime / levelDuration) + 1, maxLevels);
  const forwardSpeed = 20 + currentLevel * 8;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFinished) {
        const time = (Date.now() - startTime) / 1000;
        setElapsedTime(time.toFixed(2));
        
        // Condición de victoria: completar 10 niveles
        if (time >= levelDuration * maxLevels) {
          setIsFinished(true);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative', cursor: isFinished ? 'auto' : 'none' }}>
      {/* UI de Juego */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, color: '#00ffff', zIndex: 1, 
        fontFamily: 'monospace', pointerEvents: 'none', textShadow: '0 0 10px #00ffff'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff00ff' }}>
          {isFinished && elapsedTime >= 200 ? 'COMPLETED' : `LEVEL: ${currentLevel}`}
        </div>
        <div>ERRORS: {collisions}</div>
        <div>TIME: {elapsedTime}s</div>
      </div>

      {/* Pantalla de Resultados */}
      {isFinished && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)', padding: '40px', border: '2px solid #ff00ff',
          color: '#00ffff', textAlign: 'center', zIndex: 10, fontFamily: 'monospace',
          boxShadow: '0 0 20px #ff00ff'
        }}>
          <h1 style={{ color: '#ff00ff', fontSize: '40px', margin: '0 0 20px 0' }}>MISSION ACCOMPLISHED</h1>
          <p style={{ fontSize: '20px' }}>FINAL TIME: {elapsedTime}s</p>
          <p style={{ fontSize: '20px' }}>TOTAL ERRORS: {collisions}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px', padding: '10px 20px', backgroundColor: '#ff00ff',
              color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'monospace',
              fontWeight: 'bold'
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      <Canvas camera={{ fov: 45, position: [0, 10, 15] }}>
        <color attach="background" args={['#050505']} />
        <Stars radius={100} depth={50} count={500} factor={4} fade speed={0.5} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 20, 0]} intensity={0.5} />
        
        <ScrollingRoad forwardSpeed={forwardSpeed} isFinished={isFinished} />
        
        <ObstacleManager 
          currentLevel={currentLevel}
          forwardSpeed={forwardSpeed}
          setCollisions={setCollisions}
          isFinished={isFinished}
          updatePlayerPos={setPlayerPos}
        />

        <RetroEffects />
      </Canvas>
    </div>
  );
};

export default Game;