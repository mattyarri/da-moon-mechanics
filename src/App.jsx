import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera/CameraController';
import SolarSystem from './components/scene/SolarSystem';
import TimeControls from './components/ui/TimeControls';
import useSimulationTime from './hooks/useSimulationTime';

export default function App() {
  const { simTime, isPlaying, speed, setSpeed, advance, togglePlaying } = useSimulationTime();

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 100, 300], fov: 50, near: 0.001 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.15} />
        <SolarSystem simTime={simTime} advance={advance} />
        <CameraController />
      </Canvas>
      <TimeControls
        simTime={simTime}
        isPlaying={isPlaying}
        speed={speed}
        onTogglePlay={togglePlaying}
        onSetSpeed={setSpeed}
      />
    </div>
  );
}
