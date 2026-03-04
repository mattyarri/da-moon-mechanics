import { Suspense } from 'react';
import Sun from './Sun';
import Earth from './Earth';
import Moon from './Moon';
import TimeAdvancer from './TimeAdvancer';
import OrbitalPlane from './OrbitalPlane';
import EclipticPlane from './EclipticPlane';
import AxisLine from './AxisLine';
import OrbitTrail from './OrbitTrail';

export default function SolarSystem({ astroData, simTime, advance, overlays, scale }) {
  const { earthPos, moonPos, moonOrbitalNormal } = astroData;

  return (
    <Suspense fallback={null}>
      <TimeAdvancer advance={advance} />
      <Sun scale={scale} />
      <Earth position={earthPos} simTime={simTime} scale={scale} />
      <Moon position={moonPos} earthPos={earthPos} scale={scale} />
      {overlays.orbitTrail && <OrbitTrail simTime={simTime} scale={scale} />}
      {overlays.orbitalPlane && <OrbitalPlane earthPos={earthPos} moonOrbitalNormal={moonOrbitalNormal} scale={scale} />}
      {overlays.eclipticPlane && <EclipticPlane scale={scale} />}
      {overlays.axisLine && <AxisLine earthPos={earthPos} scale={scale} />}
    </Suspense>
  );
}
