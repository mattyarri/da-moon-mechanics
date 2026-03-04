import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera/CameraController';
import SolarSystem from './components/scene/SolarSystem';
import TimeControls from './components/ui/TimeControls';
import DataReadouts from './components/ui/DataReadouts';
import ViewToggles from './components/ui/ViewToggles';
import CameraPresets from './components/ui/CameraPresets';
import useSimulationTime from './hooks/useSimulationTime';
import useAstronomy from './hooks/useAstronomy';
import { EXAGGERATED_SCALE, ACCURATE_SCALE } from './constants';

export default function App() {
  const { simTime, isPlaying, speed, setSpeed, advance, togglePlaying } = useSimulationTime();
  const [accurateScale, setAccurateScale] = useState(false);
  const scale = accurateScale ? ACCURATE_SCALE : EXAGGERATED_SCALE;
  const astroData = useAstronomy(simTime, scale);
  const [overlays, setOverlays] = useState({
    orbitTrail: true,
    orbitalPlane: false,
    eclipticPlane: false,
    axisLine: false,
  });
  const [cameraMode, setCameraMode] = useState('free');

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
        <SolarSystem astroData={astroData} simTime={simTime} advance={advance} overlays={overlays} scale={scale} />
        <CameraController
          scale={scale}
          cameraMode={cameraMode}
          earthPos={astroData.earthPos}
          moonPos={astroData.moonPos}
          simTime={simTime}
        />
      </Canvas>
      <DataReadouts astroData={astroData} />
      <CameraPresets cameraMode={cameraMode} onSetMode={setCameraMode} />
      <ViewToggles
        overlays={overlays}
        onToggle={toggleOverlay}
        accurateScale={accurateScale}
        onToggleScale={() => setAccurateScale(s => !s)}
      />
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
