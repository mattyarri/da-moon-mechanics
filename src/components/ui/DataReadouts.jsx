import { useState, useMemo } from 'react';

function getSeason(date) {
  const year = date.getFullYear();
  // Approximate season boundaries (Northern Hemisphere)
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();
  const md = month * 100 + day;
  if (md < 320) return 'Winter';
  if (md < 621) return 'Spring';
  if (md < 922) return 'Summer';
  if (md < 1221) return 'Autumn';
  return 'Winter';
}

function getNextEclipse(events, simTime) {
  const t = simTime.getTime();
  for (const e of events) {
    if (e.date.getTime() > t && (e.type.includes('eclipse') || e.type.includes('Eclipse'))) {
      const daysAway = Math.round((e.date.getTime() - t) / 86400000);
      return { type: e.type, date: e.date, daysAway };
    }
  }
  return null;
}

export default function DataReadouts({ astroData, simTime, events }) {
  const [expanded, setExpanded] = useState(false);
  const { moonPhaseName, moonIllumination, moonDistanceKm, moonOrbitalNormal } = astroData;

  const season = useMemo(() => getSeason(simTime), [simTime]);
  const nextEclipse = useMemo(() => getNextEclipse(events, simTime), [events, simTime]);

  // Orbital inclination: angle between Moon orbital normal and ecliptic normal (scene +Y)
  const inclination = useMemo(() => {
    const [nx, ny, nz] = moonOrbitalNormal;
    const dot = ny; // dot product with [0, 1, 0]
    return Math.acos(Math.abs(dot)) * (180 / Math.PI);
  }, [moonOrbitalNormal]);

  return (
    <div
      className="absolute top-14 sm:top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm cursor-pointer select-none max-w-[calc(100vw-2rem)]"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="px-4 py-2">
        <div className="font-medium">{moonPhaseName}</div>
        <div className="text-white/60 text-xs">{moonIllumination.toFixed(1)}% illuminated</div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 px-4 py-2 space-y-1 text-xs text-white/70">
          <div className="flex justify-between gap-6">
            <span>Earth–Moon</span>
            <span className="font-mono">{Math.round(moonDistanceKm).toLocaleString()} km</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Phase angle</span>
            <span className="font-mono">{astroData.moonPhaseAngle.toFixed(1)}&deg;</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Orbital inclination</span>
            <span className="font-mono">{inclination.toFixed(1)}&deg;</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Season (N. Hemisphere)</span>
            <span>{season}</span>
          </div>
          {nextEclipse && (
            <div className="border-t border-white/5 pt-1 mt-1">
              <div className="text-white/50">Next eclipse</div>
              <div className="text-white/90">
                {nextEclipse.type} — {nextEclipse.date.toISOString().slice(0, 10)}
                <span className="text-white/40 ml-1">({nextEclipse.daysAway}d)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
