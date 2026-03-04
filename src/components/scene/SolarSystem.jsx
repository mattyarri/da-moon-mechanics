import { Suspense } from 'react';
import Sun from './Sun';
import Earth from './Earth';
import Moon from './Moon';
import TimeAdvancer from './TimeAdvancer';
import useAstronomy from '../../hooks/useAstronomy';

export default function SolarSystem({ simTime, advance }) {
  const { earthPos, moonPos } = useAstronomy(simTime);

  return (
    <Suspense fallback={null}>
      <TimeAdvancer advance={advance} />
      <Sun />
      <Earth position={earthPos} />
      <Moon position={moonPos} />
    </Suspense>
  );
}
