import * as THREE from 'three';

export default function EclipticPlane({ scale }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[scale.earthOrbitRadius * 0.25, scale.earthOrbitRadius * 1.25, 128]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
