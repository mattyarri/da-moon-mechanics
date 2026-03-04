import * as THREE from 'three';

export default function EclipticPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[50, 250, 128]} />
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
