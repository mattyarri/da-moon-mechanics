import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_AXIAL_TILT } from '../../constants';

const AXIAL_TILT_RAD = THREE.MathUtils.degToRad(EARTH_AXIAL_TILT);
const SIDEREAL_DAY_MS = 86164.1 * 1000;
const SURFACE_LAT = 40 * (Math.PI / 180); // 40°N

function startTransition(transitionRef, camera, controlsRef, toPos, toTarget) {
  const t = transitionRef.current;
  t.active = true;
  t.start = performance.now() / 1000;
  t.duration = 1.0;
  t.fromPos = camera.position.clone();
  t.fromTarget = controlsRef.current?.target.clone() || new THREE.Vector3();
  t.toPos = toPos;
  t.toTarget = toTarget;
}

export default function CameraController({ scale, cameraMode, onSetMode, earthPos, moonPos, simTime }) {
  const controlsRef = useRef();
  const { camera, gl } = useThree();
  const transitionRef = useRef({ active: false });
  const prevScaleRef = useRef(scale);

  // Animate camera when switching to topDown
  useEffect(() => {
    if (cameraMode === 'topDown') {
      const height = scale.moonOrbitRadius * 3;
      startTransition(
        transitionRef, camera, controlsRef,
        new THREE.Vector3(earthPos[0], height, earthPos[2]),
        new THREE.Vector3(...earthPos),
      );
    }
  }, [cameraMode]);

  // Break out of topDown on user interaction
  useEffect(() => {
    if (cameraMode !== 'topDown') return;

    const handleInteraction = () => {
      if (!transitionRef.current.active) {
        onSetMode('free');
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', handleInteraction);
    return () => {
      canvas.removeEventListener('pointerdown', handleInteraction);
    };
  }, [cameraMode, gl, onSetMode]);

  // Animate camera to Earth when scale changes
  useEffect(() => {
    if (prevScaleRef.current !== scale) {
      prevScaleRef.current = scale;
      const viewDist = scale.moonOrbitRadius * 3;
      startTransition(
        transitionRef, camera, controlsRef,
        new THREE.Vector3(earthPos[0], viewDist * 0.5, earthPos[2] + viewDist),
        new THREE.Vector3(...earthPos),
      );
    }
  }, [scale]);

  useFrame(() => {
    const t = transitionRef.current;

    // Animated transition
    if (t.active) {
      const elapsed = performance.now() / 1000 - t.start;
      const progress = Math.min(elapsed / t.duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(t.fromPos, t.toPos, ease);
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(t.fromTarget, t.toTarget, ease);
      }

      if (progress >= 1) {
        t.active = false;
      }
      return;
    }

    // Top-down: track Earth until user interacts
    if (cameraMode === 'topDown' && controlsRef.current) {
      const height = camera.position.y - controlsRef.current.target.y;
      controlsRef.current.target.set(earthPos[0], earthPos[1], earthPos[2]);
      camera.position.set(earthPos[0], earthPos[1] + height, earthPos[2]);
    }

    // Earth surface mode
    if (cameraMode === 'earthSurface') {
      const rotationY = (simTime.getTime() / SIDEREAL_DAY_MS) * Math.PI * 2;

      const r = scale.earthRadius * 1.05;
      const cosLat = Math.cos(SURFACE_LAT);
      const sinLat = Math.sin(SURFACE_LAT);

      const localX = r * cosLat * Math.sin(rotationY);
      const localY = r * sinLat;
      const localZ = r * cosLat * Math.cos(rotationY);

      // Apply axial tilt (rotate around X by -tilt, matching Earth.jsx)
      const tiltedX = localX;
      const tiltedY = localY * Math.cos(AXIAL_TILT_RAD) + localZ * Math.sin(AXIAL_TILT_RAD);
      const tiltedZ = -localY * Math.sin(AXIAL_TILT_RAD) + localZ * Math.cos(AXIAL_TILT_RAD);

      const upVec = new THREE.Vector3(tiltedX, tiltedY, tiltedZ).normalize();
      camera.up.copy(upVec);

      camera.position.set(
        earthPos[0] + tiltedX,
        earthPos[1] + tiltedY,
        earthPos[2] + tiltedZ,
      );

      camera.lookAt(moonPos[0], moonPos[1], moonPos[2]);
    }
  });

  if (cameraMode === 'earthSurface') {
    return null;
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={cameraMode === 'free' || cameraMode === 'topDown'}
      enableRotate={cameraMode === 'free'}
      enablePan={cameraMode === 'free'}
      enableDamping
      dampingFactor={0.05}
      minDistance={0.001}
      maxDistance={scale.earthOrbitRadius * 3}
      zoomSpeed={1}
      zoomToCursor
    />
  );
}
