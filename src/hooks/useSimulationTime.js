import { useState, useCallback } from 'react';

export default function useSimulationTime() {
  const [simTime, setSimTime] = useState(() => new Date());
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(100);

  const advance = useCallback((deltaSec) => {
    if (!isPlaying) return;
    setSimTime(prev => new Date(prev.getTime() + deltaSec * speed * 1000));
  }, [isPlaying, speed]);

  const togglePlaying = useCallback(() => setIsPlaying(p => !p), []);

  return { simTime, isPlaying, speed, setSpeed, setSimTime, advance, togglePlaying };
}
