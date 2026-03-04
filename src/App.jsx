import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera/CameraController';
import SolarSystem from './components/scene/SolarSystem';

export default function App() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 100, 300], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.05} />
        <SolarSystem />
        <CameraController />
      </Canvas>
    </div>
  );
}
