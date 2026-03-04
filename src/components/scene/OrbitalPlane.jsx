import { useMemo } from 'react';
import * as THREE from 'three';
import { EXAGGERATED_SCALE } from '../../constants';

export default function OrbitalPlane({ earthPos, moonOrbitalNormal }) {
  const quaternion = useMemo(() => {
    const up = new THREE.Vector3(0, 0, 1);
    const normal = new THREE.Vector3(...moonOrbitalNormal);
    return new THREE.Quaternion().setFromUnitVectors(up, normal);
  }, [moonOrbitalNormal]);

  return (
    <mesh position={earthPos} quaternion={quaternion}>
      <ringGeometry args={[EXAGGERATED_SCALE.moonOrbitRadius * 0.3, EXAGGERATED_SCALE.moonOrbitRadius * 1.2, 128]} />
      <meshBasicMaterial
        color="#4488ff"
        transparent
        opacity={0.08}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
