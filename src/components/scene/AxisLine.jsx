import * as THREE from 'three';
import { EARTH_AXIAL_TILT } from '../../constants';

const AXIAL_TILT_RAD = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT);

export default function AxisLine({ earthPos, scale }) {
  const axisLength = scale.earthRadius * 3;

  return (
    <group position={earthPos}>
      <group rotation={[-AXIAL_TILT_RAD, 0, 0]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([0, -axisLength, 0, 0, axisLength, 0])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff6644" transparent opacity={0.6} />
        </line>
      </group>
    </group>
  );
}
