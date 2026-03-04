import { Suspense } from 'react';
import Sun from './Sun';
import Earth from './Earth';
import Moon from './Moon';
import TimeAdvancer from './TimeAdvancer';

export default function SolarSystem({ astroData, advance }) {
  const { earthPos, moonPos } = astroData;

  return (
    <Suspense fallback={null}>
      <TimeAdvancer advance={advance} />
      <Sun />
      <Earth position={earthPos} />
      <Moon position={moonPos} />
    </Suspense>
  );
}
