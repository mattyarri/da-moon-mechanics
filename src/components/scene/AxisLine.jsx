import * as THREE from 'three';
import { EXAGGERATED_SCALE, EARTH_AXIAL_TILT } from '../../constants';

const AXIAL_TILT_RAD = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT);
const AXIS_LENGTH = EXAGGERATED_SCALE.earthRadius * 3;

export default function AxisLine({ earthPos }) {
  return (
    <group position={earthPos}>
      <group rotation={[0, 0, AXIAL_TILT_RAD]}>
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([0, -AXIS_LENGTH, 0, 0, AXIS_LENGTH, 0])}
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
