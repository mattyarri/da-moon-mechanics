import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera/CameraController';
import SolarSystem from './components/scene/SolarSystem';
import TimeControls from './components/ui/TimeControls';
import DataReadouts from './components/ui/DataReadouts';
import useSimulationTime from './hooks/useSimulationTime';
import useAstronomy from './hooks/useAstronomy';

export default function App() {
  const { simTime, isPlaying, speed, setSpeed, advance, togglePlaying } = useSimulationTime();
  const astroData = useAstronomy(simTime);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 100, 300], fov: 50, near: 0.001 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.15} />
        <SolarSystem astroData={astroData} advance={advance} />
        <CameraController />
      </Canvas>
      <DataReadouts astroData={astroData} />
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
