import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

const Player = ({ setCollisions, obstacles, isFinished, finishZ, onReachFinish }) => {
  const meshRef = useRef();
  const { viewport, mouse } = useThree();
  const [lastCollisionTime, setLastCollisionTime] = useState(0);

  useFrame((state, delta) => {
    if (meshRef.current && !isFinished) {
      // Map mouse position to viewport coordinates
      // X is horizontal, Z is depth (moved with mouse Y)
      const targetX = (mouse.x * viewport.width) / 2;
      const targetZ = -(mouse.y * viewport.height) / 2;
      
      // Smooth movement
      meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.1;
      meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;

      // Ensure it stays above ground
      meshRef.current.position.y = 0.5;

      const playerPos = meshRef.current.position;
      const playerSize = [1, 0.5, 2];

      // Check Finish Line
      if (playerPos.z <= finishZ) {
        onReachFinish();
      }

      // Collision Detection
      obstacles.forEach((obs) => {
        const dX = Math.abs(playerPos.x - obs.position[0]);
        const dZ = Math.abs(playerPos.z - obs.position[2]);
        
        if (dX < (playerSize[0] + obs.size[0]) / 2 && dZ < (playerSize[2] + obs.size[2]) / 2) {
          const now = Date.now();
          if (now - lastCollisionTime > 800) { // Cooldown
            setCollisions(prev => prev + 1);
            setLastCollisionTime(now);
            
            // Visual feedback
            meshRef.current.material.emissive.set('red');
            meshRef.current.material.emissiveIntensity = 1;
            setTimeout(() => {
              if (meshRef.current) {
                meshRef.current.material.emissive.set('black');
                meshRef.current.material.emissiveIntensity = 0;
              }
            }, 300);
          }
        }
      });
    }
  });

  return (
    <mesh ref={meshRef} castShadow position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 0.5, 2]} />
      <meshStandardMaterial color="purple" emissive="black" emissiveIntensity={0} />
    </mesh>
  );
};

export default Player;
