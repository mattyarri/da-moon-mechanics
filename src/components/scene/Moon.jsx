import { useRef, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EXAGGERATED_SCALE } from '../../constants';

export default function Moon({ position, earthPos }) {
  const meshRef = useRef();
  const texture = useTexture('/textures/moon.jpg');

  // Tidal locking: Moon always faces Earth
  const rotation = useMemo(() => {
    const dx = earthPos[0] - position[0];
    const dz = earthPos[2] - position[2];
    return [0, Math.atan2(dx, dz), 0];
  }, [position, earthPos]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      <sphereGeometry args={[EXAGGERATED_SCALE.moonRadius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
