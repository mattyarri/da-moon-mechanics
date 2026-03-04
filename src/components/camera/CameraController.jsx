import { OrbitControls } from '@react-three/drei';

export default function CameraController() {
  return (
    <OrbitControls
      enableDamping
      dampingFactor={0.05}
      minDistance={5}
      maxDistance={500}
    />
  );
}
