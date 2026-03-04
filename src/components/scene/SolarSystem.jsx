import { Suspense } from 'react';
import Sun from './Sun';
import Earth from './Earth';
import Moon from './Moon';
import useAstronomy from '../../hooks/useAstronomy';

export default function SolarSystem() {
  const now = new Date();
  const { earthPos, moonPos, moonPhaseName, moonIllumination } = useAstronomy(now);

  return (
    <Suspense fallback={null}>
      <Sun />
      <Earth position={earthPos} />
      <Moon position={moonPos} />
    </Suspense>
  );
}
