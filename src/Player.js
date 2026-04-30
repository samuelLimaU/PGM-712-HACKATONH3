import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

const Player = ({ setCollisions, obstacles, isFinished, updatePlayerPos }) => {
  const groupRef = useRef();
  const { mouse } = useThree();
  const [lastCollisionTime, setLastCollisionTime] = useState(0);
  const [spinDirection, setSpinDirection] = useState(1);

  // Gameplay Settings
  const horizontalSmoothness = 0.1; 
  const roadWidth = 24; 
  const limitX = roadWidth / 2 - 0.6; 
  
  // --- CONFIGURACIÓN DE COLISIÓN ---
  const collisionDuration = 1000; 

  useFrame((state, delta) => {
    if (groupRef.current && !isFinished) {
      const now = Date.now();
      const timeSinceCollision = now - lastCollisionTime;
      const isSpinning = timeSinceCollision < collisionDuration;

      // EL COCHE YA NO SE MUEVE EN Z. Se queda en 0.
      
      if (isSpinning) {
        // EFECTO DE CHOQUE: Girar y desplazarse lateralmente
        groupRef.current.rotation.y += delta * 15; 
        groupRef.current.position.x += spinDirection * 10 * delta; 
      } else {
        // MOVIMIENTO NORMAL: Seguir al ratón
        groupRef.current.rotation.y = 0; 
        const targetX = mouse.x * limitX;
        groupRef.current.position.x += (targetX - groupRef.current.position.x) * horizontalSmoothness;
      }
      
      // HARD LIMITS (Safety Clamp)
      groupRef.current.position.x = Math.max(-limitX, Math.min(limitX, groupRef.current.position.x));

      // Update parent for grid tracking (solo X, Z es 0)
      updatePlayerPos({ x: groupRef.current.position.x, z: 0 });

      // 5. Collision Detection
      // Los obstáculos ahora vienen HACIA nosotros, su Z aumenta.
      // El coche está en Z = 0.
      const playerPos = groupRef.current.position;
      const playerSize = [1.2, 0.6, 2.5];

      if (obstacles.current) {
        obstacles.current.forEach((obs) => {
          if (!obs || !obs.visible) return; // Solo chocamos con lo que se ve

          const dX = Math.abs(playerPos.x - obs.position.x);
          const dZ = Math.abs(0 - obs.position.z); // Jugador está en Z=0
          
          // Ajustamos dimensiones para el tamaño de la caja [2, 1, 2] del obstáculo
          if (dX < (playerSize[0] + 2) / 2 && dZ < (playerSize[2] + 2) / 2) {
            if (now - lastCollisionTime > collisionDuration + 200) {
              setCollisions(prev => prev + 1);
              setLastCollisionTime(now);
              setSpinDirection(Math.random() > 0.5 ? 1 : -1);
            }
          }
        });
      }

      // La cámara ahora es estática respecto al coche
      state.camera.position.set(0, 10, 8);
      state.camera.lookAt(0, 0, -5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Visual Car */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.5, 2.5]} />
        <meshStandardMaterial color="#ff00ff" />
      </mesh>
      <mesh castShadow position={[0, 0.7, -0.2]}>
        <boxGeometry args={[1, 0.4, 1.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

export default Player;
