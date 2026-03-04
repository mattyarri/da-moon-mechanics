import { useRef } from 'react';
import { useTexture } from '@react-three/drei';

export default function Sun({ scale }) {
  const meshRef = useRef();
  const texture = useTexture('/textures/sun.jpg');

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[scale.sunRadius, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <pointLight
        castShadow
        intensity={5}
        decay={0}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={scale.earthOrbitRadius * 2}
      />
    </group>
  );
}
