import React, { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, ContactShadows } from '@react-three/drei';
import Player from './Player';

const Game = () => {
  const [collisions, setCollisions] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Point B (Meta) position
  const finishZ = -40;

  // Generate obstacle data
  const obstacleData = useMemo(() => {
    const count = 40;
    const range = 60;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * range, 
        0.5, 
        (Math.random() - 0.5) * (range - 20) - 10 // Avoid start area
      ],
      size: [1.5 + Math.random() * 2, 1, 1.5 + Math.random() * 2],
      color: 'red'
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFinished) {
        setElapsedTime(((Date.now() - startTime) / 1000).toFixed(2));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const handleReachFinish = () => {
    if (!isFinished) {
      setIsFinished(true);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {/* UI Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        color: 'white', 
        zIndex: 1, 
        fontSize: '20px', 
        fontFamily: 'monospace',
        pointerEvents: 'none',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        <div style={{ color: '#ff00ff' }}>MIDNIGHT RIDER 3D</div>
        <div style={{ marginTop: 10 }}>COLISIONES: {collisions}</div>
        <div>TIEMPO: {elapsedTime}s</div>
        {isFinished && (
          <div style={{ marginTop: 20, fontSize: '32px', color: 'yellow', fontWeight: 'bold' }}>
            ¡META ALCANZADA!
          </div>
        )}
      </div>

      <Canvas shadows camera={{ position: [0, 15, 20], fov: 50 }}>
        <Sky sunPosition={[100, 10, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} castShadow />
        <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />
        
        <Player 
          setCollisions={setCollisions} 
          obstacles={obstacleData} 
          isFinished={isFinished} 
          finishZ={finishZ}
          onReachFinish={handleReachFinish}
        />
        
        {/* Obstacles */}
        {obstacleData.map((obs) => (
          <mesh key={obs.id} position={obs.position} castShadow receiveShadow>
            <boxGeometry args={obs.size} />
            <meshStandardMaterial color={obs.color} emissive="red" emissiveIntensity={0.2} />
          </mesh>
        ))}

        {/* Finish Line (Point B) */}
        <mesh position={[0, 0, finishZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 2]} />
          <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#050505" />
        </mesh>
        
        <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={50} blur={2.5} far={10} />
      </Canvas>
    </div>
  );
};

export default Game;
