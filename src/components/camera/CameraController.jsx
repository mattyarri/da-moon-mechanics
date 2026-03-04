import { OrbitControls } from '@react-three/drei';

export default function CameraController({ scale }) {
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={0.001}
      maxDistance={scale.earthOrbitRadius * 3}
      zoomSpeed={1}
      zoomToCursor
    />
  );
}
