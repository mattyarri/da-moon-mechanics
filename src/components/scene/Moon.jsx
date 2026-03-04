import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { EXAGGERATED_SCALE } from '../../constants';

export default function Moon({ position = [0, 0, 0] }) {
  const meshRef = useRef();
  const texture = useTexture('/textures/moon.jpg');

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <sphereGeometry args={[EXAGGERATED_SCALE.moonRadius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
