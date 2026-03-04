import { Suspense } from 'react';
import Sun from './Sun';
import Earth from './Earth';

export default function SolarSystem() {
  return (
    <Suspense fallback={null}>
      <Sun />
      <Earth />
    </Suspense>
  );
}
