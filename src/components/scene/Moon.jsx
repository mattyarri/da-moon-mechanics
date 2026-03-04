import { useRef, useMemo } from 'react';
import { useTexture } from '@react-three/drei';

export default function Moon({ position, earthPos, scale }) {
  const meshRef = useRef();
  const texture = useTexture(`${import.meta.env.BASE_URL}textures/moon.jpg`);

  const rotation = useMemo(() => {
    const dx = earthPos[0] - position[0];
    const dy = earthPos[1] - position[1];
    const dz = earthPos[2] - position[2];
    const yaw = Math.atan2(dx, dz);
    const dist = Math.sqrt(dx * dx + dz * dz);
    const pitch = -Math.atan2(dy, dist);
    return [pitch, yaw, 0];
  }, [position, earthPos]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      <sphereGeometry args={[scale.moonRadius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
