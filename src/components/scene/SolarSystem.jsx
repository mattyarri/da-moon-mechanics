import { Suspense } from 'react';
import Sun from './Sun';
import Earth from './Earth';
import Moon from './Moon';
import TimeAdvancer from './TimeAdvancer';
import OrbitalPlane from './OrbitalPlane';
import EclipticPlane from './EclipticPlane';
import AxisLine from './AxisLine';
import OrbitTrail from './OrbitTrail';

export default function SolarSystem({ astroData, simTime, advance, overlays }) {
  const { earthPos, moonPos, moonOrbitalNormal } = astroData;

  return (
    <Suspense fallback={null}>
      <TimeAdvancer advance={advance} />
      <Sun />
      <Earth position={earthPos} simTime={simTime} />
      <Moon position={moonPos} earthPos={earthPos} />
      {overlays.orbitTrail && <OrbitTrail simTime={simTime} />}
      {overlays.orbitalPlane && <OrbitalPlane earthPos={earthPos} moonOrbitalNormal={moonOrbitalNormal} />}
      {overlays.eclipticPlane && <EclipticPlane />}
      {overlays.axisLine && <AxisLine earthPos={earthPos} />}
    </Suspense>
  );
}
