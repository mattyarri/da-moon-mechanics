import { useState, useCallback, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraController from './components/camera/CameraController';
import SolarSystem from './components/scene/SolarSystem';
import TimeControls from './components/ui/TimeControls';
import DataReadouts from './components/ui/DataReadouts';
import ViewToggles from './components/ui/ViewToggles';
import CameraPresets from './components/ui/CameraPresets';
import InfoPanel from './components/ui/InfoPanel';
import useSimulationTime from './hooks/useSimulationTime';
import useAstronomy from './hooks/useAstronomy';
import useNotableEvents from './hooks/useNotableEvents';
import { EXAGGERATED_SCALE, ACCURATE_SCALE } from './constants';

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#0a0a1a] text-white">
          <div className="text-center px-6">
            <p className="text-lg mb-2">Something went wrong loading the scene.</p>
            <p className="text-white/50 text-sm mb-4">This can happen if your browser blocked WebGL or textures failed to load.</p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { simTime, isPlaying, speed, setSpeed, setSimTime, advance, togglePlaying } = useSimulationTime();
  const [accurateScale, setAccurateScale] = useState(false);
  const scale = accurateScale ? ACCURATE_SCALE : EXAGGERATED_SCALE;
  const astroData = useAstronomy(simTime, scale);
  const events = useNotableEvents();
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
      <ErrorBoundary>
        <Canvas
          shadows
          camera={{ position: [0, 100, 300], fov: 50, near: 0.01, far: 100000 }}
          gl={{ antialias: true, powerPreference: 'default' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('WebGL context lost');
            });
          }}
        >
          <color attach="background" args={['#0a0a1a']} />
          <ambientLight intensity={0.15} />
          <SolarSystem astroData={astroData} simTime={simTime} advance={advance} overlays={overlays} scale={scale} />
          <CameraController
            scale={scale}
            cameraMode={cameraMode}
            onSetMode={setCameraMode}
            earthPos={astroData.earthPos}
            moonPos={astroData.moonPos}
            simTime={simTime}
          />
        </Canvas>
      </ErrorBoundary>
      <DataReadouts astroData={astroData} simTime={simTime} events={events} />
      <CameraPresets cameraMode={cameraMode} onSetMode={setCameraMode} />
      <ViewToggles
        overlays={overlays}
        onToggle={toggleOverlay}
        accurateScale={accurateScale}
        onToggleScale={() => setAccurateScale(s => !s)}
      />
      <InfoPanel />
      <TimeControls
        simTime={simTime}
        isPlaying={isPlaying}
        speed={speed}
        onTogglePlay={togglePlaying}
        onSetSpeed={setSpeed}
        onSetDate={setSimTime}
        events={events}
      />
    </div>
  );
}
