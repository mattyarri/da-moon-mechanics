import { useFrame } from '@react-three/fiber';

export default function TimeAdvancer({ advance }) {
  useFrame((_, delta) => advance(delta));
  return null;
}
