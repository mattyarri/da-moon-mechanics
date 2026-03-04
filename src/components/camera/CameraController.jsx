import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_AXIAL_TILT } from '../../constants';

const AXIAL_TILT_RAD = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT);
const SIDEREAL_DAY_MS = 86164.1 * 1000;
const SURFACE_LAT = 40 * (Math.PI / 180); // 40°N

export default function CameraController({ scale, cameraMode, earthPos, moonPos, simTime }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const transitionRef = useRef({ active: false, start: 0, duration: 1.0, from: {}, to: {} });

  // Start transition when mode changes to topDown
  useEffect(() => {
    if (cameraMode === 'topDown') {
      const t = transitionRef.current;
      t.active = true;
      t.start = performance.now() / 1000;
      t.duration = 1.0;
      t.fromPos = camera.position.clone();
      t.fromTarget = controlsRef.current?.target.clone() || new THREE.Vector3();
      t.toPos = new THREE.Vector3(earthPos[0], scale.earthOrbitRadius * 0.8, earthPos[2]);
      t.toTarget = new THREE.Vector3(...earthPos);
    }
  }, [cameraMode]);

  useFrame(() => {
    const t = transitionRef.current;

    // Animated transition (for topDown snap)
    if (t.active) {
      const elapsed = performance.now() / 1000 - t.start;
      const progress = Math.min(elapsed / t.duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      camera.position.lerpVectors(t.fromPos, t.toPos, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(t.fromTarget, t.toTarget, ease);
      }

      if (progress >= 1) {
        t.active = false;
      }
      return;
    }

    // Earth surface mode: continuously position camera on Earth's surface
    if (cameraMode === 'earthSurface') {
      const rotationY = (simTime.getTime() / SIDEREAL_DAY_MS) * Math.PI * 2;

      // Position on Earth's surface at 40°N, rotated with Earth
      const r = scale.earthRadius * 1.05;
      const cosLat = Math.cos(SURFACE_LAT);
      const sinLat = Math.sin(SURFACE_LAT);

      // Local surface position (before Earth tilt and rotation)
      const localX = r * cosLat * Math.sin(rotationY);
      const localY = r * sinLat;
      const localZ = r * cosLat * Math.cos(rotationY);

      // Apply axial tilt (rotate around Z)
      const tiltedX = localX * Math.cos(AXIAL_TILT_RAD) - localY * Math.sin(AXIAL_TILT_RAD);
      const tiltedY = localX * Math.sin(AXIAL_TILT_RAD) + localY * Math.cos(AXIAL_TILT_RAD);
      const tiltedZ = localZ;

      camera.position.set(
        earthPos[0] + tiltedX,
        earthPos[1] + tiltedY,
        earthPos[2] + tiltedZ,
      );

      // Look at Moon
      camera.lookAt(moonPos[0], moonPos[1], moonPos[2]);
      camera.up.set(tiltedX, tiltedY, tiltedZ).normalize();

      if (controlsRef.current) {
        controlsRef.current.target.set(moonPos[0], moonPos[1], moonPos[2]);
      }
    }
  });

  const orbitEnabled = cameraMode === 'free' || (cameraMode === 'topDown' && !transitionRef.current.active);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={orbitEnabled}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.001}
      maxDistance={scale.earthOrbitRadius * 3}
      zoomSpeed={1}
      zoomToCursor
    />
  );
}
