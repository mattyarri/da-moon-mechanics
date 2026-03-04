import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera/CameraController';
import SolarSystem from './components/scene/SolarSystem';
import TimeControls from './components/ui/TimeControls';
import DataReadouts from './components/ui/DataReadouts';
import ViewToggles from './components/ui/ViewToggles';
import useSimulationTime from './hooks/useSimulationTime';
import useAstronomy from './hooks/useAstronomy';

export default function App() {
  const { simTime, isPlaying, speed, setSpeed, advance, togglePlaying } = useSimulationTime();
  const astroData = useAstronomy(simTime);
  const [overlays, setOverlays] = useState({
    orbitTrail: true,
    orbitalPlane: false,
    eclipticPlane: false,
    axisLine: false,
  });

  const toggleOverlay = useCallback((key) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 100, 300], fov: 50, near: 0.001 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.15} />
        <SolarSystem astroData={astroData} simTime={simTime} advance={advance} overlays={overlays} />
        <CameraController />
      </Canvas>
      <DataReadouts astroData={astroData} />
      <ViewToggles overlays={overlays} onToggle={toggleOverlay} />
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
