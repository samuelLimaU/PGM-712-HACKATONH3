import React, { useMemo } from 'react';

const Obstacles = ({ count = 50, range = 40 }) => {
  const obstacles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * range,
        0,
        (Math.random() - 0.5) * range,
      ],
      size: [1 + Math.random() * 2, 2, 1 + Math.random() * 2],
      color: Math.random() > 0.5 ? 'red' : 'orange',
    }));
  }, [count, range]);

  return (
    <>
      {obstacles.map((obs) => (
        <mesh key={obs.id} position={obs.position} castShadow receiveShadow>
          <boxGeometry args={obs.size} />
          <meshStandardMaterial color={obs.color} />
        </mesh>
      ))}
    </>
  );
};

export default Obstacles;
