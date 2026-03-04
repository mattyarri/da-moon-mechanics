import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera/CameraController';

export default function App() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 30, 50], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.1} />
        <CameraController />
      </Canvas>
    </div>
  );
}
