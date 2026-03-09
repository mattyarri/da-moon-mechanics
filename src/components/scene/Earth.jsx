import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SiderealTime, MakeTime } from 'astronomy-engine';
import { EARTH_AXIAL_TILT } from '../../constants';

const AXIAL_TILT_RAD = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT);

export default function Earth({ position, simTime, scale }) {
  const texture = useTexture(`${import.meta.env.BASE_URL}textures/earth_daymap.jpg`);

  // Use GMST to correctly orient continents relative to the Sun
  const gmstHours = SiderealTime(MakeTime(simTime));
  const rotationY = (gmstHours / 24) * Math.PI * 2;

  return (
    <group position={position}>
      <group rotation={[-AXIAL_TILT_RAD, 0, 0]}>
        <mesh castShadow receiveShadow rotation={[0, rotationY, 0]}>
          <sphereGeometry args={[scale.earthRadius, 64, 64]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </group>
    </group>
  );
}
