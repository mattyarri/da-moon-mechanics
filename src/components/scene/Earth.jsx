import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EXAGGERATED_SCALE, EARTH_AXIAL_TILT } from '../../constants';

const AXIAL_TILT_RAD = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT);
const SIDEREAL_DAY_MS = 86164.1 * 1000; // 23h 56m 4.1s

export default function Earth({ position, simTime }) {
  const meshRef = useRef();
  const texture = useTexture('/textures/earth_daymap.jpg');

  // Derive rotation directly from simulation time
  const rotationY = (simTime.getTime() / SIDEREAL_DAY_MS) * Math.PI * 2;

  return (
    <group position={position}>
      <group rotation={[0, 0, AXIAL_TILT_RAD]}>
        <mesh ref={meshRef} castShadow receiveShadow rotation={[0, rotationY, 0]}>
          <sphereGeometry args={[EXAGGERATED_SCALE.earthRadius, 64, 64]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </group>
    </group>
  );
}
