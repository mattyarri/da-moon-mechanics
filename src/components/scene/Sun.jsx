import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { EXAGGERATED_SCALE } from '../../constants';

export default function Sun() {
  const meshRef = useRef();
  const texture = useTexture('/textures/sun.jpg');

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[EXAGGERATED_SCALE.sunRadius, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <pointLight
        castShadow
        intensity={5}
        decay={0}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={500}
      />
    </group>
  );
}
