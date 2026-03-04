import { useMemo } from 'react';
import { getMoonOrbitTrail } from '../../utils/astronomy';
import { EXAGGERATED_SCALE } from '../../constants';

export default function OrbitTrail({ simTime }) {
  const trailKey = Math.floor(simTime.getTime() / 600000);

  const positions = useMemo(() => {
    const trail = getMoonOrbitTrail(simTime, EXAGGERATED_SCALE, 200);
    return new Float32Array(trail.flat());
  }, [trailKey]);

  return (
    <line key={trailKey}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.3} />
    </line>
  );
}
