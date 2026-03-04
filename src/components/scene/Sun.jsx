import { useRef, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 240, 200, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 220, 150, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 200, 100, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 180, 80, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export default function Sun({ scale }) {
  const meshRef = useRef();
  const texture = useTexture(`${import.meta.env.BASE_URL}textures/sun.jpg`);
  const glowTexture = useMemo(createGlowTexture, []);

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[scale.sunRadius, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <sprite scale={[scale.earthOrbitRadius * 0.04, scale.earthOrbitRadius * 0.04, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <pointLight
        castShadow
        intensity={5}
        decay={0}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={scale.earthOrbitRadius * 2}
      />
    </group>
  );
}
