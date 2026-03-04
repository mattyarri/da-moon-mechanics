import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EXAGGERATED_SCALE, EARTH_AXIAL_TILT } from '../../constants';

const AXIAL_TILT_RAD = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT);
const ROTATION_SPEED = 0.5; // radians per second (sped up for visibility)

export default function Earth({ position = [EXAGGERATED_SCALE.earthOrbitRadius, 0, 0] }) {
  const meshRef = useRef();
  const texture = useTexture('/textures/earth_daymap.jpg');

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += ROTATION_SPEED * delta;
    }
  });

  return (
    <group position={position}>
      <group rotation={[0, 0, AXIAL_TILT_RAD]}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <sphereGeometry args={[EXAGGERATED_SCALE.earthRadius, 64, 64]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </group>
    </group>
  );
}
